import { create } from 'zustand';

interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('soul_token'),
  setToken: (token: string) => {
    localStorage.setItem('soul_token', token);
    set({ token });
  },
  clearToken: () => {
    localStorage.removeItem('soul_token');
    set({ token: null });
  },
}));
