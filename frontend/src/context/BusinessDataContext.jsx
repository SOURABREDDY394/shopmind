import React, { createContext, useContext, useMemo, useState } from 'react';

const PRODUCTS_KEY = 'shopmind.products';
const CUSTOMERS_KEY = 'shopmind.customers';
const SETTINGS_KEY = 'shopmind.settings';

const initialProducts = [
  { id: 1, name: 'Premium Espresso Machine', category: 'Appliances', stock: 12, price: 899, cost: 520, status: 'In Stock' },
  { id: 2, name: 'Artisan Coffee Grinder', category: 'Appliances', stock: 5, price: 249, cost: 132, status: 'Low Stock' },
  { id: 3, name: 'Organic Sumatra Beans', category: 'Coffee', stock: 48, price: 18.5, cost: 8.25, status: 'In Stock' },
  { id: 4, name: 'Ceramic Pour-Over Set', category: 'Accessories', stock: 0, price: 45, cost: 21, status: 'Out of Stock' },
  { id: 5, name: 'Double-Walled Glass Set', category: 'Accessories', stock: 24, price: 32, cost: 14, status: 'In Stock' },
  { id: 6, name: 'French Press Classic', category: 'Appliances', stock: 8, price: 55, cost: 25, status: 'In Stock' },
  { id: 7, name: 'Milk Frother Pro', category: 'Appliances', stock: 15, price: 89, cost: 40, status: 'In Stock' },
  { id: 8, name: 'Drip Scale with Timer', category: 'Accessories', stock: 3, price: 65, cost: 31, status: 'Low Stock' },
];

const initialCustomers = [];

const initialSettings = {
  workspaceName: 'ShopMind AI Enterprise',
  refreshRate: 'Every 5 minutes',
  ownerName: 'Sourav',
};

const readStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const productStatus = (stock) => {
  if (Number(stock) <= 0) return 'Out of Stock';
  if (Number(stock) <= 5) return 'Low Stock';
  return 'In Stock';
};

const downloadTextFile = (filename, content, type = 'text/plain') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const toCsv = (rows) => {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  return [headers.join(','), ...rows.map((row) => headers.map((key) => escape(row[key])).join(','))].join('\n');
};

const BusinessDataContext = createContext(null);

