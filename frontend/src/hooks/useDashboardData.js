import { useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const activeStatuses = new Set(['pending', 'processing']);

const toNumber = (value) => Number(value || 0);

const emptyMetrics = {
  grossRevenue: 0,
  activeOrders: 0,
  totalProducts: 0,
  totalCustomers: 0,
  totalUnitsSold: 0,
  averageOrderValue: 0,
  topProducts: [],
  revenueOverview: monthLabels.map((name) => ({ name, revenue: 0 })),
  insightCount: 0,
};

const getMonthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const calculateDashboardMetrics = ({ products, customers, orders, orderItems, aiInsights }) => {
  const completedOrders = orders.filter((order) => order.status === 'completed');
  const grossRevenue = completedOrders.reduce((sum, order) => sum + toNumber(order.total), 0);
  const activeOrders = orders.filter((order) => activeStatuses.has(order.status)).length;
  const completedOrderIds = new Set(completedOrders.map((order) => order.id));
  const productNamesById = new Map(products.map((product) => [product.id, product.name]));

  const productSales = orderItems
    .filter((item) => completedOrderIds.has(item.order_id))
    .reduce((sales, item) => {
      const current = sales.get(item.product_id) || {
        name: productNamesById.get(item.product_id) || 'Unknown Product',
        sales: 0,
        revenue: 0,
      };

      current.sales += toNumber(item.quantity);
      current.revenue += toNumber(item.quantity) * toNumber(item.price);
      sales.set(item.product_id, current);
      return sales;
    }, new Map());

  const topProducts = [...productSales.values()]
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5)
    .map((product) => ({
      ...product,
      name: product.name.length > 14 ? `${product.name.slice(0, 13)}...` : product.name,
    }));

  const currentYear = new Date().getFullYear();
  const monthlyRevenue = new Map(monthLabels.map((name, index) => [`${currentYear}-${String(index + 1).padStart(2, '0')}`, { name, revenue: 0 }]));

  completedOrders.forEach((order) => {
    const date = new Date(order.created_at);
    if (date.getFullYear() !== currentYear) return;
    const month = monthlyRevenue.get(getMonthKey(date));
    if (month) {
      month.revenue += toNumber(order.total);
    }
  });

  return {
    grossRevenue,
    activeOrders,
    totalProducts: products.length,
    totalCustomers: customers.length,
    totalUnitsSold: topProducts.reduce((sum, product) => sum + product.sales, 0),
    averageOrderValue: completedOrders.length ? grossRevenue / completedOrders.length : 0,
    topProducts,
    revenueOverview: [...monthlyRevenue.values()],
    insightCount: aiInsights.length,
  };
};

export const useDashboardData = () => {
  const [state, setState] = useState({
    loading: true,
    error: '',
    data: {
      products: [],
      customers: [],
      orders: [],
      orderItems: [],
      aiInsights: [],
    },
  });

  useEffect(() => {
    let cancelled = false;

    const fetchDashboardData = async () => {
      if (!isSupabaseConfigured) {
        console.error('[Supabase connection test] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.');
        setState((current) => ({
          ...current,
          loading: false,
          error: 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.',
        }));
        return;
      }

      setState((current) => ({ ...current, loading: true, error: '' }));

      const productsConnectionTest = await supabase
        .from('products')
        .select('id,name,price,stock,created_at')
        .limit(5);

      console.log('[Supabase connection test] products result:', {
        data: productsConnectionTest.data,
        error: productsConnectionTest.error,
      });

      if (productsConnectionTest.error) {
        setState({
          loading: false,
          error: productsConnectionTest.error.message,
          data: {
            products: [],
            customers: [],
            orders: [],
            orderItems: [],
            aiInsights: [],
          },
        });
        return;
      }

      const [
        customersResult,
        ordersResult,
        orderItemsResult,
        aiInsightsResult,
      ] = await Promise.all([
        supabase.from('customers').select('id,name,email,created_at'),
        supabase.from('orders').select('id,customer_id,total,status,created_at'),
        supabase.from('order_items').select('id,order_id,product_id,quantity,price'),
        supabase.from('ai_insights').select('id,title,body,created_at'),
      ]);

      const failed = [customersResult, ordersResult, orderItemsResult, aiInsightsResult].find((result) => result.error);
      if (cancelled) return;

      if (failed) {
        setState({
          loading: false,
          error: failed.error.message,
          data: {
            products: [],
            customers: [],
            orders: [],
            orderItems: [],
            aiInsights: [],
          },
        });
        return;
      }

      setState({
        loading: false,
        error: '',
        data: {
          products: productsConnectionTest.data || [],
          customers: customersResult.data || [],
          orders: ordersResult.data || [],
          orderItems: orderItemsResult.data || [],
          aiInsights: aiInsightsResult.data || [],
        },
      });
    };

    fetchDashboardData();

    return () => {
      cancelled = true;
    };
  }, []);

  const metrics = useMemo(() => calculateDashboardMetrics(state.data), [state.data]);
  const hasData = state.data.products.length > 0
    || state.data.customers.length > 0
    || state.data.orders.length > 0
    || state.data.orderItems.length > 0;

  return {
    ...state,
    metrics: hasData ? metrics : emptyMetrics,
    hasData,
  };
};
