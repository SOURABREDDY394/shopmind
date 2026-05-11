import React, { useState } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Loader2
} from 'lucide-react';
import { useBusinessData } from '../context/BusinessDataContext';

const SalesAnalytics = () => {
  const { products, analytics, exportReport } = useBusinessData();
  const [isDownloading, setIsDownloading] = useState(false);
  const [visibleLines, setVisibleLines] = useState({ revenue: true, target: true });

  const toggleLine = (e) => {
    const { dataKey } = e;
    setVisibleLines(prev => ({ ...prev, [dataKey]: !prev[dataKey] }));
  };

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      exportReport();
      setIsDownloading(false);
    }, 300);
  };

  const stats = products.slice(0, 4).map((product, idx) => ({
    name: product.name,
    sales: Math.max(10, product.stock * 6),
    growth: `${idx % 3 === 0 ? '+' : ''}${(12 - idx * 2.2).toFixed(1)}%`,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text)]">Sales Analytics</h1>
          <p className="text-[var(--text-muted)] mt-1">Deep dive into your business performance and revenue trends.</p>
        </div>
        <div className="flex gap-2">
          <select className="bg-[var(--hover-bg)] border border-[var(--border)] rounded-xl px-4 py-2 text-sm focus:outline-none text-[var(--text)]">
            <option>Last 12 Months</option>
            <option>Last 30 Days</option>
            <option>This Quarter</option>
          </select>
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="btn-primary py-2 px-6 text-sm font-semibold flex items-center gap-2"
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Download Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-premium p-6 bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/20">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="flex items-center text-emerald-500 text-sm font-medium bg-emerald-500/10 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              14.5%
            </div>
          </div>
          <p className="text-sm text-[var(--text-muted)] font-medium">Total Revenue</p>
          <p className="text-3xl font-bold mt-1 text-[var(--text)]">${analytics.revenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        </div>
        
        <div className="card-premium p-6 bg-gradient-to-br from-purple-500/5 to-transparent border-purple-500/20">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div className="flex items-center text-emerald-500 text-sm font-medium bg-emerald-500/10 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              8.2%
            </div>
          </div>
          <p className="text-sm text-[var(--text-muted)] font-medium">Total Orders</p>
          <p className="text-3xl font-bold mt-1 text-[var(--text)]">{analytics.totalOrders.toLocaleString()}</p>
        </div>

        <div className="card-premium p-6 bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/20">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Users className="w-6 h-6" />
            </div>
            <div className="flex items-center text-rose-500 text-sm font-medium bg-rose-500/10 px-2 py-1 rounded-full">
              <ArrowDownRight className="w-4 h-4 mr-1" />
              1.4%
            </div>
          </div>
          <p className="text-sm text-[var(--text-muted)] font-medium">Avg Order Value</p>
          <p className="text-3xl font-bold mt-1 text-[var(--text)]">${analytics.avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-premium p-6 border-white/5">
          <h3 className="text-lg font-bold mb-6 text-[var(--text)]">Revenue Growth (Monthly)</h3>
          <div className="h-[350px] w-full text-[var(--text-muted)]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.monthly}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0066FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0066FF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d1a5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#34d1a5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="var(--text-muted)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="var(--text-muted)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `$${value/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: 'var(--text)' }}
                />
                <Legend 
                  onClick={toggleLine}
                  wrapperStyle={{ paddingTop: '20px' }}
                />
                {visibleLines.revenue && <Area type="monotone" dataKey="revenue" stroke="#0066FF" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />}
                {visibleLines.target && <Area type="monotone" dataKey="target" stroke="#34d1a5" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorTarget)" />}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-premium p-6 border-white/5">
          <h3 className="text-lg font-bold mb-6 text-[var(--text)]">Top 10 Products by Sales</h3>
          <div className="h-[350px] w-full text-[var(--text-muted)]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.topProducts} layout="vertical" margin={{ left: 40, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="var(--text-muted)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: 'var(--active-bg)' }}
                  contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px' }}
                  itemStyle={{ color: 'var(--text)' }}
                />
                <Bar dataKey="sales" radius={[0, 4, 4, 0]} barSize={20}>
                  {analytics.topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index < 3 ? '#0066FF' : '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card-premium p-6 border-white/5">
        <h3 className="text-lg font-bold mb-6 text-[var(--text)]">Performance Leaderboard</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.map((product, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-[var(--hover-bg)] rounded-2xl border border-[var(--border)] hover:border-blue-500/30 transition-all group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center font-bold text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                  {idx + 1}
                </div>
                <div>
                  <p className="font-semibold text-[var(--text)]">{product.name}</p>
                  <p className="text-sm text-[var(--text-muted)]">{product.sales} units sold</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold ${product.growth.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {product.growth}
                </div>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">Growth</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesAnalytics;
