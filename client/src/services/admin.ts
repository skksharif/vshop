import { api } from '../lib/axios';
import type { User, Order } from '../types';

export const getUnverifiedUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/admin/unverified-users');
  return response.data;
};

export const verifyUser = async (userId: string): Promise<User> => {
  const response = await api.patch<User>(`/admin/verifyUser?userId=${userId}`);
  return response.data;
};

export const getPendingOrders = async (): Promise<Order[]> => {
  const response = await api.get<Order[]>('/admin/orders/pending');
  return response.data;
};

export const approveOrder = async (orderId: string): Promise<Order> => {
  const response = await api.post<Order>('/admin/orders/approve', {
    orderId,
    newStatus: 'paid'
  });
  return response.data;
};

export const markOrderShipped = async (orderId: string): Promise<Order> => {
  const response = await api.post<Order>('/admin/orders/shipped', { orderId });
  return response.data;
};

export const setCreditLimit = async (userId: string, creditBal: number): Promise<void> => {
  await api.post('/admin/set-credit-limit', { userId, creditBal });
};

export const updateCreditLimit = async (userId: string, newCredit: number): Promise<void> => {
  await api.post('/admin/update-credit-limit', { userId, newCredit });
};