import { api } from '../lib/axios';
import type { Category, Product } from '../types';

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get<Category[]>('/category/getCatergory');
  return response.data.categories;
};

export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  const response = await api.get<Product[]>(`/category/products-by-category?categoryId=${categoryId}`);
  return response.data.products;
};

export const getProduct = async (productId: string): Promise<Product> => {
  const response = await api.get<Product>(`/category/getProduct?productId=${productId}`);
  return response.data;
};

export const createCategory = async (data: { categoryName: string; imageUrl: string }): Promise<Category> => {
  const response = await api.post<Category>('/admin/create-category', data);
  return response.data;
};

export const createProduct = async (
  categoryId: string, 
  data: {
    productName: string;
    description: string;
    price: number;
    images: string[];
    color: string;
    sizes: string[];
    isActive: boolean;
  }
): Promise<Product> => {
  const response = await api.post<Product>(`/admin/create-product?categoryId=${categoryId}`, data);
  return response.data;
};