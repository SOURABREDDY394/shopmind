import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ActiveSectionContext } from '../context/ActiveSectionContext';
import { 
  LayoutDashboard, 
  Package, 
  BarChart3, 
  Sparkles, 
  Users, 
  Receipt,
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  LogOut,
} from 'lucide-react';

const getUserDisplayName = (user) => (
  user?.user_metadata?.full_name
  || user?.user_metadata?.name
  || user?.email
  || 'User'
);

const getUserInitials = (user) => {
  const name = getUserDisplayName(user);
  const source = name.includes('@') ? name.split('@')[0] : name;
  const parts = source
    .replace(/[^a-zA-Z0-9\s._-]/g, ' ')
    .split(/[\s._-]+/)
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return (parts[0] || 'U').slice(0, 2).toUpperCase();
};

const Layout = ({ children, user, onLogout }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const displayName = getUserDisplayName(user);
  const userEmail = user?.email || 'Authenticated user';
  const userInitials = getUserInitials(user);

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
    { name: 'Overview', icon: LayoutDashboard, id: 'overview' },
    { name: 'Inventory', icon: Package, id: 'inventory' },
    { name: 'Sales', icon: BarChart3, id: 'sales' },
    { name: 'Customers', icon: Users, id: 'customers' },
    { name: 'AI Advisor', icon: Sparkles, id: 'ai-advisor' },
    { name: 'Data Entry', icon: Receipt, id: 'data-entry' },
  ];

  return (
    <ActiveSectionContext.Provider value={{ activeSection, setActiveSection }}>
      <div className="flex min-h-screen bg-[var(--bg)]">
        {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[260px] bg-[var(--bg-secondary)] border-r border-[var(--border)] transition-transform duration-300 backdrop-blur-md
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex h-full flex-col">
          <div className="p-5 flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-[0_0_28px_rgba(47,123,255,0.35)]">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <div>
              <span className="block text-xl font-extrabold font-['Syne'] tracking-tight">ShopMind AI</span>
              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--text-muted)]">Business OS</span>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.name}
                  href={`#${link.id}`}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={(e) => {
                    setSidebarOpen(false);
                    // Let native anchor click handle scrolling
                  }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{link.name}</span>
                </a>
              );
            })}
          </nav>

          <div className="p-4 border-t border-[var(--border)]">
            <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-3 transition-colors hover:border-blue-500/30">
              <div className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {userInitials}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate text-[var(--text)]">{displayName}</p>
                <p className="text-xs text-[var(--text-muted)] truncate">{userEmail}</p>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="p-2 rounded-lg hover:bg-[var(--hover-bg)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:pl-[260px]">
        <header className="sticky top-0 z-40 bg-[var(--header-bg)] backdrop-blur-md border-b border-[var(--border)] shadow-sm transition-all duration-300">
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-lg font-black capitalize">
                {navLinks.find(l => l.id === activeSection)?.name || 'Overview'}
              </h2>
            </div>

            <div className="flex items-center gap-6">
              {/* Search Bar */}
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-[var(--hover-bg)] border border-[var(--border)] rounded-2xl text-[var(--text-muted)] text-sm group focus-within:border-[var(--accent)] focus-within:ring-4 focus-within:ring-blue-500/10 transition-all relative">
                <Search className="w-4 h-4" />
                <input 
                  ref={searchInputRef}
                  type="text" 
                  placeholder="Search anything..." 
                  className="bg-transparent border-none outline-none text-[var(--text)] placeholder:text-[var(--text-muted)] w-48"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="text-[10px] opacity-60 ml-2 px-1.5 py-0.5 bg-[var(--active-bg)] rounded-lg">Ctrl K</span>

                {searchQuery && (
                  <div className="absolute top-full mt-2 left-0 w-64 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase px-3 py-2">Quick Results</p>
                    {navLinks.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase())).map(link => (
                      <a 
                        key={link.id}
                        href={`#${link.id}`}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-[var(--hover-bg)] rounded-lg transition-colors text-[var(--text)]"
                        onClick={() => setSearchQuery('')}
                      >
                        <link.icon className="w-4 h-4 text-[var(--accent)]" />
                        <span>{link.name}</span>
                      </a>
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
                <button className="p-2 rounded-xl hover:bg-[var(--hover-bg)] transition-colors text-[var(--text-muted)] hover:text-[var(--text)] relative" title="Notifications">
                  <Bell className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6 xl:p-8">
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            {children}
          </div>
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
    </ActiveSectionContext.Provider>
  );
};

export default Layout;
