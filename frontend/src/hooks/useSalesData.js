import { useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const toNumber = (value) => Number(value || 0);

const emptyMetrics = {
  totalRevenue: 0,
  totalOrders: 0,
  completedOrders: 0,
  avgOrderValue: 0,
  monthlyRevenue: monthLabels.map((name) => ({ name, revenue: 0 })),
  topProducts: [],
  leaderboard: [],
};

const calculateSalesMetrics = ({ orders, orderItems, products }) => {
  const completedOrders = orders.filter((order) => order.status === 'completed');
  const completedOrderIds = new Set(completedOrders.map((order) => order.id));
  const totalRevenue = completedOrders.reduce((sum, order) => sum + toNumber(order.total), 0);
  const productNamesById = new Map(products.map((product) => [product.id, product.name]));

  const currentYear = new Date().getFullYear();
  const monthlyRevenue = new Map(
    monthLabels.map((name, index) => [
      `${currentYear}-${String(index + 1).padStart(2, '0')}`,
      { name, revenue: 0 },
    ])
  );

  completedOrders.forEach((order) => {
    const date = new Date(order.created_at);
    if (date.getFullYear() !== currentYear) return;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const month = monthlyRevenue.get(key);
    if (month) month.revenue += toNumber(order.total);
  });

  const productTotals = orderItems
    .filter((item) => completedOrderIds.has(item.order_id))
    .reduce((totals, item) => {
      const productId = item.product_id;
      const current = totals.get(productId) || {
        id: productId,
        name: productNamesById.get(productId) || 'Unknown Product',
        sales: 0,
        revenue: 0,
      };

      current.sales += toNumber(item.quantity);
      current.revenue += toNumber(item.quantity) * toNumber(item.price);
      totals.set(productId, current);
      return totals;
    }, new Map());

  const sortedProducts = [...productTotals.values()].sort((a, b) => {
    if (b.sales !== a.sales) return b.sales - a.sales;
    return b.revenue - a.revenue;
  });

  return {
    totalRevenue,
    totalOrders: orders.length,
    completedOrders: completedOrders.length,
    avgOrderValue: completedOrders.length ? totalRevenue / completedOrders.length : 0,
    monthlyRevenue: [...monthlyRevenue.values()],
    topProducts: sortedProducts.slice(0, 10).map((product) => ({
      ...product,
      name: product.name.length > 18 ? `${product.name.slice(0, 17)}...` : product.name,
    })),
    leaderboard: sortedProducts.slice(0, 4),
  };
};

export const useSalesData = () => {
  const [state, setState] = useState({
    loading: true,
    error: '',
    data: {
      orders: [],
      orderItems: [],
      products: [],
    },
  });

  useEffect(() => {
    let cancelled = false;

    const fetchSalesData = async () => {
      if (!isSupabaseConfigured) {
        setState((current) => ({
          ...current,
          loading: false,
          error: 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.',
        }));
        return;
      }

      setState((current) => ({ ...current, loading: true, error: '' }));

      const [ordersResult, orderItemsResult, productsResult] = await Promise.all([
        supabase.from('orders').select('id,customer_id,total,status,created_at'),
        supabase.from('order_items').select('id,order_id,product_id,quantity,price'),
        supabase.from('products').select('id,name,price,stock,created_at'),
      ]);

      if (cancelled) return;

      const failed = [ordersResult, orderItemsResult, productsResult].find((result) => result.error);
      if (failed?.error) {
        setState({
          loading: false,
          error: failed.error.message,
          data: {
            orders: [],
            orderItems: [],
            products: [],
          },
        });
        return;
      }

      setState({
        loading: false,
        error: '',
        data: {
          orders: ordersResult.data || [],
          orderItems: orderItemsResult.data || [],
          products: productsResult.data || [],
        },
      });
    };

    fetchSalesData();

    return () => {
      cancelled = true;
    };
  }, []);

  const metrics = useMemo(() => calculateSalesMetrics(state.data), [state.data]);
  const hasData = state.data.orders.length > 0 || state.data.orderItems.length > 0 || state.data.products.length > 0;

  return {
    ...state,
    hasData,
    metrics: hasData ? metrics : emptyMetrics,
  };
};
