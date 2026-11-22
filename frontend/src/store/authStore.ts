import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Driver, User } from '../types';

interface AuthState {
  user: User | null;
  driver: Driver | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setDriver: (driver: Driver | null) => void;
  setAccessToken: (token: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      driver: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setDriver: (driver) => set({ driver }),
      setAccessToken: (token) => {
        if (token) localStorage.setItem('accessToken', token);
        else localStorage.removeItem('accessToken');
        set({ accessToken: token });
      },
      setIsLoading: (isLoading) => set({ isLoading }),
      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, driver: null, accessToken: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        driver: state.driver,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
