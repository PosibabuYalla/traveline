import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { LoginPage } from '../pages/LoginPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { RegisterPage } from '../pages/RegisterPage';
import { RegistrationSuccessPage } from '../pages/RegistrationSuccessPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ProfilePage } from '../pages/ProfilePage';
import { DocumentsPage } from '../pages/DocumentsPage';
import { VehiclesPage } from '../pages/VehiclesPage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { AdminDriversPage } from '../pages/admin/AdminDriversPage';
import { AdminDriverDetailPage } from '../pages/admin/AdminDriverDetailPage';
import { AdminLayout } from '../layouts/AdminLayout';
import { NotFoundPage } from '../pages/NotFoundPage';

const TripHistoryPage = () => <div className="glass-card p-8 text-center text-slate-500">Trip History — Coming Soon</div>;
const EarningsPage = () => <div className="glass-card p-8 text-center text-slate-500">Earnings — Coming Soon</div>;
const SupportPage = () => <div className="glass-card p-8 text-center text-slate-500">Support — Coming Soon</div>;

export const AppRoutes = () => (
  <Routes>
    <Route element={<AuthLayout />}>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    </Route>
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/registration-success" element={<RegistrationSuccessPage />} />
    <Route element={<DashboardLayout />}>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/documents" element={<DocumentsPage />} />
      <Route path="/vehicles" element={<VehiclesPage />} />
      <Route path="/trips" element={<TripHistoryPage />} />
      <Route path="/earnings" element={<EarningsPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Route>
    {/* Admin */}
    <Route path="/admin/login" element={<AdminLoginPage />} />
    <Route element={<AdminLayout />}>
      <Route path="/admin/drivers" element={<AdminDriversPage />} />
      <Route path="/admin/drivers/:id" element={<AdminDriverDetailPage />} />
    </Route>
    <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);
