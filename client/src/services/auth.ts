import { api } from '../lib/axios';
import type { AuthResponse, RegisterData, LoginData, User } from '../types';

/**
 * Register a new user
 * @param data - User registration data
 * @returns Promise<User> - Created user data
 */
export const register = async (data: RegisterData): Promise<User> => {
  const response = await api.post<User>('/user/register', data);
  return response.data;
};

/**
 * Login user with email and password
 * @param data - Login credentials
 * @returns Promise<AuthResponse> - Authentication response with tokens and user data
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/user/login', data);
  return response.data;
};

/**
 * Refresh access token using refresh token
 * This function is called automatically every 14 minutes after login
 * @returns Promise<string | null> - New access token or null if refresh failed
 */
export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    // Get refresh token from auth store
    const { useAuthStore } = await import('../store/auth');
    const refreshToken = useAuthStore.getState().refreshToken;
    
    if (!refreshToken) {
      console.warn('No refresh token available');
      return null;
    }

    // Call refresh endpoint with refresh token in body
    const response = await api.post<{ accessToken: string }>('/user/refresh', {
      refreshToken
    });
    
    console.log('Token refreshed successfully');
    return response.data.accessToken;
  } catch (error: any) {
    console.error('Token refresh failed:', error.response?.data?.message || error.message);
    
    // If refresh fails with 401, it means refresh token is invalid/expired
    if (error.response?.status === 401) {
      console.log('Refresh token expired, user will be logged out');
    }
    
    return null;
  }
};

/**
 * Logout user by clearing tokens
 * This is handled client-side by clearing the auth store
 */
export const logout = async (): Promise<void> => {
  try {
    // Optional: Call logout endpoint if backend requires it
    // await api.post('/user/logout');
    
    // Clear auth store
    const { useAuthStore } = await import('../store/auth');
    useAuthStore.getState().logout();
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear local state even if server call fails
    const { useAuthStore } = await import('../store/auth');
    useAuthStore.getState().logout();
  }
};