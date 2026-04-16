import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: number;
  uuid: string;
  name: string;
  avatar: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (partialData: Partial<User>) => void;
  setToken: (token: string) => void; // Keeping setToken for silent refresh compatibility
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      login: (token, user) => {
        set({
          accessToken: token,
          user,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
        });
      },

      updateUser: (partialData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...partialData } : null,
        }));
      },

      setToken: (token) => {
        set({ accessToken: token });
      },
    }),
    {
      name: 'soul-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
