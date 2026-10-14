import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
  MoreVertical,
  Home,
  LayoutDashboard,
  UserPlus,
  Armchair,
  Wallet,
  AlertCircle,
  History,
  BarChart3,
  Settings,
  Info,
} from 'lucide-react';

const menuItems = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Student Dashboard', path: '/students', icon: LayoutDashboard },
  { label: 'New Student Registration', path: '/registration', icon: UserPlus },
  { label: 'Seat Management', path: '/seats', icon: Armchair },
  { label: 'Fee & Payment Dashboard', path: '/fees', icon: Wallet },
  { label: 'Pending Fees', path: '/pending-fees', icon: AlertCircle },
  { label: 'Payment History', path: '/payment-history', icon: History },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
  { label: 'Settings', path: '/settings', icon: Settings },
];

const pageTitles: Record<string, string> = {
  '/': 'Home',
  '/students': 'Student Management',
  '/registration': 'New Student Registration',
  '/seats': 'Seat Management',
  '/fees': 'Fee & Payment Dashboard',
  '/pending-fees': 'Pending Fees',
  '/payment-history': 'Payment History',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

export default function QuickActionMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigate = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10 hover:text-white"
        aria-label="Quick action menu"
        aria-expanded={open}
      >
        <MoreVertical className="h-5 w-5" />
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-white/10 bg-slate-900/70 p-2 shadow-2xl backdrop-blur-lg">
          <div className="mb-1 flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Info className="h-3.5 w-3.5" />
            Navigation
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
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
          <div className="my-1 border-t border-white/10" />
          <div className="px-3 py-2 text-xs text-slate-500">
            Version 1 — Frontend Preview
          </div>
        </div>
      )}
    </div>
  );
}

export { menuItems, pageTitles };
