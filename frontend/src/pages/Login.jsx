import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Lock, MailCheck, Sparkles } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

const Login = () => {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setNeedsConfirmation(false);

    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.');
      return;
    }

    setLoading(true);

    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name.trim() || email },
        },
      });

    setLoading(false);

    if (result.error) {
      if (result.error.message.toLowerCase().includes('email not confirmed')) {
        setNeedsConfirmation(true);
        setError('Please confirm your email before signing in. You can resend the confirmation email below.');
        return;
      }
      setError(result.error.message);
      return;
    }

    if (mode === 'signup' && !result.data.session) {
      setNeedsConfirmation(true);
      setMessage('Account created. Check your email to confirm your login.');
      toast.success('Confirmation email sent.');
      return;
    }

    setMessage('Signed in successfully.');
    toast.success('Signed in successfully.');
  };

  const resendConfirmation = async () => {
    if (!email) {
      setError('Enter your email first, then resend the confirmation email.');
      return;
    }

    setLoading(true);
    const { error: resendError } = await supabase.auth.resend({ type: 'signup', email });
    setLoading(false);

    if (resendError) {
      setError(resendError.message);
      toast.error(resendError.message);
      return;
    }

    setMessage('Confirmation email resent. Check your inbox.');
    toast.success('Confirmation email resent.');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center p-6">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(47,123,255,0.18),transparent_35rem)]" />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto mb-5 w-16 h-16 bg-[var(--accent)] rounded-2xl flex items-center justify-center shadow-[0_0_30px_var(--accent-glow)]">
            <Sparkles className="text-white w-9 h-9" />
          </div>
          <h1 className="text-4xl font-black tracking-tight">ShopMind AI</h1>
          <p className="text-[var(--text-muted)] mt-2">Sign in to access your business dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="card-premium p-8 space-y-5 border-white/10 bg-[var(--card-bg)]">
          <div className="flex rounded-2xl bg-[var(--hover-bg)] border border-[var(--border)] p-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-bold transition-all ${mode === 'login' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-bold transition-all ${mode === 'signup' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
            >
              Sign Up
            </button>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Name</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="input-premium"
                placeholder="Your name"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="input-premium"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="input-premium"
              placeholder="Password"
              minLength={6}
              required
            />
          </div>

          {error && <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm font-semibold text-rose-300">{error}</div>}
          {message && <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-300">{message}</div>}
          {needsConfirmation && (
            <button type="button" onClick={resendConfirmation} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm font-bold text-blue-200 transition hover:border-blue-500/40">
              <MailCheck className="h-4 w-4" />
              Resend confirmation email
            </button>
          )}

          <button disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-4 disabled:opacity-50">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
            {mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
