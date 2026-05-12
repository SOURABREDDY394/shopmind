import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Loader2, Sparkles } from 'lucide-react';
import Layout from './components/Layout';
import MainPage from './pages/MainPage';
import SmoothScroll from './components/SmoothScroll';
import Login from './pages/Login';
import { BusinessDataProvider } from './context/BusinessDataContext';
import { isSupabaseConfigured, supabase } from './lib/supabaseClient';

const LoadingScreen = () => (
  <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-14 h-14 bg-[var(--accent)] rounded-2xl flex items-center justify-center shadow-[0_0_30px_var(--accent-glow)]">
        <Sparkles className="text-white w-8 h-8" />
      </div>
      <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" />
    </div>
  </div>
);

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthLoading(false);
      return undefined;
    }

    let isMounted = true;

    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (error) {
        console.error('Supabase auth check failed:', error);
      }

      setUser(data?.user ?? null);
      setAuthLoading(false);
    };

    loadUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Supabase logout failed:', error);
    }
  };

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <Router>
        <Toaster position="top-right" toastOptions={{ style: { background: '#0f172a', color: '#f8fafc', border: '1px solid rgba(148, 163, 184, 0.18)' } }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <BusinessDataProvider>
      <SmoothScroll />
      <Router>
        <Toaster position="top-right" toastOptions={{ style: { background: '#0f172a', color: '#f8fafc', border: '1px solid rgba(148, 163, 184, 0.18)' } }} />
        <Layout user={user} onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </Router>
    </BusinessDataProvider>
  );
}

export default App;
