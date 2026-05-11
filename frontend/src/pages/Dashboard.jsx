import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  ShoppingCart, 
  Zap, 
  ShieldCheck, 
  ArrowUpRight,
  MoreHorizontal,
  FileText,
  Settings as SettingsIcon,
  HelpCircle,
  Filter as FilterIcon
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import ScrollReveal from '../components/ScrollReveal';
import Modal from '../components/Modal';
import { useDashboardData } from '../hooks/useDashboardData';

const workspaceName = 'ShopMind AI Enterprise';
const ownerName = 'Sourav';

const formatCurrency = (value, maximumFractionDigits = 0) => (
  `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits })}`
);

const MetricValue = ({ loading, hasData, children }) => {
  if (loading) return <h3 className="text-3xl font-extrabold mt-1 text-[var(--text-muted)]">Loading...</h3>;
  if (!hasData) return <h3 className="text-2xl font-extrabold mt-1 text-[var(--text-muted)]">No data yet</h3>;
  return <h3 className="text-3xl font-extrabold mt-1 gradient-text">{children}</h3>;
};

const EmptyChart = ({ children }) => (
  <div className="h-full min-h-[220px] flex items-center justify-center text-sm font-semibold text-[var(--text-muted)]">
    {children}
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { loading, error, hasData, metrics } = useDashboardData();
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [isConfigModalOpen, setConfigModalOpen] = useState(false);
  const [isDocsModalOpen, setDocsModalOpen] = useState(false);
  const [isFilterOpen, setFilterOpen] = useState(false);

  const downloadReport = () => {
    const report = [
      `${workspaceName} Dashboard Report`,
      `Generated: ${new Date().toLocaleString()}`,
      '',
      `Gross Revenue: ${formatCurrency(metrics.grossRevenue, 2)}`,
      `Active Orders: ${metrics.activeOrders}`,
      `Total Products: ${metrics.totalProducts}`,
      `Total Customers: ${metrics.totalCustomers}`,
      `Total Units Sold: ${metrics.totalUnitsSold}`,
      `AI Insights: ${metrics.insightCount}`,
    ].join('\n');
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'shopmind-dashboard-report.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[32px] bg-[var(--card-bg)] border border-[var(--border)] p-8 md:p-12 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(168,85,247,0.15),transparent_50%)]"></div>
        <div className="relative z-10 max-w-3xl">
          <ScrollReveal>
            <h1 className="text-[clamp(40px,5vw,64px)] font-extrabold leading-[1.05] tracking-tighter mb-6">
              Precision Intelligence <br />
              <span className="gradient-text">For Your Business.</span>
            </h1>
            <p className="text-lg text-[var(--text-muted)] mb-8 max-w-xl">
              Welcome back, {ownerName}. {workspaceName} is connected to Supabase.
              {loading && ' Loading dashboard data...'}
              {!loading && !error && hasData && ` Tracking ${metrics.totalProducts} products, ${metrics.totalCustomers} customers, and ${metrics.activeOrders} active orders.`}
              {!loading && !error && !hasData && ' No data yet.'}
            </p>
            {error && (
              <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm font-semibold text-rose-300">
                {error}
              </div>
            )}
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => setReportModalOpen(true)}
                className="btn-primary flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Quick Report
              </button>
              <button 
                onClick={() => setDocsModalOpen(true)}
                className="px-6 py-2 rounded-xl border border-[var(--border)] font-semibold hover:bg-[var(--hover-bg)] transition-all flex items-center gap-2"
              >
                <HelpCircle className="w-4 h-4" />
                Documentation
              </button>
              <div className="relative">
                <button 
                  onClick={() => setFilterOpen(!isFilterOpen)}
                  className="px-6 py-2 rounded-xl border border-[var(--border)] font-semibold hover:bg-[var(--hover-bg)] transition-all flex items-center gap-2"
                >
                  <FilterIcon className="w-4 h-4" />
                  Filter
                </button>
                {isFilterOpen && (
                  <div className="absolute top-full mt-2 left-0 w-48 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <button className="w-full text-left px-4 py-2 hover:bg-[var(--hover-bg)] rounded-lg text-sm transition-colors">Last 7 Days</button>
                    <button className="w-full text-left px-4 py-2 hover:bg-[var(--hover-bg)] rounded-lg text-sm transition-colors">Last 30 Days</button>
                    <button className="w-full text-left px-4 py-2 hover:bg-[var(--hover-bg)] rounded-lg text-sm transition-colors">This Year</button>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setConfigModalOpen(true)}
                className="px-6 py-2 rounded-xl border border-[var(--border)] font-semibold hover:bg-[var(--hover-bg)] transition-all flex items-center gap-2"
              >
                <SettingsIcon className="w-4 h-4" />
                + Configure
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
        
        {/* Metric Cards - 4 small ones */}
        <ScrollReveal delay={0.1}>
          <div 
            onClick={() => navigate('/sales')}
            className="card-premium p-6 h-full flex flex-col justify-between group hover:scale-[1.02]"
          >
            <div className="flex justify-between items-start">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)] font-medium">Gross Revenue</p>
              <MetricValue loading={loading} hasData={hasData}>{formatCurrency(metrics.grossRevenue)}</MetricValue>
              <p className="text-xs text-green-500 mt-2 font-bold">Completed orders only</p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div 
            onClick={() => navigate('/inventory')}
            className="card-premium p-6 h-full flex flex-col justify-between group hover:scale-[1.02]"
          >
            <div className="flex justify-between items-start">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <ShoppingCart className="w-6 h-6 text-purple-500" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)] font-medium">Active Orders</p>
              <MetricValue loading={loading} hasData={hasData}>{metrics.activeOrders}</MetricValue>
              <p className="text-xs text-blue-500 mt-2 font-bold">Pending and processing orders</p>
            </div>
          </div>
        </ScrollReveal>

        {/* Tall Card spanning 2 rows */}
        <ScrollReveal delay={0.3} className="lg:row-span-2">
          <div className="card-premium p-6 h-full flex flex-col hover:scale-[1.02]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Top Products</h3>
              <button className="text-[var(--text-muted)] hover:text-[var(--text)]">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 w-full min-h-[300px]">
              {loading && <EmptyChart>Loading products...</EmptyChart>}
              {!loading && !hasData && <EmptyChart>No data yet</EmptyChart>}
              {!loading && hasData && metrics.topProducts.length === 0 && <EmptyChart>No completed product sales yet</EmptyChart>}
              {!loading && metrics.topProducts.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.topProducts} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      stroke="var(--text-muted)" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      width={80}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#F1F1EE' }}
                    />
                    <Bar dataKey="sales" fill="#0066FF" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Total Sales</span>
                <span className="font-bold">{hasData ? `${metrics.totalUnitsSold.toLocaleString()} units` : 'No data yet'}</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Large Card spanning 2 columns */}
        <ScrollReveal delay={0.4} className="md:col-span-2">
          <div className="card-premium p-6 h-full flex flex-col hover:scale-[1.02]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold">Revenue Overview</h3>
                <p className="text-sm text-[var(--text-muted)]">12-month performance analysis</p>
              </div>
              <select className="bg-white/5 border border-[var(--border)] rounded-lg px-3 py-1 text-xs outline-none focus:border-[var(--accent)] transition-colors">
                <option>2026</option>
                <option>2025</option>
              </select>
            </div>
            <div className="flex-1 w-full min-h-[250px]">
              {loading && <EmptyChart>Loading revenue...</EmptyChart>}
              {!loading && !hasData && <EmptyChart>No data yet</EmptyChart>}
              {!loading && hasData && metrics.grossRevenue === 0 && <EmptyChart>No completed order revenue yet</EmptyChart>}
              {!loading && metrics.grossRevenue > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.revenueOverview}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0066FF" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0066FF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="name" 
                      stroke="var(--text-muted)" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="var(--text-muted)" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#F1F1EE' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#0066FF" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Remaining 2 small cards */}
        <ScrollReveal delay={0.5}>
          <div 
            onClick={() => navigate('/ai-advisor')}
            className="card-premium p-6 h-full flex flex-col justify-between group hover:scale-[1.02]"
          >
            <div className="flex justify-between items-start">
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <Zap className="w-6 h-6 text-emerald-500" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)] font-medium">Total Products</p>
              <MetricValue loading={loading} hasData={hasData}>{metrics.totalProducts}</MetricValue>
              <p className="text-xs text-emerald-500 mt-2 font-bold">{hasData ? `${formatCurrency(metrics.averageOrderValue, 2)} average completed order` : 'No data yet'}</p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.6}>
          <div 
            onClick={() => navigate('/customers')}
            className="card-premium p-6 h-full flex flex-col justify-between group hover:scale-[1.02]"
          >
            <div className="flex justify-between items-start">
              <div className="p-3 bg-indigo-500/10 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-indigo-500" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)] font-medium">Customer Trust</p>
              <MetricValue loading={loading} hasData={hasData}>{metrics.totalCustomers}</MetricValue>
              <p className="text-xs text-indigo-500 mt-2 font-bold">Total customers</p>
            </div>
          </div>
        </ScrollReveal>

      </div>

      {/* Modals */}
      <Modal 
        isOpen={isReportModalOpen} 
        onClose={() => setReportModalOpen(false)} 
        title="Quick Report - Q2 2026"
      >
        <div className="space-y-4">
          <div className="p-4 bg-[var(--hover-bg)] rounded-xl border border-[var(--border)]">
            <h4 className="font-bold mb-2">Executive Summary</h4>
            <p className="text-sm text-[var(--text-muted)]">
              {hasData
                ? `Gross revenue is ${formatCurrency(metrics.grossRevenue, 2)} from completed orders. There are ${metrics.activeOrders} active orders, ${metrics.totalProducts} products, and ${metrics.totalCustomers} customers.`
                : 'No data yet.'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[var(--hover-bg)] rounded-xl border border-[var(--border)]">
              <p className="text-xs text-[var(--text-muted)]">Active Orders</p>
              <p className="font-bold">{hasData ? metrics.activeOrders : 'No data yet'}</p>
            </div>
            <div className="p-4 bg-[var(--hover-bg)] rounded-xl border border-[var(--border)]">
              <p className="text-xs text-[var(--text-muted)]">Products</p>
              <p className="font-bold">{hasData ? metrics.totalProducts : 'No data yet'}</p>
            </div>
          </div>
          <button className="btn-primary w-full" onClick={downloadReport}>Download Report</button>
        </div>
      </Modal>

      <Modal 
        isOpen={isConfigModalOpen} 
        onClose={() => setConfigModalOpen(false)} 
        title="System Configuration"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="p-4 bg-[var(--hover-bg)] rounded-xl border border-[var(--border)]">
              <p className="text-sm text-[var(--text-muted)]">
                Dashboard data now comes from Supabase tables. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then run `supabase/dashboard_schema.sql` in Supabase if the tables do not exist.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="flex-1 px-6 py-3 rounded-xl border border-[var(--border)] font-semibold hover:bg-[var(--hover-bg)]" onClick={() => setConfigModalOpen(false)}>Cancel</button>
            <button className="flex-1 btn-primary" onClick={() => setConfigModalOpen(false)}>Done</button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={isDocsModalOpen} 
        onClose={() => setDocsModalOpen(false)} 
        title="Documentation"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-muted)]">
            Welcome to the NexusAdmin Documentation. Select a topic below to learn more.
          </p>
          <div className="grid gap-2">
            {['Getting Started', 'Module Configuration', 'API Reference', 'Security Best Practices'].map((topic) => (
              <button key={topic} className="w-full text-left p-4 hover:bg-[var(--hover-bg)] rounded-xl border border-[var(--border)] transition-all flex justify-between items-center group">
                <span>{topic}</span>
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all text-[var(--accent)]" />
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
