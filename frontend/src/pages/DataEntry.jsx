import React, { useEffect, useMemo, useState } from 'react';
import { useInView, useStaggeredReveal } from '../hooks/useScrollEffects';
import toast from 'react-hot-toast';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Loader2,
  PackagePlus,
  RefreshCw,
  ShoppingCart,
  UserPlus,
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { EmptyState, ErrorState, PageShell, formatCurrency } from '../components/ui';

const initialProduct = { name: '', price: '', stock: '' };
const initialCustomer = { name: '', email: '' };
const initialOrder = { customerId: '', productId: '', quantity: 1, status: 'completed' };
const initialStock = { productId: '', stock: '' };

const FormCard = ({ icon: Icon, title, subtitle, children }) => (
  <section className="card-premium p-6 border-white/5 bg-[var(--card-bg)]">
    <div className="flex items-start gap-4 mb-6">
      <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-xl font-black text-[var(--text)]">{title}</h3>
        <p className="text-sm text-[var(--text-muted)] mt-1">{subtitle}</p>
      </div>
    </div>
    {children}
  </section>
);

const Message = ({ type, children }) => {
  if (!children) return null;

  const isError = type === 'error';
  const Icon = isError ? AlertCircle : CheckCircle2;

  return (
    <div className={`flex items-start gap-2 rounded-xl border p-3 text-sm font-semibold ${
      isError
        ? 'border-rose-500/20 bg-rose-500/10 text-rose-300'
        : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
    }`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
};

const Input = (props) => (
  <input
    {...props}
    className="input-premium"
  />
);

const Select = (props) => (
  <select
    {...props}
    className="input-premium"
  />
);

const DataEntry = () => {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingRefs, setLoadingRefs] = useState(false);
  const [referenceError, setReferenceError] = useState('');
  const [saving, setSaving] = useState('');
  const [messages, setMessages] = useState({});

  const [productForm, setProductForm] = useState(initialProduct);
  const [customerForm, setCustomerForm] = useState(initialCustomer);
  const [orderForm, setOrderForm] = useState(initialOrder);
  const [stockForm, setStockForm] = useState(initialStock);

  const selectedOrderProduct = useMemo(
    () => products.find((product) => product.id === orderForm.productId),
    [products, orderForm.productId]
  );

  const orderTotal = selectedOrderProduct
    ? Number(selectedOrderProduct.price || 0) * Number(orderForm.quantity || 0)
    : 0;

  const setMessage = (key, type, text) => {
    setMessages((current) => ({ ...current, [key]: { type, text } }));
  };

  const clearMessage = (key) => {
    setMessages((current) => ({ ...current, [key]: null }));
  };

  const loadReferenceData = async () => {
    if (!isSupabaseConfigured) {
      setReferenceError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.');
      return;
    }

    setLoadingRefs(true);
    setReferenceError('');

    const [productsResult, customersResult, ordersResult] = await Promise.all([
      supabase.from('products').select('id,name,price,stock').order('created_at', { ascending: false }),
      supabase.from('customers').select('id,name,email,created_at').order('created_at', { ascending: false }),
      supabase.from('orders').select('id,total,status,created_at,customer_id').order('created_at', { ascending: false }).limit(5),
    ]);

    setLoadingRefs(false);

    if (productsResult.error || customersResult.error || ordersResult.error) {
      const message = productsResult.error?.message || customersResult.error?.message || ordersResult.error?.message;
      setReferenceError(message);
      toast.error(message);
      setProducts([]);
      setCustomers([]);
      setRecentOrders([]);
      return;
    }

    setProducts(productsResult.data || []);
    setCustomers(customersResult.data || []);
    setRecentOrders(ordersResult.data || []);
  };

  useEffect(() => {
    loadReferenceData();
  }, []);

  const addProduct = async (event) => {
    event.preventDefault();
    clearMessage('product');
    if (!productForm.name.trim() || Number(productForm.price) < 0 || Number(productForm.stock || 0) < 0) {
      setMessage('product', 'error', 'Enter a product name, non-negative price, and non-negative stock.');
      toast.error('Check product fields.');
      return;
    }
    setSaving('product');

    const { error } = await supabase.from('products').insert({
      name: productForm.name.trim(),
      price: Number(productForm.price),
      stock: Number(productForm.stock || 0),
    });

    setSaving('');

    if (error) {
      setMessage('product', 'error', error.message);
      toast.error(error.message);
      return;
    }

    setProductForm(initialProduct);
    setMessage('product', 'success', 'Product added to Supabase.');
    toast.success('Product added.');
    loadReferenceData();
  };

  const addCustomer = async (event) => {
    event.preventDefault();
    clearMessage('customer');
    if (!customerForm.name.trim()) {
      setMessage('customer', 'error', 'Customer name is required.');
      toast.error('Customer name is required.');
      return;
    }
    setSaving('customer');

    const { error } = await supabase.from('customers').insert({
      name: customerForm.name.trim(),
      email: customerForm.email.trim() || null,
    });

    setSaving('');

    if (error) {
      setMessage('customer', 'error', error.message);
      toast.error(error.message);
      return;
    }

    setCustomerForm(initialCustomer);
    setMessage('customer', 'success', 'Customer added to Supabase.');
    toast.success('Customer added.');
    loadReferenceData();
  };

  const createOrder = async (event) => {
    event.preventDefault();
    clearMessage('order');
    if (!orderForm.customerId || !orderForm.productId || Number(orderForm.quantity) <= 0) {
      setMessage('order', 'error', 'Select a customer, product, and quantity greater than zero.');
      toast.error('Check order fields.');
      return;
    }
    setSaving('order');

    const quantity = Number(orderForm.quantity);
    const product = products.find((item) => item.id === orderForm.productId);
    const total = Number(product?.price || 0) * quantity;

    const orderResult = await supabase
      .from('orders')
      .insert({
        customer_id: orderForm.customerId,
        total,
        status: orderForm.status,
      })
      .select('id')
      .single();

    if (orderResult.error) {
      setSaving('');
      setMessage('order', 'error', orderResult.error.message);
      toast.error(orderResult.error.message);
      return;
    }

    const itemResult = await supabase.from('order_items').insert({
      order_id: orderResult.data.id,
      product_id: orderForm.productId,
      quantity,
      price: Number(product?.price || 0),
    });

    setSaving('');

    if (itemResult.error) {
      setMessage('order', 'error', itemResult.error.message);
      toast.error(itemResult.error.message);
      return;
    }

    setOrderForm(initialOrder);
    setMessage('order', 'success', 'Order and order item created in Supabase.');
    toast.success('Order created.');
    loadReferenceData();
  };

  const updateStock = async (event) => {
    event.preventDefault();
    clearMessage('stock');
    if (!stockForm.productId || Number(stockForm.stock) < 0) {
      setMessage('stock', 'error', 'Select a product and enter a non-negative stock count.');
      toast.error('Check stock fields.');
      return;
    }
    setSaving('stock');

    const { error } = await supabase
      .from('products')
      .update({ stock: Number(stockForm.stock) })
      .eq('id', stockForm.productId);

    setSaving('');

    if (error) {
      setMessage('stock', 'error', error.message);
      toast.error(error.message);
      return;
    }

    setStockForm(initialStock);
    setMessage('stock', 'success', 'Product stock updated in Supabase.');
    toast.success('Stock updated.');
    loadReferenceData();
  };

  const isDisabled = !isSupabaseConfigured || Boolean(referenceError);

  return (
    <PageShell
      eyebrow="Data Entry"
      title="Add Real Business Records"
      description="Create Supabase products, customers, orders, order_items, and stock updates without mock data."
      actions={(
        <button
          onClick={loadReferenceData}
          disabled={loadingRefs}
          className="w-fit flex items-center gap-2 px-5 py-3 bg-[var(--hover-bg)] border border-[var(--border)] rounded-2xl hover:bg-[var(--active-bg)] transition-all text-sm font-bold text-[var(--text)]"
        >
          {loadingRefs ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 text-blue-400" />}
          Refresh Data
        </button>
      )}
    >

      <ErrorState message={referenceError} />

      <DataEntryGrid loading={loadingRefs}>

        <FormCard icon={PackagePlus} title="Add Product" subtitle="Creates a row in the products table.">
          <form className="space-y-4" onSubmit={addProduct}>
            <Input
              value={productForm.name}
              onChange={(event) => setProductForm({ ...productForm, name: event.target.value })}
              placeholder="Product name"
              required
              disabled={isDisabled}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={productForm.price}
                onChange={(event) => setProductForm({ ...productForm, price: event.target.value })}
                placeholder="Price"
                required
                disabled={isDisabled}
              />
              <Input
                type="number"
                min="0"
                step="1"
                value={productForm.stock}
                onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })}
                placeholder="Stock"
                disabled={isDisabled}
              />
            </div>
            <Message type={messages.product?.type}>{messages.product?.text}</Message>
            <button disabled={isDisabled || saving === 'product'} className="btn-primary w-full flex items-center justify-center gap-2 py-4 disabled:opacity-50">
              {saving === 'product' && <Loader2 className="w-5 h-5 animate-spin" />}
              Add Product
            </button>
          </form>
        </FormCard>

        <FormCard icon={UserPlus} title="Add Customer" subtitle="Creates a row in the customers table.">
          <form className="space-y-4" onSubmit={addCustomer}>
            <Input
              value={customerForm.name}
              onChange={(event) => setCustomerForm({ ...customerForm, name: event.target.value })}
              placeholder="Customer name"
              required
              disabled={isDisabled}
            />
            <Input
              type="email"
              value={customerForm.email}
              onChange={(event) => setCustomerForm({ ...customerForm, email: event.target.value })}
              placeholder="Email"
              disabled={isDisabled}
            />
            <Message type={messages.customer?.type}>{messages.customer?.text}</Message>
            <button disabled={isDisabled || saving === 'customer'} className="btn-primary w-full flex items-center justify-center gap-2 py-4 disabled:opacity-50">
              {saving === 'customer' && <Loader2 className="w-5 h-5 animate-spin" />}
              Add Customer
            </button>
          </form>
        </FormCard>

        <FormCard icon={ShoppingCart} title="Create Order" subtitle="Creates an order plus one order_items row. Completed orders count toward revenue.">
          <form className="space-y-4" onSubmit={createOrder}>
            <Select
              value={orderForm.customerId}
              onChange={(event) => setOrderForm({ ...orderForm, customerId: event.target.value })}
              required
              disabled={isDisabled || customers.length === 0}
            >
              <option value="">Select customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </Select>
            <Select
              value={orderForm.productId}
              onChange={(event) => setOrderForm({ ...orderForm, productId: event.target.value })}
              required
              disabled={isDisabled || products.length === 0}
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - ${Number(product.price).toFixed(2)} ({product.stock ?? 0} in stock)
                </option>
              ))}
            </Select>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="number"
                min="1"
                step="1"
                value={orderForm.quantity}
                onChange={(event) => setOrderForm({ ...orderForm, quantity: event.target.value })}
                placeholder="Quantity"
                required
                disabled={isDisabled}
              />
              <Select
                value={orderForm.status}
                onChange={(event) => setOrderForm({ ...orderForm, status: event.target.value })}
                disabled={isDisabled}
              >
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
              </Select>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--hover-bg)] px-4 py-3 text-sm font-bold text-[var(--text)]">
              Order total: {formatCurrency(orderTotal)}
            </div>
            <Message type={messages.order?.type}>{messages.order?.text}</Message>
            <button disabled={isDisabled || saving === 'order' || products.length === 0 || customers.length === 0} className="btn-primary w-full flex items-center justify-center gap-2 py-4 disabled:opacity-50">
              {saving === 'order' && <Loader2 className="w-5 h-5 animate-spin" />}
              Create Order
            </button>
          </form>
        </FormCard>

        <FormCard icon={ClipboardList} title="Update Stock" subtitle="Updates the stock column for an existing product.">
          <form className="space-y-4" onSubmit={updateStock}>
            <Select
              value={stockForm.productId}
              onChange={(event) => setStockForm({ ...stockForm, productId: event.target.value })}
              required
              disabled={isDisabled || products.length === 0}
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.stock ?? 0} current)
                </option>
              ))}
            </Select>
            <Input
              type="number"
              min="0"
              step="1"
              value={stockForm.stock}
              onChange={(event) => setStockForm({ ...stockForm, stock: event.target.value })}
              placeholder="New stock count"
              required
              disabled={isDisabled}
            />
            <Message type={messages.stock?.type}>{messages.stock?.text}</Message>
            <button disabled={isDisabled || saving === 'stock' || products.length === 0} className="btn-primary w-full flex items-center justify-center gap-2 py-4 disabled:opacity-50">
              {saving === 'stock' && <Loader2 className="w-5 h-5 animate-spin" />}
              Update Stock
            </button>
          </form>
        </FormCard>
      </DataEntryGrid>


      <section className="card-premium p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-[var(--text)]">Recent Records Added</h3>
            <p className="mt-1 text-sm font-medium text-[var(--text-muted)]">Latest Supabase rows from products, customers, and orders.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <RecentList title="Products" rows={products.slice(0, 5)} empty="No products yet" render={(product) => (
            <>
              <span>{product.name}</span>
              <span>{formatCurrency(product.price)}</span>
            </>
          )} />
          <RecentList title="Customers" rows={customers.slice(0, 5)} empty="No customers yet" render={(customer) => (
            <>
              <span>{customer.name}</span>
              <span>{customer.email || 'No email'}</span>
            </>
          )} />
          <RecentList title="Orders" rows={recentOrders} empty="No orders yet" render={(order) => (
            <>
              <span>{formatCurrency(order.total)}</span>
              <span className="capitalize">{order.status}</span>
            </>
          )} />
        </div>
      </section>
    </PageShell>
  );
};

const RecentList = ({ title, rows, empty, render }) => (
  <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
    <h4 className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">{title}</h4>
    {rows.length === 0 ? (
      <EmptyState title={empty} description="Add real records to populate this panel." />
    ) : (
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--hover-bg)] px-4 py-3 text-sm font-bold text-[var(--text)]">
            {render(row)}
          </div>
        ))}
      </div>
    )}
  </div>
);

/* ─── DataEntryGrid: staggers form cards on scroll ─────────────────── */
const DataEntryGrid = ({ children }) => {
  const [ref, isVisible] = useInView({ threshold: 0.1 });
  const childArray = React.Children.toArray(children);
  const revealed = useStaggeredReveal(childArray.length, isVisible, 180);

  return (
    <div ref={ref} className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {childArray.map((child, idx) => (
        <div
          key={idx}
          className="form-field-reveal"
          style={{
            opacity: revealed[idx] ? 1 : 0,
            transform: revealed[idx] ? 'translateY(0)' : 'translateY(10px)',
            transition: `opacity 0.5s ease ${idx * 0.12}s, transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${idx * 0.12}s`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

export default DataEntry;

