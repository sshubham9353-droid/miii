import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Library, Menu, X, Home, LayoutDashboard, UserPlus, Armchair, Wallet, AlertCircle, History, BarChart3, Settings } from 'lucide-react';
import QuickActionMenu from './QuickActionMenu';
import { pageTitles } from './QuickActionMenu';
import { useLibrary } from '@/context/LibraryContext';

const navItems = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Students', path: '/students', icon: LayoutDashboard },
  { label: 'Registration', path: '/registration', icon: UserPlus },
  { label: 'Seats', path: '/seats', icon: Armchair },
  { label: 'Fees', path: '/fees', icon: Wallet },
  { label: 'Pending', path: '/pending-fees', icon: AlertCircle },
  { label: 'History', path: '/payment-history', icon: History },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export default function TopNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useLibrary();
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const currentTitle = pageTitles[location.pathname] || 'Library';

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    }
    if (mobileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [mobileOpen]);

  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 shadow-lg shadow-sky-500/20">
                <Library className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-sm font-semibold text-white">{settings.libraryName}</span>
              </div>
            </Link>
            <div className="mx-2 hidden h-6 w-px bg-white/10 sm:block" />
            <div className="hidden sm:block">
              <span className="text-sm font-medium text-slate-300">{currentTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-slate-400 md:block">{today}</span>
            <QuickActionMenu />
          </div>
        </div>

        <nav className="hidden border-t border-white/5 lg:block">
          <div className="mx-auto flex max-w-7xl items-center gap-1 px-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 border-b-2 px-3 py-2.5 text-xs font-medium transition ${
                    isActive
                      ? 'border-sky-400 text-sky-300'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />
          <div
            ref={drawerRef}
            className="absolute left-0 top-0 h-full w-72 border-r border-white/10 bg-slate-900/95 p-4 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500">
                  <Library className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-white">{settings.libraryName}</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300"
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                      isActive
                        ? 'bg-sky-500/15 text-sky-300'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
