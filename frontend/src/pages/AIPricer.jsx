import React, { useState, useEffect } from 'react';
import { Sparkles, Send, Bot, RefreshCw, AlertCircle } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

const AIPricer = () => {
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [response, setResponse] = useState('');
  const [displayedText, setDisplayedText] = useState('');

  const handleAnalyze = () => {
    if (!input) return;
    setIsAnalyzing(true);
    setResponse('');
    setDisplayedText('');
    
    // Simulate AI thinking
    setTimeout(() => {
      const mockResponse = `Based on current market trends and your inventory data for "${input}", I recommend a dynamic pricing strategy:

1. Target Price: $549.00 (Current: $599.00)
2. Strategic Reason: Your competitors have dropped prices by 8% in the last 48 hours. A 5% reduction will maintain your premium status while increasing volume by an estimated 14%.
3. Bundle Suggestion: Pair with "Neural Link V2" for a 10% discount to clear aging stock.

Confidence Score: 94%`;
      setResponse(mockResponse);
      setIsAnalyzing(false);
    }, 2000);
  };

  // Typing effect
  useEffect(() => {
    if (response && displayedText.length < response.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(response.slice(0, displayedText.length + 1));
      }, 20);
      return () => clearTimeout(timeout);
    }
  }, [response, displayedText]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <ScrollReveal>
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--surface-soft)] text-[var(--accent)] border border-[var(--accent)]/20 text-sm font-semibold">
            <Sparkles className="w-4 h-4" /> AI Powered Price Optimization
          </div>
          <h1 className="text-4xl font-black text-[var(--text)]">AI Price Advisor</h1>
          <p className="text-[var(--text-muted)] max-w-2xl mx-auto text-lg font-medium">
            Harness the power of Gemini AI to find the perfect price point for your products. 
            Analyzes competitor pricing, demand signals, and stock levels in real-time.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <div className="card-premium p-6">
          <div className="space-y-4">
            <label className="text-sm font-semibold text-[var(--text-muted)]">Describe the product or category you want to optimize</label>
            <div className="relative">
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. Optimize price for Quantum CPU i9 based on current tech market volatility..."
                className="w-full bg-[var(--hover-bg)] border border-[var(--border)] rounded-2xl p-6 pt-4 min-h-[120px] outline-none focus:border-[var(--accent)] transition-all resize-none text-lg text-[var(--text)]"
              />
              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || !input}
                className="absolute bottom-4 right-4 btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {isAnalyzing ? 'Analyzing...' : 'Generate Insights'}
              </button>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {(isAnalyzing || displayedText) && (
        <ScrollReveal>
          <div className="card-premium p-8 bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg)] border-[var(--accent)]/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center">
                <Bot className="text-white w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--text)]">ShopMind Intelligence</h3>
                <p className="text-xs text-[var(--text-muted)]">Model: Gemini 1.5 Pro</p>
              </div>
            </div>
            
            <div className="prose prose-slate dark:prose-invert max-w-none">
              {isAnalyzing ? (
                <div className="flex flex-col gap-3">
                  <div className="h-4 bg-[var(--hover-bg)] rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-[var(--hover-bg)] rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-[var(--hover-bg)] rounded w-5/6 animate-pulse"></div>
                </div>
              ) : (
                <div className="whitespace-pre-wrap leading-relaxed text-lg border-l-2 border-[var(--accent)] pl-6 text-[var(--text)] font-medium">
                  {displayedText}
                  {displayedText.length < response.length && <span className="inline-block w-2 h-5 bg-[var(--accent)] ml-1 animate-pulse"></span>}
                </div>
              )}
            </div>

            {!isAnalyzing && displayedText.length === response.length && (
              <div className="mt-8 flex gap-4">
                <button className="text-sm font-semibold text-[var(--accent)] hover:underline">Apply Pricing Now</button>
                <button className="text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text)]">Save to Reports</button>
              </div>
            )}
          </div>
        </ScrollReveal>
      )}

      <ScrollReveal delay={0.2}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[var(--hover-bg)] border border-[var(--border)] space-y-2">
            <AlertCircle className="w-5 h-5 text-blue-500" />
            <h4 className="font-bold text-[var(--text)]">Market Sentiment</h4>
            <p className="text-xs text-[var(--text-muted)]">Currently tracking 15+ competitor platforms across 3 regions.</p>
          </div>
          <div className="p-6 rounded-2xl bg-[var(--hover-bg)] border border-[var(--border)] space-y-2">
            <RefreshCw className="w-5 h-5 text-purple-500" />
            <h4 className="font-bold text-[var(--text)]">Real-time Data</h4>
            <p className="text-xs text-[var(--text-muted)]">Last synced with global markets 4 minutes ago.</p>
          </div>
          <div className="p-6 rounded-2xl bg-[var(--hover-bg)] border border-[var(--border)] space-y-2">
            <Bot className="text-[var(--accent)] w-5 h-5" />
            <h4 className="font-bold text-[var(--text)]">Neural Engine</h4>
            <p className="text-xs text-[var(--text-muted)]">Proprietary logic optimized for retail and enterprise SaaS.</p>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};

export default AIPricer;
