import { api } from '../lib/axios';
import type { AuthResponse, RegisterData, LoginData, User } from '../types';

export const register = async (data: RegisterData): Promise<User> => {
  const response = await api.post<User>('/user/register', data);
  return response.data;
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/user/login', data);
  return response.data;
};

export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    // Note: Adjust this endpoint if backend uses different path
    const response = await api.post<{ accessToken: string }>('/user/refresh');
    return response.data.accessToken;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
};