export const BusinessDataProvider = ({ children }) => {
  const [products, setProductsState] = useState(() => readStorage(PRODUCTS_KEY, initialProducts));
  const [customers, setCustomersState] = useState(() => readStorage(CUSTOMERS_KEY, initialCustomers));
  const [settings, setSettingsState] = useState(() => readStorage(SETTINGS_KEY, initialSettings));

  const setProducts = (next) => {
    setProductsState((current) => {
      const value = typeof next === 'function' ? next(current) : next;
      writeStorage(PRODUCTS_KEY, value);
      return value;
    });
  };

  const setCustomers = (next) => {
    setCustomersState((current) => {
      const value = typeof next === 'function' ? next(current) : next;
      writeStorage(CUSTOMERS_KEY, value);
      return value;
    });
  };

  const setSettings = (next) => {
    setSettingsState((current) => {
      const value = typeof next === 'function' ? next(current) : next;
      writeStorage(SETTINGS_KEY, value);
      return value;
    });
  };

  const addProduct = (product) => {
    const nextProduct = {
      id: Date.now(),
      name: product.name.trim(),
      category: product.category,
      stock: Number(product.stock || 0),
      price: Number(product.price || 0),
      cost: Number(product.cost || 0),
    };
    nextProduct.status = productStatus(nextProduct.stock);
    setProducts((current) => [nextProduct, ...current]);
    return nextProduct;
  };

  const updateProduct = (id, updates) => {
    setProducts((current) => current.map((product) => {
      if (product.id !== id) return product;
      const updated = {
        ...product,
        ...updates,
        stock: Number(updates.stock ?? product.stock),
        price: Number(updates.price ?? product.price),
        cost: Number(updates.cost ?? product.cost ?? 0),
      };
      return { ...updated, status: productStatus(updated.stock) };
    }));
  };

  const deleteProduct = (id) => {
    setProducts((current) => current.filter((product) => product.id !== id));
  };

  const addCustomer = (customer) => {
    const nextCustomer = {
      id: Date.now(),
      name: customer.name.trim(),
      email: customer.email.trim(),
      phone: customer.phone.trim(),
      orders: Number(customer.orders || 0),
      spent: Number(customer.spent || 0),
      credit: Number(customer.credit || 0),
      lastOrder: '',
      tier: customer.tier,
      avatar: '',
    };
    setCustomers((current) => [nextCustomer, ...current]);
    return nextCustomer;
  };

  const createInvoice = (customerId) => {
    const customer = customers.find((item) => item.id === customerId);
    if (!customer) return;
    const invoiceTotal = customer.credit > 0 ? customer.credit : Math.max(75, Math.round(customer.spent / Math.max(customer.orders, 1) * 100) / 100);
    const invoice = [
      `Invoice for ${customer.name}`,
      `Email: ${customer.email}`,
      `Generated: ${new Date().toLocaleString()}`,
      '',
      `Outstanding credit: $${customer.credit.toFixed(2)}`,
      `Suggested invoice total: $${invoiceTotal.toFixed(2)}`,
    ].join('\n');
    downloadTextFile(`invoice-${customer.name.toLowerCase().replace(/\s+/g, '-')}.txt`, invoice);
  };

  const analytics = useMemo(() => {
    const inventoryValue = products.reduce((sum, product) => sum + product.stock * product.price, 0);
    const lowStockCount = products.filter((product) => product.status !== 'In Stock').length;
    const totalOrders = customers.reduce((sum, customer) => sum + customer.orders, 0);
    const revenue = customers.reduce((sum, customer) => sum + customer.spent, 0) + inventoryValue * 0.18;
    const avgOrderValue = totalOrders ? revenue / totalOrders : 0;
    const categories = new Set(products.map((product) => product.category)).size;
    const topProducts = [...products]
      .sort((a, b) => (b.price * Math.max(b.stock, 1)) - (a.price * Math.max(a.stock, 1)))
      .slice(0, 5)
      .map((product) => ({ name: product.name.length > 14 ? `${product.name.slice(0, 13)}...` : product.name, sales: Math.max(25, product.stock * 9) }));

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthly = months.map((name, index) => {
      const trend = 0.68 + index * 0.045;
      return {
        name,
        revenue: Math.round(revenue * trend / 12),
        target: Math.round(revenue * (0.72 + index * 0.025) / 12),
        sales: Math.round(totalOrders * trend),
      };
    });

    return { inventoryValue, lowStockCount, totalOrders, revenue, avgOrderValue, categories, topProducts, monthly };
  }, [products, customers]);

  const exportProducts = () => downloadTextFile('shopmind-products.csv', toCsv(products), 'text/csv');
  const exportCustomers = () => downloadTextFile('shopmind-customers.csv', toCsv(customers), 'text/csv');
  const exportReport = () => {
    const report = [
      `${settings.workspaceName} Report`,
      `Generated: ${new Date().toLocaleString()}`,
      '',
      `Revenue: $${analytics.revenue.toFixed(2)}`,
      `Inventory value: $${analytics.inventoryValue.toFixed(2)}`,
      `Orders: ${analytics.totalOrders}`,
      `Customers: ${customers.length}`,
      `Products: ${products.length}`,
      `Low stock products: ${analytics.lowStockCount}`,
    ].join('\n');
    downloadTextFile('shopmind-report.txt', report);
  };

  const resetDemoData = () => {
    setProducts(initialProducts);
    setCustomers(initialCustomers);
    setSettings(initialSettings);
  };

  const value = {
    products,
    customers,
    settings,
    analytics,
    addProduct,
    updateProduct,
    deleteProduct,
    addCustomer,
    setSettings,
    createInvoice,
    exportProducts,
    exportCustomers,
    exportReport,
    resetDemoData,
  };

  return <BusinessDataContext.Provider value={value}>{children}</BusinessDataContext.Provider>;
};

export const useBusinessData = () => {
  const context = useContext(BusinessDataContext);
  if (!context) {
    throw new Error('useBusinessData must be used inside BusinessDataProvider');
  }
  return context;
};
