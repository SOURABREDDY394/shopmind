import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  BarChart3, 
  Sparkles, 
  Users, 
  Receipt,
  Settings, 
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  User
} from 'lucide-react';

const Layout = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const searchInputRef = React.useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const navLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Inventory', icon: Package, path: '/inventory' },
    { name: 'Sales', icon: BarChart3, path: '/sales' },
    { name: 'AI Advisor', icon: Sparkles, path: '/ai-advisor' },
    { name: 'Customers', icon: Users, path: '/customers' },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[240px] bg-[var(--bg-secondary)] border-r border-[var(--border)] transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--accent)] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,102,255,0.3)]">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-extrabold font-['Syne'] tracking-tight">ShopMind AI</span>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-2 py-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-[var(--border)]">
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                SK
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate text-[var(--text)]">Sourav K.</p>
                <p className="text-xs text-[var(--text-muted)] truncate">Super Admin</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:pl-[240px]">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[var(--header-bg)] backdrop-blur-xl border-b border-[var(--border)] shadow-sm transition-all duration-300">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-lg font-semibold capitalize">
                {navLinks.find(l => l.path === location.pathname)?.name || 'Dashboard'}
              </h2>
            </div>

            <div className="flex items-center gap-6">
              {/* Search Bar */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[var(--hover-bg)] border border-[var(--border)] rounded-lg text-[var(--text-muted)] text-sm group focus-within:border-[var(--accent)] transition-all relative">
                <Search className="w-4 h-4" />
                <input 
                  ref={searchInputRef}
                  type="text" 
                  placeholder="Search anything..." 
                  className="bg-transparent border-none outline-none text-[var(--text)] placeholder:text-[var(--text-muted)] w-48"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="text-xs opacity-50 ml-2 px-1.5 py-0.5 bg-[var(--active-bg)] rounded">Ctrl+K</span>

                {searchQuery && (
                  <div className="absolute top-full mt-2 left-0 w-64 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase px-3 py-2">Quick Results</p>
                    {navLinks.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase())).map(link => (
                      <Link 
                        key={link.path}
                        to={link.path}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-[var(--hover-bg)] rounded-lg transition-colors text-[var(--text)]"
                        onClick={() => setSearchQuery('')}
                      >
                        <link.icon className="w-4 h-4 text-[var(--accent)]" />
                        <span>{link.name}</span>
                      </Link>
                    ))}
                    {navLinks.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                      <p className="px-3 py-4 text-center text-xs text-[var(--text-muted)]">No results found</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-[var(--hover-bg)] transition-colors text-[var(--text-muted)] hover:text-[var(--text)]"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button className="p-2 rounded-lg hover:bg-[var(--hover-bg)] transition-colors text-[var(--text-muted)] hover:text-[var(--text)] relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--bg)]"></span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Layout;
