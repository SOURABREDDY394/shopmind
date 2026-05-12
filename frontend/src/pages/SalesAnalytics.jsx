import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Download,
  Loader2,
} from 'lucide-react';
import { useSalesData } from '../hooks/useSalesData';
import { EmptyState, ErrorState, LoadingState, MetricCard, PageShell } from '../components/ui';
import { useInView, useCountUp } from '../hooks/useScrollEffects';

const formatCurrency = (value) => `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

const EmptyChart = ({ children }) => (
  <div className="h-full min-h-[260px] flex items-center justify-center text-sm font-semibold text-[var(--text-muted)]">
    {children}
  </div>
);

const SalesAnalytics = () => {
  const { loading, error, hasData, metrics } = useSalesData();
  const [isDownloading, setIsDownloading] = useState(false);
  const [visibleLines, setVisibleLines] = useState({ revenue: true });

  const toggleLine = (e) => {
    const { dataKey } = e;
    setVisibleLines((prev) => ({ ...prev, [dataKey]: !prev[dataKey] }));
  };

  const hasCompletedRevenue = metrics.totalRevenue > 0;
  const hasProductSales = metrics.topProducts.length > 0;

  const handleDownload = () => {
    setIsDownloading(true);
    const report = [
      'ShopMind Sales Report',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      `Total Revenue: ${formatCurrency(metrics.totalRevenue)}`,
      `Total Orders: ${metrics.totalOrders}`,
      `Completed Orders: ${metrics.completedOrders}`,
      `Average Order Value: ${formatCurrency(metrics.avgOrderValue)}`,
      `Top Products: ${metrics.topProducts.map((product) => `${product.name} (${product.sales})`).join(', ') || 'No data yet'}`,
    ].join('\n');

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'shopmind-sales-report.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setIsDownloading(false);
  };

  return (
    <PageShell
      eyebrow="Sales"
      title="Sales Analytics"
      description="Deep dive into real Supabase orders and order_items only. No synthetic growth or placeholder sales."
      actions={(
        <div className="flex gap-2">
          <select className="bg-[var(--hover-bg)] border border-[var(--border)] rounded-xl px-4 py-2 text-sm focus:outline-none text-[var(--text)]">
            <option>Current Year</option>
            <option>Completed Orders</option>
            <option>All Orders</option>
          </select>
          <button
            onClick={handleDownload}
            disabled={isDownloading || loading}
            className="btn-primary py-2 px-6 text-sm font-semibold flex items-center gap-2"
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Download Report
          </button>
        </div>
      )}
    >

      <ErrorState message={error} />

      <SalesMetricCards loading={loading} metrics={metrics} />


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartDrawIn>
          <h3 className="text-lg font-bold mb-6 text-[var(--text)]">Revenue Growth (Monthly)</h3>
          <div className="h-[350px] w-full text-[var(--text-muted)]">
            {loading && <LoadingState label="Loading revenue..." />}
            {!loading && !hasData && <EmptyChart>No data yet</EmptyChart>}
            {!loading && hasData && !hasCompletedRevenue && <EmptyState icon={DollarSign} title="No completed order revenue yet" description="Create completed orders to unlock monthly revenue." />}
            {!loading && hasCompletedRevenue && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0066FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0066FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ color: 'var(--text)' }}
                  />
                  <Legend onClick={toggleLine} wrapperStyle={{ paddingTop: '20px' }} />
                  {visibleLines.revenue && <Area type="monotone" dataKey="revenue" stroke="#0066FF" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />}
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartDrawIn>

        <ChartSlideIn>
          <h3 className="text-lg font-bold mb-6 text-[var(--text)]">Top 10 Products by Sales</h3>
          <div className="h-[350px] w-full text-[var(--text-muted)]">
            {loading && <LoadingState label="Loading product sales..." />}
            {!loading && !hasData && <EmptyChart>No data yet</EmptyChart>}
            {!loading && hasData && !hasProductSales && <EmptyState icon={ShoppingCart} title="No product-level sales yet" description="Create orders with products to unlock this chart." />}
            {!loading && hasProductSales && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.topProducts} layout="vertical" margin={{ left: 40, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} width={100} />
                  <Tooltip
                    cursor={{ fill: 'var(--active-bg)' }}
                    contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px' }}
                    itemStyle={{ color: 'var(--text)' }}
                  />
                  <Bar dataKey="sales" radius={[0, 4, 4, 0]} barSize={20}>
                    {metrics.topProducts.map((entry, index) => (
                      <Cell key={`cell-${entry.id || index}`} fill={index < 3 ? '#0066FF' : '#94a3b8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartSlideIn>
      </div>

      <LeaderboardReveal>
        <div className="card-premium p-6 border-white/5">
          <h3 className="text-lg font-bold mb-6 text-[var(--text)]">Performance Leaderboard</h3>
          {loading && <LoadingState label="Loading leaderboard..." />}
          {!loading && !hasData && <EmptyState icon={ShoppingCart} title="No sales yet" description="Orders and order_items from Supabase will appear here." />}
          {!loading && hasData && metrics.leaderboard.length === 0 && <EmptyState icon={ShoppingCart} title="No product-level sales yet" description="Create orders with products to unlock this chart." />}
          {!loading && metrics.leaderboard.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metrics.leaderboard.map((product, idx) => (
                <div key={product.id || product.name} className="flex items-center justify-between p-4 bg-[var(--hover-bg)] rounded-2xl border border-[var(--border)] hover:border-blue-500/30 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center font-bold text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--text)]">{product.name}</p>
                      <p className="text-sm text-[var(--text-muted)]">{product.sales} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-500">
                      {formatCurrency(product.revenue)}
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </LeaderboardReveal>
    </PageShell>
  );
};

/* ─── Sales metric cards with count-up ─────────────────────────────── */
const SalesMetricCards = ({ loading, metrics }) => {
  const [ref, isVisible] = useInView({ threshold: 0.3 });
  const revenue = useCountUp(metrics.totalRevenue, isVisible, 1400);
  const avgOrder = useCountUp(metrics.avgOrderValue, isVisible, 1400);

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <MetricCard icon={DollarSign} label="Completed Revenue" value={loading ? '...' : formatCurrency(revenue)} helper="Completed orders only" loading={loading} accent="blue" />
      </div>
      <div className={`transition-all duration-500 delay-75 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <MetricCard icon={ShoppingCart} label="Total Orders" value={metrics.totalOrders.toLocaleString()} helper="All order statuses" loading={loading} accent="purple" />
      </div>
      <div className={`transition-all duration-500 delay-150 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <MetricCard icon={Users} label="Average Order Value" value={loading ? '...' : formatCurrency(avgOrder)} helper="Completed orders only" loading={loading} accent="amber" />
      </div>
    </div>
  );
};

/* ─── Chart animation wrappers ─────────────────────────────────────── */
const ChartDrawIn = ({ children }) => {
  const [ref, isVisible] = useInView({ threshold: 0.15 });
  return (
    <div ref={ref} className={`card-premium p-6 border-white/5 chart-draw-in ${isVisible ? 'visible' : ''}`}>
      {children}
    </div>
  );
};

const ChartSlideIn = ({ children }) => {
  const [ref, isVisible] = useInView({ threshold: 0.15 });
  return (
    <div ref={ref} className={`card-premium p-6 border-white/5 sales-slide-left ${isVisible ? 'visible' : ''}`}>
      {children}
    </div>
  );
};

const LeaderboardReveal = ({ children }) => {
  const [ref, isVisible] = useInView({ threshold: 0.15 });
  return (
    <div ref={ref} className={`sales-slide-right ${isVisible ? 'visible' : ''}`}>
      {children}
    </div>
  );
};

export default SalesAnalytics;
