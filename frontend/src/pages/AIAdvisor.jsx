import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  AlertCircle,
  BarChart2,
  Bot,
  Loader2,
  Send,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { ErrorState, PageShell, formatCurrency } from '../components/ui';
import { useInView, useStaggeredReveal } from '../hooks/useScrollEffects';

const exampleQuestions = [
  'What should I restock first?',
  'Which products generate the most revenue?',
  'Which customers have pending orders?',
  'How can I improve sales this week?',
];

const greetingPattern = /^(hi|hello|hey|yo|namaste|good morning|good afternoon|good evening)[!. ]*$/i;

const AIAdvisor = () => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi, I am ShopMind AI. Ask me about stock, revenue, customers, or orders and I will use your Supabase business data.',
    },
  ]);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);

  const askAdvisor = async (event, chipQuestion) => {
    event?.preventDefault();
    const prompt = (chipQuestion || question).trim();
    if (!prompt) return;

    setMessages((current) => [...current, { role: 'user', content: prompt }]);
    setQuestion('');
    setError('');

    if (greetingPattern.test(prompt)) {
      setMessages((current) => [...current, { role: 'assistant', content: 'Hey. I am ready. Ask me what to restock, which products are selling, or where orders are pending.' }]);
      return;
    }

    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.');
      return;
    }

    setLoading(true);
    setSummary(null);

    const { data, error: functionError } = await supabase.functions.invoke('ai-advisor', {
      body: { question: prompt },
    });

    setLoading(false);

    if (functionError) {
      setError(functionError.message || 'AI Advisor Edge Function failed.');
      return;
    }

    if (data?.error) {
      setError(data.error);
      setSummary(data.businessSummary || null);
      return;
    }

    setSummary(data?.businessSummary || null);
    setMessages((current) => [...current, { role: 'assistant', content: data?.answer || 'I did not receive an answer from the advisor.' }]);
  };

  return (
    <PageShell
      eyebrow="OpenRouter via Supabase Edge Function"
      title="AI Advisor"
      description="Ask business questions in a focused chat. The browser sends questions to Supabase, and the Edge Function gathers business context before calling OpenRouter."
    >
      <ErrorState message={error} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_1fr] ai-section-wrapper">
        <aside className="space-y-6">
          <PromptChips askAdvisor={askAdvisor} />


          {summary && (
            <section className="grid gap-3">
              <div className="card-premium p-5">
                <TrendingUp className="mb-3 h-5 w-5 text-emerald-400" />
                <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Gross Revenue</p>
                <p className="mt-1 text-2xl font-black text-[var(--text)]">{formatCurrency(summary.grossRevenue || 0)}</p>
              </div>
              <div className="card-premium p-5">
                <BarChart2 className="mb-3 h-5 w-5 text-blue-400" />
                <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Active Orders</p>
                <p className="mt-1 text-2xl font-black text-[var(--text)]">{summary.counts?.activeOrders || 0}</p>
              </div>
            </section>
          )}
        </aside>

        <section className="card-premium flex min-h-[640px] flex-col overflow-hidden ai-chat-pinned">
          <div className="border-b border-[var(--border)] bg-[var(--surface-soft)] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 p-3 text-white shadow-[0_0_28px_rgba(139,92,246,0.35)]">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[var(--text)]">ShopMind AI Chat</h3>
                <p className="text-xs font-semibold text-[var(--text-muted)]">Business answers, grounded in your data</p>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto p-5 md:p-6">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[86%] rounded-3xl border px-5 py-4 text-sm leading-7 shadow-md ${
                  message.role === 'user'
                    ? 'border-blue-500/25 bg-blue-500/15 text-blue-50'
                    : 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text)]'
                }`}>
                  {message.role === 'assistant' ? (
                    <div className="prose prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-1 prose-strong:text-white">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  ) : message.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-3 rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] px-5 py-4 text-sm font-bold text-[var(--text-muted)]">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="ml-2">Fetching Supabase context...</span>
                </div>
              </div>
            )}
            {error && (
              <div className="flex justify-start">
                <div className="flex max-w-[86%] items-start gap-3 rounded-3xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-sm font-semibold text-rose-200">
                  <AlertCircle className="mt-1 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={askAdvisor} className="border-t border-[var(--border)] bg-[var(--surface-soft)] p-4">
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask about revenue, restocking, pending orders, or customers..."
                className="input-premium flex-1"
                disabled={loading}
              />
              <button disabled={loading || !question.trim()} className="btn-primary flex items-center justify-center gap-2 px-6 disabled:opacity-50">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                Send
              </button>
            </div>
          </form>
        </section>
      </div>
    </PageShell>
  );
};

/* ─── Staggered prompt chip reveals ────────────────────────────────── */
const PromptChips = ({ askAdvisor }) => {
  const [ref, isVisible] = useInView({ threshold: 0.3 });
  const revealed = useStaggeredReveal(exampleQuestions.length, isVisible, 150);

  return (
    <section ref={ref} className="card-premium p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-2xl bg-purple-500/15 p-3 text-purple-300">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-black text-[var(--text)]">Prompt Starters</h3>
          <p className="text-xs font-semibold text-[var(--text-muted)]">Uses real Supabase data</p>
        </div>
      </div>
      <div className="space-y-2">
        {exampleQuestions.map((item, idx) => (
          <button
            key={item}
            onClick={(event) => askAdvisor(event, item)}
            className={`ai-chip-reveal w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-left text-sm font-bold text-[var(--text)] transition-colors hover:bg-purple-500/10 ${revealed[idx] ? 'visible' : ''}`}
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  );
};

export default AIAdvisor;
