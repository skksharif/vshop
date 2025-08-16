import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuth: boolean;
  rememberMe: boolean;
  isLoading: boolean;
  refreshTimer: NodeJS.Timeout | null;
  
  // Actions
  login: (user: User, accessToken: string, refreshToken: string, rememberMe?: boolean) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (accessToken: string) => void;
  setLoading: (loading: boolean) => void;
  clearRefreshTimer: () => void;
  setRefreshTimer: (timer: NodeJS.Timeout) => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuth: false,
      rememberMe: false,
      isLoading: false,
      refreshTimer: null,

      login: (user, accessToken, refreshToken, rememberMe = false) => {
        // Clear any existing refresh timer
        const currentTimer = get().refreshTimer;
        if (currentTimer) {
          clearTimeout(currentTimer);
        }

        set({
          user,
          accessToken,
          refreshToken,
          isAuth: true,
          rememberMe,
          isLoading: false,
        });

        // Set up automatic token refresh every 14 minutes (840 seconds)
        const timer = setTimeout(() => {
          get().scheduleTokenRefresh();
        }, 14 * 60 * 1000); // 14 minutes

        set({ refreshTimer: timer });
      },

      logout: () => {
        // Clear refresh timer on logout
        const timer = get().refreshTimer;
        if (timer) {
          clearTimeout(timer);
        }

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuth: false,
          rememberMe: false,
          isLoading: false,
          refreshTimer: null,
        });
      },

      setUser: (user) => set({ user }),
      
      setToken: (accessToken) => set({ 
        accessToken, 
        isAuth: !!accessToken 
      }),

      setLoading: (loading) => set({ isLoading: loading }),

      clearRefreshTimer: () => {
        const timer = get().refreshTimer;
        if (timer) {
          clearTimeout(timer);
          set({ refreshTimer: null });
        }
      },

      setRefreshTimer: (timer) => set({ refreshTimer: timer }),

      // Initialize authentication state on app startup
      initializeAuth: () => {
        const state = get();
        
        // If user has valid tokens and rememberMe is true, restore session
        if (state.accessToken && state.refreshToken && state.rememberMe) {
          set({ 
            isAuth: true,
            isLoading: false 
          });
          
          // Schedule token refresh
          const timer = setTimeout(() => {
            get().scheduleTokenRefresh();
          }, 14 * 60 * 1000); // 14 minutes
          
          set({ refreshTimer: timer });
        } else if (!state.rememberMe) {
          // If rememberMe is false, clear tokens on app restart
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuth: false,
            isLoading: false,
          });
        }
      },

      // Schedule automatic token refresh
      scheduleTokenRefresh: async () => {
        const { refreshToken, logout } = get();
        
        if (!refreshToken) {
          logout();
          return;
        }

        try {
          // Import here to avoid circular dependency
          const { refreshAccessToken } = await import('../services/auth');
          const newToken = await refreshAccessToken();
          
          if (newToken) {
            set({ accessToken: newToken });
            
            // Schedule next refresh
            const timer = setTimeout(() => {
              get().scheduleTokenRefresh();
            }, 14 * 60 * 1000); // 14 minutes
            
            set({ refreshTimer: timer });
          } else {
            // Refresh failed, logout user
            logout();
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          logout();
        }
      },
    }),
    {
      name: 'village-angel-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.rememberMe ? state.accessToken : null,
        refreshToken: state.rememberMe ? state.refreshToken : null,
        rememberMe: state.rememberMe,
        isAuth: state.rememberMe ? state.isAuth : false,
      }),
    }
  )
);