import React from 'react';
import {
  AlertTriangle,
  Bot,
  Boxes,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Users,
  Database,
  Wifi,
  Activity,
  BarChart3,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useDashboardData } from '../hooks/useDashboardData';
import { EmptyState, ErrorState, LoadingState, MetricCard, formatCurrency } from '../components/ui';
import Cubes from '../components/Cubes';
import HeroScrollStack from '../components/HeroScrollStack';
import { useInView, useCountUp } from '../hooks/useScrollEffects';

const ChartCard = ({ title, description, children }) => (
  <section className="card-premium p-6">
    <div className="mb-5">
      <h3 className="text-xl font-black text-[var(--text)]">{title}</h3>
      {description && <p className="mt-1 text-sm font-medium text-[var(--text-muted)]">{description}</p>}
    </div>
    <div className="h-[300px]">{children}</div>
  </section>
);

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};

/* ─── Animated KPI card with count-up ──────────────────────────────── */
const AnimatedMetricCard = ({ icon: Icon, label, value, numericValue, helper, loading, accent, onClick, delay = 0 }) => {
  const [ref, isVisible] = useInView({ threshold: 0.2 });
  const counted = useCountUp(numericValue || 0, isVisible, 1200);
  const isCurrency = typeof value === 'string' && value.startsWith('$');

  return (
    <div
      ref={ref}
      className="metric-card-scroll"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      <MetricCard
        icon={Icon}
        label={label}
        value={loading ? '...' : (numericValue > 0 ? (isCurrency ? formatCurrency(counted, 0) : counted) : value)}
        helper={helper}
        loading={loading}
        accent={accent}
        onClick={onClick}
      />
    </div>
  );
};

