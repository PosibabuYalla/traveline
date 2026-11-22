import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard, User, FileText, Car, Clock, DollarSign,
  Bell, HelpCircle, Settings, LogOut, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/api';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/profile', icon: User, label: 'My Profile' },
  { to: '/documents', icon: FileText, label: 'My Documents' },
  { to: '/vehicles', icon: Car, label: 'My Vehicles' },
  { to: '/trips', icon: Clock, label: 'Trip History' },
  { to: '/earnings', icon: DollarSign, label: 'Earnings' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/support', icon: HelpCircle, label: 'Support' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const { logout, driver } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await authService.logout(); } catch {}
    logout();
    navigate('/login');
  };

  return (
    <aside className={cn('glass-sidebar fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300', collapsed ? 'w-16' : 'w-64')}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/40">
        <div className="w-9 h-9 rounded-xl btn-gold flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">TL</span>
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-navy-700 text-sm leading-none">TravelLine</p>
            <p className="text-xs text-slate-500 mt-0.5">Driver Portal</p>
          </div>
        )}
      </div>

      {/* Driver quick info */}
      {!collapsed && driver && (
        <div className="px-4 py-3 border-b border-white/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center">
              <User className="w-4 h-4 text-gold-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-navy-700 truncate">{driver.fullName}</p>
              <p className="text-xs text-slate-500 truncate">ID: {driver.registrationId}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-gradient-to-r from-gold-500/15 to-gold-400/10 text-gold-700 border border-gold-200/50'
                  : 'text-slate-600 hover:bg-white/60 hover:text-navy-700'
              )
            }
            title={collapsed ? label : undefined}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-2 py-3 border-t border-white/40">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3.5 top-20 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center hover:bg-gold-50 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5 text-navy-500" /> : <ChevronLeft className="w-3.5 h-3.5 text-navy-500" />}
      </button>
    </aside>
  );
};
