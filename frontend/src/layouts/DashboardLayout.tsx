import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/utils';

export const DashboardLayout = () => {
  const { isAuthenticated } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className={cn('min-h-screen gradient-bg')}>
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-navy-900/40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      </div>

      <div className={cn('md:hidden fixed left-0 top-0 h-full z-40 transition-transform duration-300', mobileOpen ? 'translate-x-0' : '-translate-x-full')}>
        <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
      </div>

      <div className={cn('transition-all duration-300', collapsed ? 'md:ml-16' : 'md:ml-64')}>
        <Navbar onMenuToggle={() => setMobileOpen((v) => !v)} darkMode={darkMode} onThemeToggle={() => setDarkMode((v) => !v)} />
        <main className="p-4 md:p-6 min-h-[calc(100vh-3.5rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
