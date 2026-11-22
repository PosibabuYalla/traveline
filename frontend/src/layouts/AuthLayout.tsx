import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const AuthLayout = () => {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};
