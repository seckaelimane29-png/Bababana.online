import { create } from 'zustand';

import { api, getToken, setToken, RequestError } from '../services/api';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthModalOpen: boolean;
  authMode: 'login' | 'register';
  isSubmitting: boolean;
  authError: string | null;

  openAuthModal: (mode: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthModalOpen: false,
  authMode: 'login',
  isSubmitting: false,
  authError: null,

  openAuthModal: (mode) => set({ isAuthModalOpen: true, authMode: mode, authError: null }),
  closeAuthModal: () => set({ isAuthModalOpen: false, authError: null }),

  login: async (email, password) => {
    set({ isSubmitting: true, authError: null });
    try {
      const res = await api.login(email, password);
      setToken(res.access_token);
      set({ user: res.user, isAuthModalOpen: false, isSubmitting: false });
      return true;
    } catch (e) {
      set({
        isSubmitting: false,
        authError: e instanceof RequestError ? e.message : 'Error',
      });
      return false;
    }
  },

  register: async (email, password, name) => {
    set({ isSubmitting: true, authError: null });
    try {
      const res = await api.register(email, password, name);
      setToken(res.access_token);
      set({ user: res.user, isAuthModalOpen: false, isSubmitting: false });
      return true;
    } catch (e) {
      set({
        isSubmitting: false,
        authError: e instanceof RequestError ? e.message : 'Error',
      });
      return false;
    }
  },

  logout: () => {
    setToken(null);
    set({ user: null });
  },

  refreshUser: async () => {
    if (!getToken()) return;
    try {
      const user = await api.me();
      set({ user });
    } catch {
      setToken(null);
      set({ user: null });
    }
  },

  setUser: (user) => set({ user }),
}));
