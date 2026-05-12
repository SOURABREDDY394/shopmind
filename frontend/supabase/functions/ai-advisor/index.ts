import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    ...corsHeaders,
    'Content-Type': 'application/json',
  },
});

const toNumber = (value: unknown) => Number(value || 0);

const normalizeMessage = (message: string) => message
  .toLowerCase()
  .replace(/[^\p{L}\p{N}\s]/gu, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const isGreetingOrCasual = (message: string) => {
  const normalized = normalizeMessage(message);
  const casualMessages = new Set([
    'hi',
    'hii',
    'hiii',
    'hello',
    'hey',
    'heyy',
    'yo',
    'sup',
    'good morning',
    'good afternoon',
    'good evening',
    'thanks',
    'thank you',
    'ok',
    'okay',
    'cool',
    'nice',
  ]);

  return casualMessages.has(normalized) || /^hi+\s+(there|bro|buddy|shopmind)$/.test(normalized);
};

const businessKeywords = [
  'product',
  'products',
  'customer',
  'customers',
  'order',
  'orders',
  'revenue',
  'sales',
  'sale',
  'inventory',
  'stock',
  'restock',
  'price',
  'pricing',
  'profit',
  'margin',
  'gross',
  'completed',
  'pending',
  'processing',
  'quantity',
  'sold',
  'top',
  'dashboard',
  'business',
  'shop',
  'store',
];

const isBusinessQuestion = (message: string) => {
  const normalized = normalizeMessage(message);
  return businessKeywords.some((keyword) => new RegExp(`\\b${keyword}\\b`, 'i').test(normalized));
};

const summarizeBusinessData = (
  products: Array<Record<string, unknown>>,
  customers: Array<Record<string, unknown>>,
  orders: Array<Record<string, unknown>>,
  orderItems: Array<Record<string, unknown>>,
) => {
  const completedOrders = orders.filter((order) => order.status === 'completed');
  const activeOrders = orders.filter((order) => ['pending', 'processing'].includes(String(order.status)));
  const completedOrderIds = new Set(completedOrders.map((order) => order.id));
  const productNameById = new Map(products.map((product) => [product.id, product.name]));

  const productSales = new Map<string, { name: unknown; quantity: number; revenue: number }>();
  orderItems
    .filter((item) => completedOrderIds.has(item.order_id))
    .forEach((item) => {
      const productId = String(item.product_id);
      const current = productSales.get(productId) || {
        name: productNameById.get(item.product_id) || 'Unknown Product',
        quantity: 0,
        revenue: 0,
      };
      current.quantity += toNumber(item.quantity);
      current.revenue += toNumber(item.quantity) * toNumber(item.price);
      productSales.set(productId, current);
    });

  const topProducts = [...productSales.values()]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const grossRevenue = completedOrders.reduce((sum, order) => sum + toNumber(order.total), 0);
  const lowStockProducts = products
    .filter((product) => toNumber(product.stock) <= 5)
    .map((product) => ({
      name: product.name,
      stock: product.stock,
      price: product.price,
    }));

  return {
    counts: {
      products: products.length,
      customers: customers.length,
      orders: orders.length,
      completedOrders: completedOrders.length,
      activeOrders: activeOrders.length,
    },
    grossRevenue,
    averageCompletedOrderValue: completedOrders.length ? grossRevenue / completedOrders.length : 0,
    topProducts,
    lowStockProducts,
  };
};

const askOpenRouter = async (question: string, businessSummary: unknown) => {
  const apiKey = Deno.env.get('OPENROUTER_API_KEY');
  if (!apiKey) return null;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': Deno.env.get('APP_URL') || 'http://localhost:5174',
      'X-Title': 'ShopMind AI Advisor',
    },
    body: JSON.stringify({
      model: Deno.env.get('OPENROUTER_MODEL') || 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are ShopMind AI Advisor. Answer only business questions about products, customers, orders, revenue, inventory, sales, pricing, stock, and retail operations. Use only the supplied business data. If data is sparse, say what is missing and suggest the next data to collect. Keep answers concise and practical.',
        },
        {
          role: 'user',
          content: JSON.stringify({ question, businessSummary }),
        },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenRouter request failed: ${detail}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
};

serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const { question } = await request.json();
    if (!question || typeof question !== 'string') {
      return json({ error: 'Question is required.' }, 400);
    }

    if (isGreetingOrCasual(question)) {
      return json({
        answer: 'Hey! Ask me anything about your products, orders, revenue, inventory, or customers.',
        businessSummary: null,
        route: 'casual',
      });
    }

    if (!isBusinessQuestion(question)) {
      return json({
        answer: 'I am here to help with ShopMind business questions. Ask me about products, orders, revenue, inventory, customers, sales, or pricing.',
        businessSummary: null,
        route: 'out_of_scope',
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      return json({ error: 'Supabase Edge Function is missing SUPABASE_URL or Supabase key secret.' }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const [productsResult, customersResult, ordersResult, orderItemsResult] = await Promise.all([
      supabase.from('products').select('id,name,price,stock,created_at').limit(500),
      supabase.from('customers').select('id,name,email,created_at').limit(500),
      supabase.from('orders').select('id,customer_id,total,status,created_at').limit(500),
      supabase.from('order_items').select('id,order_id,product_id,quantity,price').limit(1000),
    ]);

    const failed = [productsResult, customersResult, ordersResult, orderItemsResult].find((result) => result.error);
    if (failed?.error) {
      return json({ error: failed.error.message }, 500);
    }

    const businessSummary = summarizeBusinessData(
      productsResult.data || [],
      customersResult.data || [],
      ordersResult.data || [],
      orderItemsResult.data || [],
    );

    const answer = await askOpenRouter(question, businessSummary);

    if (!answer) {
      return json({
        error: 'OpenRouter is not configured. Add OPENROUTER_API_KEY as a Supabase Edge Function secret.',
        businessSummary,
      }, 500);
    }

    return json({
      answer,
      businessSummary,
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unknown AI Advisor error.' }, 500);
  }
});
