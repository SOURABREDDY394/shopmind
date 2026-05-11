import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  CreditCard,
  ChevronRight,
  Filter,
  Download,
  Star,
  Activity,
  History,
  AlertCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Loader2
} from 'lucide-react';
import Modal from '../components/Modal';
import { useBusinessData } from '../context/BusinessDataContext';

const emptyCustomer = {
  name: '',
  email: '',
  phone: '',
  orders: 0,
  spent: '',
  credit: 0,
  tier: 'Gold',
};

const Customers = () => {
  const { customers, addCustomer, exportCustomers, createInvoice } = useBusinessData();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState(emptyCustomer);
  const itemsPerPage = 5;

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredCustomers = useMemo(() => {
    let sortableItems = [...customers].filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig !== null) {
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
  }, [searchTerm, sortConfig]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      exportCustomers();
      setIsExporting(false);
    }, 300);
  };

  const handleRegister = (event) => {
    event.preventDefault();
    const created = addCustomer(customerForm);
    setSelectedCustomer(created);
    setCustomerForm(emptyCustomer);
    setRegisterOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[var(--text)]">Elite CRM Dashboard</h1>
          <p className="text-[var(--text-muted)] mt-1 font-medium">Precision tracking for your highest-value relationships and credit flow.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-3 bg-[var(--hover-bg)] border border-[var(--border)] rounded-2xl hover:bg-[var(--active-bg)] transition-all text-sm font-bold text-[var(--text)] shadow-xl"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin text-blue-400" /> : <Download className="w-4 h-4 text-blue-400" />}
            Export Intel
          </button>
          <button onClick={() => setRegisterOpen(true)} className="btn-primary py-3 px-6 text-sm font-black uppercase tracking-widest">
            Register Client
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by name, biometric ID, or email..." 
            className="w-full bg-[var(--hover-bg)] border border-[var(--border)] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-blue-500 transition-all text-[var(--text)] placeholder:text-[var(--text-muted)] opacity-80 focus:opacity-100"
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
          <div className="card-premium overflow-hidden border-[var(--border)] bg-[var(--card-bg)] shadow-xl">
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
                  {paginatedCustomers.map((customer) => (
                    <tr 
                      key={customer.id} 
                      className={`hover:bg-[var(--active-bg)] transition-all cursor-pointer group ${selectedCustomer?.id === customer.id ? 'bg-[var(--active-bg)] border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`}
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <img src={customer.avatar} alt="" className="w-12 h-12 rounded-2xl bg-[var(--hover-bg)] border border-[var(--border)] shadow-sm group-hover:scale-110 transition-transform" />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[var(--bg)]"></div>
                          </div>
                          <div>
                            <div className="font-black text-[var(--text)] group-hover:text-blue-500 transition-colors">{customer.name}</div>
                            <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{customer.tier} Account</div>
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
                              DUE: ${customer.credit.toFixed(2)}
                            </span>
                          ) : 'CLEAR'}
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-tighter">Spent: ${customer.spent.toFixed(2)}</div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="p-2 bg-[var(--hover-bg)] rounded-xl inline-flex group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-all">
                          <ChevronRightIcon className="w-4 h-4" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-8 py-4 border-t border-[var(--border)] bg-[var(--hover-bg)] flex items-center justify-between">
              <p className="text-xs text-[var(--text-muted)]">
                Showing <span className="text-[var(--text)] font-bold">{Math.min(filteredCustomers.length, (currentPage-1)*itemsPerPage + 1)}-{Math.min(filteredCustomers.length, currentPage*itemsPerPage)}</span> of <span className="text-[var(--text)] font-bold">{filteredCustomers.length}</span> clients
              </p>
              <div className="flex items-center gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
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
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
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
            <div className="card-premium p-8 sticky top-24 border-[var(--border)] bg-[var(--card-bg)] shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="flex flex-col items-center text-center mb-8 relative">
                <div className="absolute top-0 right-0">
                  <Star className="w-6 h-6 text-amber-400 fill-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
                </div>
                <div className="relative group/avatar">
                  <img src={selectedCustomer.avatar} alt="" className="w-28 h-28 rounded-3xl bg-[var(--hover-bg)] mb-5 border-2 border-[var(--border)] shadow-xl group-hover/avatar:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-[var(--accent)] opacity-0 group-hover/avatar:opacity-10 rounded-3xl transition-opacity"></div>
                </div>
                <h2 className="text-3xl font-black text-[var(--text)] tracking-tighter">{selectedCustomer.name}</h2>
                <p className="text-[var(--accent)] font-bold text-xs uppercase tracking-[0.2em] mt-1">{selectedCustomer.email}</p>
                <div className="mt-6 flex gap-3">
                  <a href={`mailto:${selectedCustomer.email}`} className="p-3 bg-[var(--hover-bg)] rounded-2xl border border-[var(--border)] hover:border-blue-500/50 hover:bg-blue-500/10 transition-all text-blue-500 group">
                    <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </a>
                  <a href={`tel:${selectedCustomer.phone}`} className="p-3 bg-[var(--hover-bg)] rounded-2xl border border-[var(--border)] hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all text-emerald-500 group">
                    <Phone className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </a>
                  <a href={`https://www.google.com/maps/search/${encodeURIComponent(selectedCustomer.name)}`} target="_blank" rel="noreferrer" className="p-3 bg-[var(--hover-bg)] rounded-2xl border border-[var(--border)] hover:border-rose-500/50 hover:bg-rose-500/10 transition-all text-rose-500 group">
                    <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform" />
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
                    <p className="text-xl font-black text-[var(--text)]">${selectedCustomer.spent}</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] flex items-center gap-2">
                      <History className="w-3 h-3" />
                      Transaction Ledger
                    </h4>
                    <span className="text-[10px] font-bold text-[var(--accent)] cursor-pointer hover:underline">View All</span>
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center justify-between p-4 bg-[var(--hover-bg)] rounded-2xl border border-[var(--border)] hover:border-[var(--accent)] transition-all cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[var(--active-bg)] flex items-center justify-center border border-[var(--border)] group-hover:bg-[var(--accent)] group-hover:text-white transition-all">
                            <ShoppingBag className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[var(--text)]">X-ORD-{840+i}</p>
                            <p className="text-[10px] text-[var(--text-muted)] font-medium">MAY 12 • PROCESSED</p>
                          </div>
                        </div>
                        <p className="text-sm font-black text-[var(--text)] group-hover:text-emerald-500 transition-colors">$124.00</p>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={() => createInvoice(selectedCustomer.id)} className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-white shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #1d4ed8 100%)' }}>
                  Execute Invoice
                </button>
              </div>
            </div>
          ) : (
            <div className="card-premium p-16 text-center flex flex-col items-center justify-center sticky top-24 min-h-[600px] border-dashed border-[var(--border)] bg-[var(--card-bg)] shadow-inner">
              <Users className="w-24 h-24 text-[var(--text-muted)] opacity-20 mb-8 animate-pulse" />
              <h3 className="text-2xl font-black text-[var(--text)] mb-2">Awaiting Selection</h3>
              <p className="text-[var(--text-muted)] font-medium max-w-[200px]">Select a profile from the ledger to decapsulate detailed intelligence.</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Email</label>
              <input value={customerForm.email} onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })} type="email" required className="w-full bg-[var(--hover-bg)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)]" placeholder="client@example.com" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Phone</label>
              <input value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} required className="w-full bg-[var(--hover-bg)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)]" placeholder="+1 555-0199" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Lifetime Spend</label>
              <input value={customerForm.spent} onChange={(e) => setCustomerForm({ ...customerForm, spent: e.target.value })} type="number" min="0" step="0.01" required className="w-full bg-[var(--hover-bg)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)]" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Credit Due</label>
              <input value={customerForm.credit} onChange={(e) => setCustomerForm({ ...customerForm, credit: e.target.value })} type="number" min="0" step="0.01" className="w-full bg-[var(--hover-bg)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)]" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Tier</label>
            <select value={customerForm.tier} onChange={(e) => setCustomerForm({ ...customerForm, tier: e.target.value })} className="w-full bg-[var(--hover-bg)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)]">
              <option>Silver</option>
              <option>Gold</option>
              <option>Platinum</option>
              <option>Diamond</option>
            </select>
          </div>
          <button className="btn-primary w-full py-4">Create Client</button>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;
