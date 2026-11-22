import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const adminApi = axios.create({ baseURL: API_BASE_URL, withCredentials: true, headers: { 'Content-Type': 'application/json' } });

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

export const adminService = {
  login: (email: string, password: string) => adminApi.post('/admin/login', { email, password }),
  getStats: () => adminApi.get('/admin/stats'),
  getDrivers: (params?: { status?: string; search?: string; page?: number }) => adminApi.get('/admin/drivers', { params }),
  getDriver: (id: string) => adminApi.get(`/admin/drivers/${id}`),
  updateStatus: (id: string, status: string, rejectionReason?: string) =>
    adminApi.put(`/admin/drivers/${id}/status`, { status, rejectionReason }),
  seedAdmin: (email: string, password: string, secret: string) =>
    adminApi.post('/admin/seed', { email, password, secret }),
};
