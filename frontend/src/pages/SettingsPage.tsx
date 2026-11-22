import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Bell, Shield, Sun, Moon, LogOut } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/api';
import { useToast } from '../components/ui/Toast';
import { useNavigate } from 'react-router-dom';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password required'),
  newPassword: z.string().min(8, 'At least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

type PasswordForm = z.infer<typeof passwordSchema>;

export const SettingsPage = () => {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [notifPrefs, setNotifPrefs] = useState({ registration: true, documents: true, system: true });
  const [pwLoading, setPwLoading] = useState(false);
  const { logout } = useAuthStore();
  const toast = useToast();
  const navigate = useNavigate();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const handleThemeToggle = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    if (next) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const handlePasswordChange = async (_data: PasswordForm) => {
    setPwLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      toast.success('Password changed', 'Your password has been updated.');
      reset();
    } catch {
      toast.error('Failed', 'Could not update password. Please try again.');
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-navy-700">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account preferences</p>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-gold-100 flex items-center justify-center">
            <Lock className="w-4 h-4 text-gold-600" />
          </div>
          <h3 className="font-semibold text-navy-700">Change Password</h3>
        </div>
        <form onSubmit={handleSubmit(handlePasswordChange)} className="space-y-4">
          <Input label="Current Password" type="password" error={errors.currentPassword?.message} required {...register('currentPassword')} />
          <Input label="New Password" type="password" error={errors.newPassword?.message} required {...register('newPassword')} />
          <Input label="Confirm New Password" type="password" error={errors.confirmPassword?.message} required {...register('confirmPassword')} />
          <Button type="submit" loading={pwLoading}>Update Password</Button>
        </form>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-gold-100 flex items-center justify-center">
            <Bell className="w-4 h-4 text-gold-600" />
          </div>
          <h3 className="font-semibold text-navy-700">Notification Preferences</h3>
        </div>
        <div className="space-y-4">
          {([
            { key: 'registration' as const, label: 'Registration Updates', desc: 'Status changes for your registration' },
            { key: 'documents' as const, label: 'Document Alerts', desc: 'Verification and expiry reminders' },
            { key: 'system' as const, label: 'System Notifications', desc: 'Platform updates and announcements' },
          ]).map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-navy-700">{label}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
              <button
                type="button"
                onClick={() => setNotifPrefs(p => ({ ...p, [key]: !p[key] }))}
                className={`w-11 h-6 rounded-full transition-colors ${notifPrefs[key] ? 'bg-gold-500' : 'bg-slate-300'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow mx-0.5 transition-transform ${notifPrefs[key] ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-gold-100 flex items-center justify-center">
            {darkMode ? <Moon className="w-4 h-4 text-gold-600" /> : <Sun className="w-4 h-4 text-gold-600" />}
          </div>
          <h3 className="font-semibold text-navy-700">Appearance</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-navy-700">Dark Mode</p>
            <p className="text-xs text-slate-500">Switch between light and dark theme</p>
          </div>
          <button
            type="button"
            onClick={handleThemeToggle}
            className={`w-11 h-6 rounded-full transition-colors ${darkMode ? 'bg-gold-500' : 'bg-slate-300'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow mx-0.5 transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-gold-100 flex items-center justify-center">
            <Shield className="w-4 h-4 text-gold-600" />
          </div>
          <h3 className="font-semibold text-navy-700">Privacy &amp; Security</h3>
        </div>
        <div className="space-y-3 text-sm text-slate-600">
          <p>Your documents are stored securely and only accessible to authorized TravelLine staff.</p>
          <p>Sensitive information such as Aadhaar and licence numbers are masked in the interface.</p>
          <p>All data transmissions are encrypted using industry-standard TLS encryption.</p>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
            <LogOut className="w-4 h-4 text-red-500" />
          </div>
          <h3 className="font-semibold text-navy-700">Account</h3>
        </div>
        <Button variant="danger" onClick={handleLogout} className="gap-2">
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </Card>
    </div>
  );
};
