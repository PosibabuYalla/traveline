import { Bell, User, Sun, Moon, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';

interface NavbarProps {
  onMenuToggle?: () => void;
  darkMode: boolean;
  onThemeToggle: () => void;
}

export const Navbar = ({ onMenuToggle, darkMode, onThemeToggle }: NavbarProps) => {
  const { driver, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await authService.logout(); } catch {}
    logout();
    navigate('/login');
  };

  return (
    <header className="h-14 bg-white/80 backdrop-blur-md border-b border-white/60 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button onClick={onMenuToggle} className="md:hidden p-1.5 rounded-lg hover:bg-slate-100">
            <Menu className="w-5 h-5 text-navy-600" />
          </button>
        )}
        <div>
          <h1 className="text-sm font-semibold text-navy-700 hidden sm:block">
            Welcome back, <span className="text-gradient-gold">{driver?.fullName?.split(' ')[0] || 'Driver'}</span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onThemeToggle}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
          title="Toggle theme"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          onClick={() => navigate('/notifications')}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors relative"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-gold-500" />
        </button>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gold-100 flex items-center justify-center">
              <User className="w-4 h-4 text-gold-600" />
            </div>
            <span className="text-sm font-medium text-navy-700 hidden sm:block">
              {driver?.fullName?.split(' ')[0] || 'Driver'}
            </span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-44 glass-card py-1 shadow-lg">
              <button onClick={() => { navigate('/profile'); setDropdownOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-navy-700 hover:bg-gold-50">
                My Profile
              </button>
              <button onClick={() => { navigate('/settings'); setDropdownOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-navy-700 hover:bg-gold-50">
                Settings
              </button>
              <hr className="my-1 border-white/60" />
              <button onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
