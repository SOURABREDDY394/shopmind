import React from 'react';
import {
  TrendingUp,
  Package,
  Users,
  Sparkles,
  ArrowRight,
  DollarSign,
  BarChart3,
  Bot,
  Zap,
  AlertTriangle,
  ShoppingCart,
} from 'lucide-react';
import ScrollStack, { ScrollStackItem } from './ScrollStack';

// ─── Accent Pill ──────────────────────────────────────────────────────────────
const Pill = ({ children, color = 'emerald' }) => {
  const colors = {
    emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25',
    blue: 'bg-blue-500/10 text-blue-600 border-blue-500/25',
    violet: 'bg-violet-500/10 text-violet-600 border-violet-500/25',
    amber: 'bg-amber-500/10 text-amber-600 border-amber-500/25',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] px-3 py-1 rounded-full border ${colors[color]}`}>
      {children}
    </span>
  );
};

// ─── Mini Stat Tile ───────────────────────────────────────────────────────────
const StatTile = ({ icon: Icon, label, value, accent = 'emerald' }) => {
  const bg = {
    emerald: 'bg-emerald-500/8 border-emerald-500/20 text-emerald-600',
    blue: 'bg-blue-500/8 border-blue-500/20 text-blue-600',
    violet: 'bg-violet-500/8 border-violet-500/20 text-violet-600',
    amber: 'bg-amber-500/8 border-amber-500/20 text-amber-600',
  };
  return (
    <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${bg[accent]}`}>
      <Icon className="w-4 h-4 shrink-0" />
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</p>
        <p className="text-sm font-black">{value}</p>
      </div>
    </div>
  );
};

// ─── Card 1 — Revenue Intelligence ───────────────────────────────────────────
const RevenueCard = () => (
  <div className="relative w-full h-full flex flex-col justify-between p-8 md:p-12 overflow-hidden">
    {/* Card BG glow */}
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/6 via-transparent to-blue-500/6 pointer-events-none" />
    <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

    <div className="relative z-10 flex flex-col gap-8 h-full">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <Pill color="emerald">
            <TrendingUp className="w-3 h-3" />
            Revenue Intelligence
          </Pill>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 leading-tight">
            Every dollar.<br />Tracked live.
          </h2>
          <p className="text-slate-500 font-medium max-w-sm leading-relaxed">
            Completed order revenue, monthly trends, and gross sales — pulled directly from your Supabase orders table. No estimates.
          </p>
        </div>
        <div className="hidden md:flex w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 items-center justify-center shrink-0">
          <DollarSign className="w-8 h-8 text-emerald-600" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-auto">
        <StatTile icon={TrendingUp} label="Gross Revenue" value="From orders" accent="emerald" />
        <StatTile icon={BarChart3} label="Monthly Chart" value="Recharts" accent="blue" />
        <StatTile icon={ShoppingCart} label="Order Count" value="All statuses" accent="emerald" />
      </div>

      <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold group cursor-pointer w-fit">
        <span>View Sales Analytics</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </div>
);

// ─── Card 2 — Inventory Radar ─────────────────────────────────────────────────
const InventoryCard = () => (
  <div className="relative w-full h-full flex flex-col justify-between p-8 md:p-12 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/6 via-transparent to-violet-500/6 pointer-events-none" />
    <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />

    <div className="relative z-10 flex flex-col gap-8 h-full">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <Pill color="blue">
            <Package className="w-3 h-3" />
            Inventory Radar
          </Pill>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 leading-tight">
            Stock alerts.<br />Before it&apos;s too late.
          </h2>
          <p className="text-slate-500 font-medium max-w-sm leading-relaxed">
            Real product records from Supabase. Search, filter, and see low-stock flags the moment inventory drops — with inline edit.
          </p>
        </div>
        <div className="hidden md:flex w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 items-center justify-center shrink-0">
          <Package className="w-8 h-8 text-blue-600" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-auto">
        <StatTile icon={Package} label="Products" value="Live table" accent="blue" />
        <StatTile icon={AlertTriangle} label="Low Stock" value="≤ 5 units" accent="amber" />
        <StatTile icon={BarChart3} label="Inventory Val." value="Calculated" accent="blue" />
      </div>

      <div className="flex items-center gap-2 text-blue-600 text-sm font-bold group cursor-pointer w-fit">
        <span>Open Inventory</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </div>
);

// ─── Card 3 — Customer Intelligence ──────────────────────────────────────────
const CustomerCard = () => (
  <div className="relative w-full h-full flex flex-col justify-between p-8 md:p-12 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/6 via-transparent to-emerald-500/6 pointer-events-none" />
    <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-violet-400/10 blur-3xl pointer-events-none" />

    <div className="relative z-10 flex flex-col gap-8 h-full">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <Pill color="violet">
            <Users className="w-3 h-3" />
            Customer Intelligence
          </Pill>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 leading-tight">
            Know who<br />spends the most.
          </h2>
          <p className="text-slate-500 font-medium max-w-sm leading-relaxed">
            Real Supabase customers. Tier calculation, pending due amounts, transaction ledger, and last-active timestamps — all computed live.
          </p>
        </div>
        <div className="hidden md:flex w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 items-center justify-center shrink-0">
          <Users className="w-8 h-8 text-violet-600" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-auto">
        <StatTile icon={Users} label="Customers" value="Supabase" accent="violet" />
        <StatTile icon={Zap} label="Tier Engine" value="Silver→Diamond" accent="amber" />
        <StatTile icon={ShoppingCart} label="Due Tracker" value="Pending orders" accent="violet" />
      </div>

      <div className="flex items-center gap-2 text-violet-600 text-sm font-bold group cursor-pointer w-fit">
        <span>View Customers</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </div>
);

