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
  scheduleTokenRefresh: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuth: false,
      rememberMe: false,
      isLoading: true, // Start with loading true
      refreshTimer: null,

      login: (user, accessToken, refreshToken, rememberMe = false) => {
        console.log('Village Angel: Logging in user:', user.fullName, 'Remember me:', rememberMe);
        
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
        
        console.log('Village Angel: Login successful, tokens stored, refresh scheduled');
      },

      logout: () => {
        console.log('Village Angel: Logging out user...');
        
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
        
        console.log('Village Angel: Logout complete, all state cleared');
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
        console.log('Village Angel: Initializing authentication state...');
        const state = get();
        
        console.log('Village Angel: Current state:', {
          hasAccessToken: !!state.accessToken,
          hasRefreshToken: !!state.refreshToken,
          rememberMe: state.rememberMe,
          isAuth: state.isAuth,
          hasUser: !!state.user
        });
        
        // If user has valid tokens, restore session
        if (state.accessToken && state.refreshToken && state.user) {
          console.log('Village Angel: Restoring session for user:', state.user.fullName);
          
          set({ 
            isAuth: true,
            isLoading: false 
          });
          
          // Schedule token refresh
          const timer = setTimeout(() => {
            get().scheduleTokenRefresh();
          }, 14 * 60 * 1000); // 14 minutes
          
          set({ refreshTimer: timer });
          
          console.log('Village Angel: Session restored, refresh scheduled');
        } else {
          console.log('Village Angel: No valid session found, clearing state');
          
          // Clear any invalid state
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuth: false,
            isLoading: false,
            refreshTimer: null,
          });
        }
      },

      // Schedule automatic token refresh
      scheduleTokenRefresh: async () => {
        console.log('Village Angel: Attempting token refresh...');
        const { refreshToken, logout } = get();
        
        if (!refreshToken) {
          console.log('Village Angel: No refresh token available, logging out');
          logout();
          return;
        }

        try {
          // Import here to avoid circular dependency
          const { refreshAccessToken } = await import('../services/auth');
          const newToken = await refreshAccessToken();
          
          if (newToken) {
            console.log('Village Angel: Token refresh successful');
            set({ accessToken: newToken });
            
            // Schedule next refresh
            const timer = setTimeout(() => {
              get().scheduleTokenRefresh();
            }, 14 * 60 * 1000); // 14 minutes
            
            set({ refreshTimer: timer });
          } else {
            console.log('Village Angel: Token refresh failed, logging out');
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
        user: state.rememberMe ? state.user : null,
        accessToken: state.rememberMe ? state.accessToken : null,
        refreshToken: state.rememberMe ? state.refreshToken : null,
        rememberMe: state.rememberMe,
        isAuth: state.rememberMe && state.isAuth,
      }),
      onRehydrateStorage: () => (state) => {
        console.log('Village Angel: Rehydrating auth state from storage');
        if (state) {
          console.log('Village Angel: Rehydrated state:', {
            hasUser: !!state.user,
            hasAccessToken: !!state.accessToken,
            hasRefreshToken: !!state.refreshToken,
            rememberMe: state.rememberMe,
            isAuth: state.isAuth
          });
        }
      },
    }
  )
);