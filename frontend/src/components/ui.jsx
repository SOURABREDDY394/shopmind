import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

export const formatCurrency = (value, maximumFractionDigits = 2) => (
  `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits })}`
);

export const PageShell = ({ eyebrow, title, description, actions, children }) => (
  <div className="page-enter space-y-6">
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="section-eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-3xl font-black tracking-tight text-[var(--text)] md:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-[var(--text-muted)] md:text-base">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
    {children}
  </div>
);

export const MetricCard = ({ icon: Icon, label, value, helper, loading, accent = 'blue', onClick }) => {
  const accentClasses = {
    blue: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
    purple: 'border-purple-500/20 bg-purple-500/10 text-purple-400',
    emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
    rose: 'border-rose-500/20 bg-rose-500/10 text-rose-400',
    indigo: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400',
  };

  return (
  <button
    type="button"
    onClick={onClick}
    className="card-premium group w-full p-5 text-left"
  >
    <div className="flex items-start justify-between gap-4">
      <div className={`rounded-2xl border p-3 ${accentClasses[accent] || accentClasses.blue}`}>
        <Icon className="h-5 w-5" />
      </div>
      <span className="h-2 w-2 rounded-full bg-[var(--accent)] opacity-60 shadow-[0_0_18px_var(--accent-glow)] transition group-hover:opacity-100" />
    </div>
    <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</p>
    {loading ? <Skeleton className="mt-3 h-8 w-28" /> : <p className="mt-2 text-3xl font-black text-[var(--text)]">{value}</p>}
    {helper && <p className="mt-2 text-xs font-semibold text-[var(--text-muted)]">{helper}</p>}
  </button>
  );
};

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--border)] bg-[var(--surface-soft)] p-10 text-center">
    {Icon && (
      <div className="mb-5 rounded-3xl border border-[var(--border)] bg-[var(--hover-bg)] p-5 text-[var(--text-muted)]">
        <Icon className="h-10 w-10" />
      </div>
    )}
    <h3 className="text-xl font-black text-[var(--text)]">{title}</h3>
    {description && <p className="mt-2 max-w-md text-sm font-medium leading-6 text-[var(--text-muted)]">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export const ErrorState = ({ message }) => {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm font-semibold text-rose-200">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      <span>{message}</span>
    </div>
  );
};

export const LoadingState = ({ label = 'Loading real data...' }) => (
  <div className="flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] p-10 text-center">
    <Loader2 className="mb-4 h-8 w-8 animate-spin text-[var(--accent)]" />
    <p className="text-sm font-bold text-[var(--text-muted)]">{label}</p>
  </div>
);

export const Skeleton = ({ className = '' }) => (
  <div className={`skeleton rounded-xl ${className}`} />
);

export const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">{label}</span>
    {children}
  </label>
);
