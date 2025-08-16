import axios from 'axios';
import { refreshAccessToken } from '../services/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5500/api/v1';

// Create axios instance with default configuration
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for HTTP-only tokens
  timeout: 10000, // 10 second timeout
});

/**
 * Request interceptor to add authorization token to requests
 * Automatically adds Bearer token to all requests if user is authenticated
 */
api.interceptors.request.use(
  (config) => {
    // Dynamically import to avoid circular dependency
    const getAuthState = () => {
      try {
        const authStore = JSON.parse(localStorage.getItem('village-angel-auth') || '{}');
        return authStore.state || {};
      } catch {
        return {};
      }
    };

    const authState = getAuthState();
    const token = authState.accessToken;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle token refresh on 401 errors
 * Automatically refreshes access token and retries failed requests
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        console.log('Access token expired, attempting refresh...');
        
        // Attempt to refresh the token
        const newToken = await refreshAccessToken();
        
        if (newToken) {
          console.log('Token refresh successful, retrying original request');
          
          // Update the authorization header for the retry
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          // Retry the original request with new token
          return api(originalRequest);
        } else {
          console.log('Token refresh failed, redirecting to login');
          
          // Refresh failed, redirect to login
          const { useAuthStore } = await import('../store/auth');
          useAuthStore.getState().logout();
          
          // Only redirect if not already on login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      } catch (refreshError) {
        console.error('Token refresh error:', refreshError);
        
        // Refresh failed, logout user
        const { useAuthStore } = await import('../store/auth');
        useAuthStore.getState().logout();
        
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);