const Dashboard = () => {
  const { loading, error, hasData, metrics } = useDashboardData();

  return (
    <div className="page-enter space-y-10">
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden rounded-[2rem] bg-[var(--card-bg)] border border-[var(--border)] p-6 md:p-10 lg:p-14">
        {/* Decorative gradient — stays behind content */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(16,185,129,0.06),transparent_40rem),radial-gradient(circle_at_80%_70%,rgba(139,92,246,0.06),transparent_40rem)] pointer-events-none z-0" />

        <div className="relative z-[1] grid gap-10 lg:grid-cols-2 lg:items-center">
          {/* Left: Copy & Actions */}
          <div className="space-y-6">
            <div>
              <p className="inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-emerald-600 border border-emerald-500/20 mb-5">
                Live Business OS
              </p>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-[var(--text)] leading-[1.1]">
                Your AI Business <br /> Command Center
              </h1>
              <p className="mt-3 max-w-xl text-base font-medium leading-relaxed text-[var(--text-muted)]">
                Track products, orders, customers, revenue, and inventory from one intelligent workspace.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => scrollTo('ai-advisor')} className="btn-primary flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Ask AI Advisor
              </button>
              <button onClick={() => scrollTo('data-entry')} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-5 py-2.5 text-sm font-bold text-[var(--text)] transition hover:border-emerald-500/30 hover:bg-[var(--hover-bg)]">
                Add New Data
              </button>
            </div>

            <div className="flex flex-wrap gap-3 pt-4 border-t border-[var(--border)]">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] bg-[var(--hover-bg)] px-3 py-1.5 rounded-lg">
                <Database className="w-3.5 h-3.5 text-emerald-500" />
                Supabase Connected
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] bg-[var(--hover-bg)] px-3 py-1.5 rounded-lg">
                <Wifi className="w-3.5 h-3.5 text-blue-500" />
                OpenRouter Online
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] bg-[var(--hover-bg)] px-3 py-1.5 rounded-lg">
                <Activity className="w-3.5 h-3.5 text-purple-500" />
                Real-time Data
              </div>
            </div>
          </div>

          {/* Right: Premium Airy Visual */}
          <div className="relative hidden md:flex items-center justify-center" style={{ height: 420 }}>
            {/* Background Atmosphere */}
            <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none z-0">
              {/* Soft Glow Blobs — theme aware */}
              <div className="glow-blob w-[300px] h-[300px] bg-[var(--accent)] opacity-[0.08] -top-20 -left-20" />
              <div className="glow-blob w-[300px] h-[300px] bg-[var(--accent-2)] opacity-[0.08] -bottom-20 -right-20" />
              <div className="glow-blob w-[200px] h-[200px] bg-[var(--accent)] opacity-[0.04] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              
              {/* Abstract Glass Panels */}
              <div className="absolute top-10 right-10 w-32 h-32 glass-panel-light rotate-12 opacity-40" />
              <div className="absolute bottom-10 left-10 w-24 h-24 glass-panel-light -rotate-12 opacity-30" />

              {/* Extremely Subtle Cube Grid (Airy version) */}
              <Cubes
                faceColor="transparent"
                borderColor="rgba(var(--cube-border), 0.12)"
                cubeSize={52}
                gap={12}
                opacity={0.04}
              />
            </div>

            {/* Central 3D Cube Visual */}
            <div className="relative z-[1]" style={{ width: 300, height: 300 }}>
              <div className="cube-container absolute inset-0 m-auto" style={{ width: 220, height: 220 }}>
                {/* Soft Orbit rings */}
                <div className="orbit-ring orbit-ring-1 opacity-40">
                  <div className="orbit-dot orbit-dot-emerald" />
                </div>
                <div className="orbit-ring orbit-ring-2 opacity-30">
                  <div className="orbit-dot orbit-dot-violet" />
                </div>
                <div className="orbit-ring orbit-ring-3 opacity-20">
                  <div className="orbit-dot orbit-dot-blue" />
                </div>

                <div className="hero-cube">
                  <div className="cube-face cube-front">
                    <Sparkles className="w-24 h-24 text-emerald-500" />
                  </div>
                  <div className="cube-face cube-back">
                    <BarChart3 className="w-24 h-24 text-blue-500" />
                  </div>
                  <div className="cube-face cube-right">
                    <Bot className="w-24 h-24 text-violet-500" />
                  </div>
                  <div className="cube-face cube-left">
                    <Boxes className="w-24 h-24 text-emerald-400" />
                  </div>
                  <div className="cube-face cube-top" />
                  <div className="cube-face cube-bottom" />
                </div>
              </div>

              {/* Floating Mini Cards — kept inside the 260px box, no negative positioning */}
              <div className="absolute left-0 top-2 floating-card bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-2.5 shadow-md flex items-center gap-2 text-xs pointer-events-none">
                <div className="bg-emerald-500/10 p-1.5 rounded-lg text-emerald-500"><TrendingUp className="w-3.5 h-3.5" /></div>
                <div>
                  <p className="text-[9px] uppercase font-black tracking-wider text-[var(--text-muted)]">Revenue</p>
                  <p className="text-xs font-bold text-[var(--text)]">{loading ? '...' : formatCurrency(metrics.grossRevenue, 0)}</p>
                </div>
              </div>

              <div className="absolute right-0 top-8 floating-card floating-card-delay-1 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-2.5 shadow-md flex items-center gap-2 text-xs pointer-events-none">
                <div className="bg-blue-500/10 p-1.5 rounded-lg text-blue-500"><ShoppingCart className="w-3.5 h-3.5" /></div>
                <div>
                  <p className="text-[9px] uppercase font-black tracking-wider text-[var(--text-muted)]">Orders</p>
                  <p className="text-xs font-bold text-[var(--text)]">{loading ? '...' : metrics.activeOrders}</p>
                </div>
              </div>

              <div className="absolute left-2 bottom-0 floating-card floating-card-delay-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-2.5 shadow-md flex items-center gap-2 text-xs pointer-events-none">
                <div className="bg-violet-500/10 p-1.5 rounded-lg text-violet-500"><Bot className="w-3.5 h-3.5" /></div>
                <div>
                  <p className="text-[9px] uppercase font-black tracking-wider text-[var(--text-muted)]">AI</p>
                  <p className="text-xs font-bold text-[var(--text)]">Ready</p>
                </div>
              </div>

              <div className="absolute right-2 bottom-4 floating-card floating-card-delay-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-2.5 shadow-md flex items-center gap-2 text-xs pointer-events-none">
                <div className="bg-emerald-500/10 p-1.5 rounded-lg text-emerald-500"><Boxes className="w-3.5 h-3.5" /></div>
                <div>
                  <p className="text-[9px] uppercase font-black tracking-wider text-[var(--text-muted)]">Products</p>
                  <p className="text-xs font-bold text-[var(--text)]">{loading ? '...' : metrics.totalProducts}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ErrorState message={error} />

      {/* ═══ ScrollStack ═══ */}
      <HeroScrollStack />

      {!loading && !error && !hasData && (
        <EmptyState
          icon={Sparkles}
          title="Your dashboard is ready for real data"
          description="No Supabase business records exist yet. Add products, customers, and orders from Data Entry to activate every chart and AI summary."
          action={<button onClick={() => scrollTo('data-entry')} className="btn-primary">Open Data Entry</button>}
        />
      )}

      {/* ═══ KPI CARDS — simple responsive grid, no perpetual RAF ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <AnimatedMetricCard icon={TrendingUp} label="Revenue" value={formatCurrency(metrics.grossRevenue, 0)} numericValue={metrics.grossRevenue} helper="Completed orders only" loading={loading} accent="emerald" onClick={() => scrollTo('sales')} delay={0} />
        <AnimatedMetricCard icon={ShoppingCart} label="Orders" value={String(metrics.activeOrders)} numericValue={metrics.activeOrders} helper="Pending and processing" loading={loading} accent="blue" onClick={() => scrollTo('sales')} delay={80} />
        <AnimatedMetricCard icon={Boxes} label="Products" value={String(metrics.totalProducts)} numericValue={metrics.totalProducts} helper="Products table" loading={loading} accent="emerald" onClick={() => scrollTo('inventory')} delay={160} />
        <AnimatedMetricCard icon={Users} label="Customers" value={String(metrics.totalCustomers)} numericValue={metrics.totalCustomers} helper="Customers table" loading={loading} accent="indigo" onClick={() => scrollTo('customers')} delay={240} />
        <AnimatedMetricCard icon={AlertTriangle} label="Low Stock" value={String(metrics.lowStockCount)} numericValue={metrics.lowStockCount} helper="Stock at or below 5" loading={loading} accent="amber" onClick={() => scrollTo('inventory')} delay={320} />
      </div>

      {/* ═══ Charts ═══ */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartReveal>
          <ChartCard title="Monthly Revenue" description="Completed order totals for the current year.">
            {loading && <LoadingState label="Loading revenue..." />}
            {!loading && metrics.grossRevenue === 0 && <EmptyState icon={TrendingUp} title="No completed revenue yet" description="Create completed orders to populate this chart." />}
            {!loading && metrics.grossRevenue > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.revenueOverview}>
                  <defs>
                    <linearGradient id="dashboardRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(15,23,42,0.06)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12 }} />
                  <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} fill="url(#dashboardRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </ChartReveal>

        <ChartReveal delay={120}>
          <ChartCard title="Top Products" description="Product-level sales from completed orders and order_items.">
            {loading && <LoadingState label="Loading products..." />}
            {!loading && metrics.topProducts.length === 0 && <EmptyState icon={Boxes} title="No product-level sales yet" description="Create orders with products to unlock this chart." />}
            {!loading && metrics.topProducts.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.topProducts} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(15,23,42,0.06)" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={110} stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(16,185,129,0.06)' }} contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12 }} />
                  <Bar dataKey="sales" fill="#8B5CF6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </ChartReveal>
      </div>
    </div>
  );
};

/* ─── Chart reveal — simple opacity + translateY, no clip-path ─────── */
const ChartReveal = ({ children, delay = 0 }) => {
  const [ref, isVisible] = useInView({ threshold: 0.1 });
  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

export default Dashboard;
