import React from 'react';
import { Sparkles, Bot, Plus } from 'lucide-react';
import { useInView } from '../hooks/useScrollEffects';

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};

const FooterCTA = () => {
  const [ref, isVisible] = useInView({ threshold: 0.3 });

  return (
    <div ref={ref} className="relative overflow-hidden rounded-[2rem] border border-[var(--border)]">
      {/* Gradient background — decorative, behind content */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-soft)] via-[var(--bg)] to-[var(--surface-soft)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,var(--accent-glow),transparent_50%),radial-gradient(circle_at_70%_50%,rgba(139,92,246,0.06),transparent_50%)] pointer-events-none z-0" />

      <div className="relative z-[1] py-16 px-6 flex flex-col items-center text-center">
        {/* Icon */}
        <div
          className="mb-6"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(12px)',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
          }}
        >
          <div className="relative w-16 h-16">
            <div className="absolute inset-[-8px] rounded-full border border-[var(--accent)] opacity-20 orbit-ring" style={{ animation: 'orbit-spin 16s linear infinite' }} />
            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] flex items-center justify-center shadow-md">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400" />
          </div>
        </div>

        {/* Heading */}
        <h2
          className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-[var(--text)] max-w-2xl leading-tight"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s',
          }}
        >
          Your business data is now{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500">
            intelligent.
          </span>
        </h2>

        <p
          className="mt-3 text-[var(--text-muted)] font-medium max-w-lg leading-relaxed"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.4s ease 0.2s, transform 0.4s ease 0.2s',
          }}
        >
          Every product, order, customer, and insight — tracked live from Supabase, analyzed by AI.
        </p>

        {/* Buttons */}
        <div
          className="mt-6 flex flex-wrap items-center justify-center gap-4"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.4s ease 0.3s, transform 0.4s ease 0.3s',
          }}
        >
          <button
            onClick={() => scrollTo('ai-advisor')}
            className="btn-primary flex items-center gap-2.5 px-8 py-3.5 text-sm"
          >
            <Bot className="w-5 h-5" />
            Ask AI Advisor
          </button>
          <button
            onClick={() => scrollTo('data-entry')}
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text)] text-sm font-bold hover:border-emerald-500/40 hover:bg-[var(--hover-bg)] transition-all shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Add New Data
          </button>
        </div>

        {/* Bottom status */}
        <div
          className="mt-8 flex flex-wrap items-center gap-3 text-xs font-bold text-[var(--text-muted)]"
          style={{
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.4s ease 0.4s',
          }}
        >
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Supabase Connected
          </span>
          <span className="opacity-30">·</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            OpenRouter Online
          </span>
          <span className="opacity-30">·</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-violet-500" />
            Real-time Data
          </span>
        </div>
      </div>
    </div>
  );
};

export default FooterCTA;
