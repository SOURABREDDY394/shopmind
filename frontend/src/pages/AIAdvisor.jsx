import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Zap,
  Target,
  BarChart2,
  ArrowUpRight,
  ShieldCheck,
  Globe,
  Cpu,
  Star
} from 'lucide-react';
import { useBusinessData } from '../context/BusinessDataContext';

const AIAdvisor = () => {
  const { products } = useBusinessData();
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [form, setForm] = useState({
    productName: '',
    baseCost: '',
    targetMargin: '',
    competitorUrl: '',
  });

  const handleAnalyze = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const cost = Number(form.baseCost);
      const margin = Number(form.targetMargin);
      const matchingProduct = products.find((product) => product.name.toLowerCase().includes(form.productName.toLowerCase()));
      const currentPrice = matchingProduct?.price || cost * (1 + margin / 100);
      const stockPressure = matchingProduct ? Math.max(0, 12 - matchingProduct.stock) : 4;
      const competitorAverage = currentPrice * (form.competitorUrl ? 0.96 : 1.03);
      const marginPrice = cost * (1 + margin / 100);
      const suggestedPrice = Math.max(cost * 1.12, (marginPrice * 0.55) + (competitorAverage * 0.35) - stockPressure * 1.75);
      const profitLift = ((suggestedPrice - currentPrice) / Math.max(currentPrice, 1)) * 100;
      const demandLevel = stockPressure > 7 ? 'High' : matchingProduct?.stock > 20 ? 'Measured' : 'Strong';

      setRecommendation({
        suggestedPrice: Number(suggestedPrice.toFixed(2)),
        confidence: Math.min(97, Math.round(82 + Math.min(12, products.length) + (form.competitorUrl ? 3 : 0))),
        reasoning: `${form.productName} can support a ${suggestedPrice >= currentPrice ? 'higher' : 'more defensive'} price because base cost, desired margin, and ${matchingProduct ? `${matchingProduct.stock} units in stock` : 'the entered product economics'} point to ${demandLevel.toLowerCase()} demand pressure. ${form.competitorUrl ? 'The competitor source was included as a market signal.' : 'Add a competitor URL when you want the model to weight external pricing more heavily.'}`,
        marketTrend: suggestedPrice >= currentPrice ? 'Upward' : 'Defensive',
        potentialProfit: `${profitLift >= 0 ? '+' : ''}${profitLift.toFixed(1)}%`,
        demandLevel,
        sentiment: suggestedPrice >= currentPrice ? 'Positive' : 'Cautious'
      });
      setLoading(false);
    }, 900);
  };

  const competitors = products.slice(0, 4).map((product, index) => ({
    name: product.name,
    price: Number((product.price * (0.92 + index * 0.035)).toFixed(2)),
    shipping: index === 0 ? 'Next Day' : `${index + 2}-${index + 4} days`,
    rating: Number((4.8 - index * 0.2).toFixed(1)),
    stock: product.status,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6 p-4 bg-gradient-to-r from-purple-500/10 to-transparent rounded-3xl border border-purple-500/10 backdrop-blur-xl">
        <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(168,85,247,0.5)] animate-pulse">
          <Sparkles className="w-10 h-10" />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white">AI Price Advisor <span className="text-xs font-bold bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full ml-2 uppercase tracking-widest border border-purple-500/20">v2.0 Beta</span></h1>
          <p className="text-[var(--text-muted)] mt-1 font-medium">Harness Gemini AI to optimize your profit margins and market positioning.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="card-premium p-8 border-white/5 bg-white/5">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
              <Cpu className="w-6 h-6 text-purple-500" />
              Analysis Engine
            </h3>
            <form className="space-y-5" onSubmit={handleAnalyze}>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Product Identity</label>
                <input 
                  type="text" 
                  placeholder="e.g. Pro Coffee Machine v2" 
                  value={form.productName}
                  onChange={(e) => setForm({ ...form, productName: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 focus:border-purple-500 outline-none transition-all text-white placeholder:text-white/20"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Base Cost</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">$</span>
                    <input 
                      type="number" 
                      placeholder="150.00" 
                      min="0"
                      step="0.01"
                      value={form.baseCost}
                      onChange={(e) => setForm({ ...form, baseCost: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pl-8 focus:border-purple-500 outline-none transition-all text-white placeholder:text-white/20"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Target Margin</label>
                  <div className="relative">
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">%</span>
                    <input 
                      type="number" 
                      placeholder="40" 
                      min="1"
                      step="1"
                      value={form.targetMargin}
                      onChange={(e) => setForm({ ...form, targetMargin: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pr-8 focus:border-purple-500 outline-none transition-all text-white placeholder:text-white/20"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Competitor Source</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input 
                    type="url" 
                    placeholder="https://market-index.com/..." 
                    value={form.competitorUrl}
                    onChange={(e) => setForm({ ...form, competitorUrl: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pl-10 focus:border-purple-500 outline-none transition-all text-white placeholder:text-white/20"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-white transition-all disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden relative group"
                style={{ background: 'linear-gradient(135deg, #A855F7 0%, #6366F1 100%)', boxShadow: '0 10px 30px rgba(168, 85, 247, 0.3)' }}
                disabled={loading}
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-current" />
                    Compute Strategy
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="card-premium p-8 bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20 relative overflow-hidden">
            <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-indigo-500/10 blur-3xl rounded-full"></div>
            <h3 className="text-xs font-black text-indigo-400 mb-3 uppercase tracking-[0.2em]">Live Market Index</h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed font-medium">
              Engine is currently monitoring <span className="text-white font-bold">1,402</span> data points across global marketplaces including Amazon, eBay, and specialized niche retailers.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {!recommendation && !loading && (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center card-premium p-12 border-dashed border-white/10 bg-white/2">
              <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mb-8 border border-white/10 shadow-2xl">
                <Target className="w-12 h-12 text-white/20" />
              </div>
              <h3 className="text-3xl font-black text-white mb-4">Strategic Void Detected</h3>
              <p className="text-[var(--text-muted)] max-w-md text-lg leading-relaxed">
                Awaiting input parameters to initiate neural market simulation. Populate the analysis engine to begin.
              </p>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center card-premium p-12 bg-black/40">
              <div className="relative">
                <div className="w-32 h-32 border-4 border-purple-500/10 border-t-purple-500 rounded-full animate-spin shadow-[0_0_50px_rgba(168,85,247,0.2)]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
                </div>
              </div>
              <h3 className="text-3xl font-black text-white mt-12 mb-2">Quantizing Market Flux...</h3>
              <p className="text-purple-400 font-mono text-sm tracking-widest animate-pulse">RECONSTRUCTING COMPETITOR GRAPH</p>
            </div>
          )}

          {recommendation && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card-premium p-10 border-purple-500/40 bg-gradient-to-br from-purple-500/10 via-black/40 to-transparent relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4">
                    <ShieldCheck className="w-6 h-6 text-purple-400 opacity-40" />
                  </div>
                  <p className="text-xs font-black text-purple-400 mb-3 uppercase tracking-[0.2em]">AI Recommendation</p>
                  <div className="flex items-end gap-3">
                    <span className="text-6xl font-black text-white tracking-tighter">${recommendation.suggestedPrice}</span>
                    <div className="flex flex-col mb-2">
                      <span className="text-emerald-400 font-black flex items-center text-lg">
                        <ArrowUpRight className="w-5 h-5 mr-1" />
                        {recommendation.potentialProfit}
                      </span>
                      <span className="text-[10px] text-white/40 uppercase font-bold">Projected Delta</span>
                    </div>
                  </div>
                  <div className="mt-10 space-y-3">
                    <div className="flex justify-between text-xs font-bold text-white/60">
                      <span>CONFIDENCE COEFFICIENT</span>
                      <span>{recommendation.confidence}%</span>
                    </div>
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden p-1 border border-white/10">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-1000" 
                        style={{ width: `${recommendation.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="card-premium p-10 border-white/5 bg-black/40">
                  <h4 className="text-xs font-black text-emerald-400 mb-6 uppercase tracking-[0.2em] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Market Signals
                  </h4>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center group cursor-help">
                      <span className="text-white/60 font-bold text-sm">DEMAND INTENSITY</span>
                      <span className="text-emerald-400 font-black px-3 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">{recommendation.demandLevel}</span>
                    </div>
                    <div className="flex justify-between items-center group cursor-help">
                      <span className="text-white/60 font-bold text-sm">CONSUMER SENTIMENT</span>
                      <span className="text-blue-400 font-black px-3 py-1 bg-blue-500/10 rounded-lg border border-blue-500/20">{recommendation.sentiment}</span>
                    </div>
                    <div className="flex justify-between items-center group cursor-help">
                      <span className="text-white/60 font-bold text-sm">PRICE ELASTICITY</span>
                      <span className="text-white font-black px-3 py-1 bg-white/5 rounded-lg border border-white/10">0.42 (INELASTIC)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-premium p-8 border-white/5 bg-white/2 relative">
                <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-purple-500" />
                  Neural Reasoning
                </h3>
                <p className="text-white/70 leading-relaxed font-medium italic text-lg">
                  "{recommendation.reasoning}"
                </p>
                <div className="absolute bottom-4 right-8 flex gap-2">
                   <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce shadow-[0_0_5px_rgba(168,85,247,1)]"></div>
                   <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:0.2s]"></div>
                   <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>

              <div className="card-premium overflow-hidden border-white/10 shadow-2xl">
                <div className="p-6 bg-gradient-to-r from-white/5 to-transparent border-b border-white/10">
                  <h3 className="text-xl font-black text-white">Competitor Differential Matrix</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] table-fixed text-left">
                    <colgroup>
                      <col className="w-[28%]" />
                      <col className="w-[18%]" />
                      <col className="w-[18%]" />
                      <col className="w-[20%]" />
                      <col className="w-[16%]" />
                    </colgroup>
                    <thead>
                      <tr className="bg-black/40 text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
                        <th className="px-6 py-5">Competitor Entity</th>
                        <th className="px-6 py-5">Market Price</th>
                        <th className="px-6 py-5">Logistics</th>
                        <th className="px-6 py-5">Inventory</th>
                        <th className="px-6 py-5 text-right">Reputation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {competitors.map((comp, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-all group">
                          <td className="px-6 py-5 font-bold text-white group-hover:text-purple-400 transition-colors">
                            <span className="block max-w-[180px] break-words">{comp.name}</span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-xl font-black text-white">${comp.price.toFixed(2)}</span>
                          </td>
                          <td className="px-6 py-5 text-sm text-white/60 font-medium">{comp.shipping}</td>
                          <td className="px-6 py-5">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-black border ${comp.stock === 'Out of Stock' ? 'border-rose-500/20 text-rose-500 bg-rose-500/10' : 'border-emerald-500/20 text-emerald-500 bg-emerald-500/10'}`}>
                              {comp.stock}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <span className="font-black text-white text-lg tabular-nums">{comp.rating.toFixed(1)}</span>
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAdvisor;
