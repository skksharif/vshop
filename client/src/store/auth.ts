import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuth: boolean;
  rememberMe: boolean;
  login: (user: User, accessToken: string, rememberMe?: boolean) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuth: false,
      rememberMe: false,

      login: (user, accessToken, rememberMe = false) => {
        set({
          user,
          accessToken,
          
          isAuth: true,
          rememberMe,
        });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          isAuth: false,
          rememberMe: false,
        });
      },

      setUser: (user) => set({ user }),
      setToken: (accessToken) => set({ accessToken, isAuth: !!accessToken }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        rememberMe: state.rememberMe,
        isAuth: state.isAuth,
      }),
    }
  )
);
