import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken } = res.data.data;
        localStorage.setItem('accessToken', accessToken);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (!window.location.pathname.startsWith('/register')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authService = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: object) =>
    api.post('/auth/register', data),
  logout: () =>
    api.post('/auth/logout'),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
  me: () =>
    api.get('/auth/me'),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
};

export const driverService = {
  registerStep: (step: number, data: object) =>
    api.put(`/drivers/registration/step/${step}`, data),
  submitRegistration: () =>
    api.post('/drivers/registration/submit'),
  getMe: () =>
    api.get('/drivers/me'),
  updateMe: (data: object) =>
    api.put('/drivers/me', data),
};

export const documentService = {
  upload: (formData: FormData) =>
    api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  saveUrl: (data: { documentType: string; fileUrl: string; fileName: string; mimeType?: string; fileSize?: number }) =>
    api.post('/documents/save-url', data),
  getMyDocuments: () =>
    api.get('/documents/me'),
  delete: (id: string) =>
    api.delete(`/documents/${id}`),
  resubmit: (id: string, formData: FormData) =>
    api.post(`/documents/${id}/resubmit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const vehicleService = {
  create: (data: object) =>
    api.post('/vehicles', data),
  getAll: () =>
    api.get('/vehicles'),
  getById: (id: string) =>
    api.get(`/vehicles/${id}`),
  update: (id: string, data: object) =>
    api.put(`/vehicles/${id}`, data),
  delete: (id: string) =>
    api.delete(`/vehicles/${id}`),
};

export const dashboardService = {
  getOverview: () =>
    api.get('/dashboard/overview'),
  getActivities: () =>
    api.get('/dashboard/activities'),
  getNotifications: () =>
    api.get('/dashboard/notifications'),
};

export const notificationService = {
  getAll: () =>
    api.get('/notifications'),
  markRead: (id: string) =>
    api.put(`/notifications/${id}/read`),
  markAllRead: () =>
    api.put('/notifications/read-all'),
};
