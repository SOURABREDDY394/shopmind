import React, { useEffect, useMemo, useState } from 'react';
import { useInView } from '../hooks/useScrollEffects';
import {
  Users,
  Search,
  Mail,
  ShoppingBag,
  CreditCard,
  Filter,
  Download,
  Star,
  Activity,
  History,
  AlertCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Loader2,
} from 'lucide-react';
import Modal from '../components/Modal';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

const emptyCustomer = {
  name: '',
  email: '',
};

const completedStatuses = new Set(['completed']);
const dueStatuses = new Set(['pending', 'processing']);

const formatCurrency = (value, digits = 2) => `$${Number(value || 0).toFixed(digits)}`;

const getAccountTier = (totalSpent) => {
  if (totalSpent >= 4000) return 'Diamond';
  if (totalSpent >= 2000) return 'Platinum';
  if (totalSpent >= 500) return 'Gold';
  return 'Silver';
};

const formatLastActive = (value) => {
  if (!value) return 'No orders yet';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
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

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState(emptyCustomer);
  const itemsPerPage = 5;

  const loadCustomerData = async () => {
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const [customersResult, ordersResult] = await Promise.all([
      supabase.from('customers').select('id,name,email,created_at').order('created_at', { ascending: false }),
      supabase.from('orders').select('id,customer_id,total,status,created_at').order('created_at', { ascending: false }),
    ]);

    setLoading(false);

    if (customersResult.error || ordersResult.error) {
      setError(customersResult.error?.message || ordersResult.error?.message);
      setCustomers([]);
      setOrders([]);
      setSelectedCustomer(null);
      return;
    }

    setCustomers(customersResult.data || []);
    setOrders(ordersResult.data || []);
  };

  useEffect(() => {
    loadCustomerData();
  }, []);

  const customerRows = useMemo(() => {
    const ordersByCustomer = orders.reduce((map, order) => {
      if (!order.customer_id) return map;
      const next = map.get(order.customer_id) || [];
      next.push(order);
      map.set(order.customer_id, next);
      return map;
    }, new Map());

    return customers.map((customer) => {
      const customerOrders = ordersByCustomer.get(customer.id) || [];
      const spent = customerOrders
        .filter((order) => completedStatuses.has(String(order.status || '').toLowerCase()))
        .reduce((sum, order) => sum + Number(order.total || 0), 0);
      const credit = customerOrders
        .filter((order) => dueStatuses.has(String(order.status || '').toLowerCase()))
        .reduce((sum, order) => sum + Number(order.total || 0), 0);
      const latestOrder = customerOrders[0]?.created_at || null;

      return {
        ...customer,
        email: customer.email || '',
        orders: customerOrders.length,
        spent,
        credit,
        lastOrder: formatLastActive(latestOrder),
        lastOrderAt: latestOrder,
        tier: getAccountTier(spent),
        ledger: customerOrders.slice(0, 3),
      };
    });
  }, [customers, orders]);

  useEffect(() => {
    if (!selectedCustomer) return;
    const updated = customerRows.find((customer) => customer.id === selectedCustomer.id);
    setSelectedCustomer(updated || null);
  }, [customerRows, selectedCustomer?.id]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredCustomers = useMemo(() => {
    const query = searchTerm.toLowerCase();
    const sortableItems = [...customerRows].filter((customer) =>
      customer.name.toLowerCase().includes(query)
      || customer.email.toLowerCase().includes(query)
    );

    if (sortConfig) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableItems;
  }, [customerRows, searchTerm, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / itemsPerPage));
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      const rows = filteredCustomers.map((customer) => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        transactions: customer.orders,
        total_spent: customer.spent,
        due_amount: customer.credit,
        last_active: customer.lastOrderAt || '',
        account_tier: customer.tier,
      }));
      downloadTextFile('supabase-customers.csv', toCsv(rows), 'text/csv');
      setIsExporting(false);
    }, 300);
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');

    const { data, error: insertError } = await supabase
      .from('customers')
      .insert({
        name: customerForm.name.trim(),
        email: customerForm.email.trim() || null,
      })
      .select('id,name,email,created_at')
      .single();

    setIsSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setCustomerForm(emptyCustomer);
    setRegisterOpen(false);
    await loadCustomerData();
    setSelectedCustomer({
      ...data,
      email: data.email || '',
      orders: 0,
      spent: 0,
      credit: 0,
      lastOrder: 'No orders yet',
      lastOrderAt: null,
      tier: 'Silver',
      ledger: [],
    });
  };

  const handleCreateInvoice = (customer) => {
    const invoice = [
      `Invoice for ${customer.name}`,
      `Email: ${customer.email || 'Not provided'}`,
      `Generated: ${new Date().toLocaleString()}`,
      '',
      `Transactions: ${customer.orders}`,
      `Completed order total: ${formatCurrency(customer.spent)}`,
      `Pending/processing due: ${formatCurrency(customer.credit)}`,
    ].join('\n');
    downloadTextFile(`invoice-${customer.name.toLowerCase().replace(/\s+/g, '-')}.txt`, invoice);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="section-eyebrow mb-2">Customers</p>
          <h1 className="text-3xl font-black tracking-tight text-[var(--text)] md:text-4xl">Customer Intelligence</h1>
          <p className="text-[var(--text-muted)] mt-1 font-medium">Real Supabase customers with completed spend, pending due, and latest order activity.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-3 bg-[var(--hover-bg)] border border-[var(--border)] rounded-2xl hover:bg-[var(--active-bg)] transition-colors text-sm font-bold text-[var(--text)]"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin text-blue-400" /> : <Download className="w-4 h-4 text-blue-400" />}
            Export Intel
          </button>
          <button onClick={() => setRegisterOpen(true)} className="btn-primary py-3 px-6 text-sm font-black uppercase tracking-widest">
            Register Client
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm font-semibold text-rose-300">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="input-premium pl-12"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-4 bg-[var(--hover-bg)] border border-[var(--border)] rounded-2xl hover:bg-[var(--active-bg)] transition-all text-[var(--text-muted)] font-bold">
          <Filter className="w-5 h-5" />
          Segments
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          <div className="card-premium overflow-hidden border-[var(--border)] bg-[var(--card-bg)] shadow-xl customer-spotlight-enter visible">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--hover-bg)]">
                    <th
                      className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] cursor-pointer hover:text-[var(--text)] transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-2">
                        Identity
                        {sortConfig.key === 'name' && <ArrowUpDown className="w-3 h-3" />}
                      </div>
                    </th>
                    <th
                      className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] cursor-pointer hover:text-[var(--text)] transition-colors"
                      onClick={() => handleSort('orders')}
                    >
                      <div className="flex items-center gap-2">
                        Engagement
                        {sortConfig.key === 'orders' && <ArrowUpDown className="w-3 h-3" />}
                      </div>
                    </th>
                    <th
                      className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] text-right cursor-pointer hover:text-[var(--text)] transition-colors"
                      onClick={() => handleSort('spent')}
                    >
                      <div className="flex items-center justify-end gap-2">
                        Fiscal Status
                        {sortConfig.key === 'spent' && <ArrowUpDown className="w-3 h-3" />}
                      </div>
                    </th>
                    <th className="px-8 py-5 font-black text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] text-right">Nexus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {loading && (
                    <tr>
                      <td colSpan="4" className="px-8 py-16 text-center">
                        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-[var(--accent)]" />
                        <p className="text-sm font-bold text-[var(--text-muted)]">Loading Supabase customers...</p>
                      </td>
                    </tr>
                  )}
                  {!loading && filteredCustomers.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-8 py-16 text-center">
                        <Users className="mx-auto mb-4 h-12 w-12 text-[var(--text-muted)] opacity-30" />
                        <p className="text-sm font-bold text-[var(--text)]">No customers yet. Add customers from Data Entry.</p>
                      </td>
                    </tr>
                  )}
                  {paginatedCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className={`hover:bg-[var(--active-bg)] transition-colors cursor-pointer group ${selectedCustomer?.id === customer.id ? 'bg-[var(--active-bg)] border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`}
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-[var(--hover-bg)] border border-[var(--border)] shadow-sm group-hover:bg-[var(--active-bg)] transition-colors flex items-center justify-center text-sm font-black text-[var(--accent)]">
                              {customer.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[var(--bg)]"></div>
                          </div>
                          <div>
                            <div className="font-black text-[var(--text)] group-hover:text-blue-500 transition-colors">{customer.name}</div>
                            <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                              <span className={`tier-badge inline-flex px-2 py-0.5 rounded-full text-[9px] font-black ${
                                customer.tier === 'Diamond' ? 'bg-violet-500/10 text-violet-500 tier-badge-diamond' :
                                customer.tier === 'Platinum' ? 'bg-blue-500/10 text-blue-500 tier-badge-platinum' :
                                customer.tier === 'Gold' ? 'bg-amber-500/10 text-amber-500 tier-badge-gold' :
                                'bg-slate-500/10 text-slate-500'
                              }`}>{customer.tier}</span> Account
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-sm font-bold text-[var(--text)]">{customer.orders} Transactions</div>
                        <div className="text-[10px] text-[var(--text-muted)] font-medium">Last active: {customer.lastOrder}</div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className={`text-sm font-black ${customer.credit > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {customer.credit > 0 ? (
                            <span className="flex items-center justify-end gap-1">
                              <AlertCircle className="w-3 h-3" />
                              DUE: {formatCurrency(customer.credit)}
                            </span>
                          ) : 'CLEAR'}
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-tighter">Spent: {formatCurrency(customer.spent)}</div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="p-2 bg-[var(--hover-bg)] rounded-xl inline-flex group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                          <ChevronRightIcon className="w-4 h-4" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-8 py-4 border-t border-[var(--border)] bg-[var(--hover-bg)] flex items-center justify-between">
              <p className="text-xs text-[var(--text-muted)]">
                Showing <span className="text-[var(--text)] font-bold">{filteredCustomers.length ? Math.min(filteredCustomers.length, (currentPage - 1) * itemsPerPage + 1) : 0}-{Math.min(filteredCustomers.length, currentPage * itemsPerPage)}</span> of <span className="text-[var(--text)] font-bold">{filteredCustomers.length}</span> clients
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => page - 1)}
                  className="p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--active-bg)] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-[var(--text)]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === i + 1 ? 'bg-[var(--accent)] text-white shadow-[0_0_15px_var(--accent-glow)]' : 'border border-[var(--border)] hover:bg-[var(--active-bg)] text-[var(--text)]'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages || filteredCustomers.length === 0}
                  onClick={() => setCurrentPage((page) => page + 1)}
                  className="p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--active-bg)] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-[var(--text)]"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          {selectedCustomer ? (
            <div className="card-premium p-8 sticky top-24 border-[var(--border)] bg-[var(--card-bg)] shadow-2xl customer-detail-panel visible">
              <div className="flex flex-col items-center text-center mb-8 relative">
                <div className="absolute top-0 right-0">
                  <Star className="w-6 h-6 text-amber-400 fill-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
                </div>
                <div className="relative group/avatar">
                  <div className="w-28 h-28 rounded-3xl bg-[var(--hover-bg)] mb-5 border-2 border-[var(--border)] shadow-xl group-hover/avatar:scale-105 transition-transform flex items-center justify-center text-3xl font-black text-[var(--accent)]">
                    {selectedCustomer.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="absolute inset-0 bg-[var(--accent)] opacity-0 group-hover/avatar:opacity-10 rounded-3xl transition-opacity"></div>
                </div>
                <h2 className="text-3xl font-black text-[var(--text)] tracking-tighter">{selectedCustomer.name}</h2>
                <p className="text-[var(--accent)] font-bold text-xs uppercase tracking-[0.2em] mt-1">{selectedCustomer.email || 'No email'}</p>
                <div className="mt-6 flex gap-3">
                  <a href={selectedCustomer.email ? `mailto:${selectedCustomer.email}` : undefined} className="p-3 bg-[var(--hover-bg)] rounded-2xl border border-[var(--border)] hover:border-blue-500/50 hover:bg-blue-500/10 transition-all text-blue-500 group">
                    <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </a>
                </div>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[var(--hover-bg)] p-5 rounded-3xl border border-[var(--border)] group hover:border-indigo-500/30 transition-all">
                    <Activity className="w-5 h-5 text-indigo-500 mb-3" />
                    <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">Efficiency</p>
                    <p className="text-xl font-black text-[var(--text)]">{selectedCustomer.orders} Ops</p>
                  </div>
                  <div className="bg-[var(--hover-bg)] p-5 rounded-3xl border border-[var(--border)] group hover:border-purple-500/30 transition-all">
                    <CreditCard className="w-5 h-5 text-purple-500 mb-3" />
                    <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">Yield</p>
                    <p className="text-xl font-black text-[var(--text)]">{formatCurrency(selectedCustomer.spent, 0)}</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] flex items-center gap-2">
                      <History className="w-3 h-3" />
                      Transaction Ledger
                    </h4>
                    <span className="text-[10px] font-bold text-[var(--accent)]">Latest</span>
                  </div>
                  <div className="space-y-3">
                    {selectedCustomer.ledger.length === 0 && (
                      <div className="p-4 bg-[var(--hover-bg)] rounded-2xl border border-[var(--border)] text-sm font-bold text-[var(--text-muted)]">
                        No orders yet.
                      </div>
                    )}
                    {selectedCustomer.ledger.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-[var(--hover-bg)] rounded-2xl border border-[var(--border)] hover:border-[var(--accent)] transition-all cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[var(--active-bg)] flex items-center justify-center border border-[var(--border)] group-hover:bg-[var(--accent)] group-hover:text-white transition-all">
                            <ShoppingBag className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[var(--text)]">Order {String(order.id).slice(0, 8)}</p>
                            <p className="text-[10px] text-[var(--text-muted)] font-medium">{formatLastActive(order.created_at).toUpperCase()} - {String(order.status || 'pending').toUpperCase()}</p>
                          </div>
                        </div>
                        <p className="text-sm font-black text-[var(--text)] group-hover:text-emerald-500 transition-colors">{formatCurrency(order.total)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={() => handleCreateInvoice(selectedCustomer)} className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-white shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #1d4ed8 100%)' }}>
                  Execute Invoice
                </button>
              </div>
            </div>
          ) : (
            <div className="card-premium p-16 text-center flex flex-col items-center justify-center sticky top-24 min-h-[500px] border-dashed border-[var(--border)] bg-[var(--card-bg)]">
              <Users className="w-24 h-24 text-[var(--text-muted)] opacity-20 mb-8" />
              <h3 className="text-2xl font-black text-[var(--text)] mb-2">Awaiting Selection</h3>
              <p className="text-[var(--text-muted)] font-medium max-w-[200px]">Select a profile from the ledger to inspect real Supabase activity.</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isRegisterOpen} onClose={() => setRegisterOpen(false)} title="Register Client">
        <form className="space-y-4" onSubmit={handleRegister}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Name</label>
            <input value={customerForm.name} onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} required className="w-full bg-[var(--hover-bg)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)]" placeholder="Client name" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Email</label>
            <input value={customerForm.email} onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })} type="email" className="w-full bg-[var(--hover-bg)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)]" placeholder="client@example.com" />
          </div>
          <button disabled={isSaving} className="btn-primary w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50">
            {isSaving && <Loader2 className="w-5 h-5 animate-spin" />}
            Create Client
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;