// ─── Card 4 — AI Advisor ──────────────────────────────────────────────────────
const AIAdvisorCard = () => (
  <div className="relative w-full h-full flex flex-col justify-between p-8 md:p-12 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-violet-600/8 via-blue-500/5 to-emerald-500/6 pointer-events-none" />
    <div className="absolute -bottom-16 -right-16 w-72 h-72 rounded-full bg-violet-500/12 blur-3xl pointer-events-none" />
    {/* Subtle sparkle grid */}
    <div className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: 'radial-gradient(rgba(139,92,246,0.15) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        maskImage: 'radial-gradient(ellipse at 80% 20%, black 20%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse at 80% 20%, black 20%, transparent 70%)',
      }}
    />

    <div className="relative z-10 flex flex-col gap-8 h-full">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <Pill color="violet">
            <Sparkles className="w-3 h-3" />
            AI Advisor · OpenRouter
          </Pill>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 leading-tight">
            Ask anything.<br />Get business answers.
          </h2>
          <p className="text-slate-500 font-medium max-w-sm leading-relaxed">
            Supabase Edge Function gathers live context — products, orders, customers — then routes to OpenRouter. Real data. Real insight.
          </p>
        </div>
        <div className="hidden md:flex w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/30 items-center justify-center shrink-0 shadow-lg">
          <Bot className="w-8 h-8 text-violet-600" />
        </div>
      </div>

      {/* Mini chat preview */}
      <div className="mt-auto space-y-2">
        {[
          { role: 'user', msg: 'What should I restock first?' },
          { role: 'ai', msg: '3 products are at critical stock. Reorder Widget Pro (2 units) first based on order velocity.' },
        ].map((item, i) => (
          <div key={i} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs font-semibold leading-relaxed ${
              item.role === 'user'
                ? 'bg-blue-500/15 border border-blue-500/20 text-blue-800'
                : 'bg-white/70 border border-slate-200/80 text-slate-700 shadow-sm'
            }`}>
              {item.role === 'ai' && <span className="text-violet-500 font-black mr-1">AI →</span>}
              {item.msg}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 text-violet-600 text-sm font-bold group cursor-pointer w-fit">
        <span>Open AI Advisor</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </div>
);

// ─── Card shell: glass white card with premium border ─────────────────────────
const cardShellClass = `
  bg-[var(--card-bg)] backdrop-blur-md
  border border-[var(--border)]
  shadow-[0_2px_4px_rgba(0,0,0,0.03),0_8px_24px_-6px_var(--accent-glow)]
  transition-shadow duration-200
`.replace(/\s+/g, ' ').trim();

// ─── Section header ───────────────────────────────────────────────────────────
const SectionIntro = () => (
  <div className="text-center mb-6 space-y-3 px-4">
    <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600 bg-emerald-500/8 border border-emerald-500/20 px-4 py-1.5 rounded-full">
      <Sparkles className="w-3 h-3" />
      Platform Story
    </p>
    <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
      One workspace. Four superpowers.
    </h2>
    <p className="text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
      Scroll to see how ShopMind AI turns your Supabase data into actionable intelligence — section by section.
    </p>
  </div>
);

// ─── HeroScrollStack ──────────────────────────────────────────────────────────
const HeroScrollStack = () => {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative rounded-[2rem] overflow-hidden border border-slate-200/60 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Top intro stays visible above the scroll area */}
      <div className="pt-10 pb-4">
        <SectionIntro />
      </div>

      {/* ScrollStack area — controlled height, no overflow escape */}
      <div
        style={{ height: 'min(80vh, 640px)' }}
        className="relative w-full overflow-hidden"
      >
        <ScrollStack
          itemDistance={80}
          itemScale={0.02}
          itemStackDistance={20}
          stackPosition="18%"
          scaleEndPosition="8%"
          baseScale={0.92}
          rotationAmount={0.15}
          blurAmount={0}
          useWindowScroll={false}
          className="h-full"
        >
          <ScrollStackItem itemClassName={cardShellClass}>
            <RevenueCard />
          </ScrollStackItem>

          <ScrollStackItem itemClassName={cardShellClass}>
            <InventoryCard />
          </ScrollStackItem>

          <ScrollStackItem itemClassName={cardShellClass}>
            <CustomerCard />
          </ScrollStackItem>

          <ScrollStackItem itemClassName={cardShellClass}>
            <AIAdvisorCard />
          </ScrollStackItem>
        </ScrollStack>

        {/* Fade-out at bottom to signal continuation */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />
      </div>

      {/* CTA at bottom */}
      <div className="flex items-center justify-center gap-4 py-8 border-t border-slate-100">
        <button
          onClick={() => scrollTo('ai-advisor')}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Bot className="w-4 h-4" />
          Ask AI Advisor
        </button>
        <button
          onClick={() => scrollTo('inventory')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:border-emerald-500/40 hover:bg-emerald-50/50 transition-all"
        >
          <Package className="w-4 h-4" />
          View Inventory
        </button>
      </div>
    </div>
  );
};

export default HeroScrollStack;
