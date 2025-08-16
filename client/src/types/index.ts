export interface User {
  id: string;
  fullName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  role: 'USER' | 'ADMIN';
  creditBal: number;
  kycCard: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  categoryName: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  productName: string;
  description: string;
  price: number;
  images: string[];
  color: string;
  sizes: string[];
  isActive: boolean;
  categoryId: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  color: string;
  size: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  user: User;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  color: string;
  size: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterData {
  fullName: string;
  userName: string;
  email: string;
  password: string;
  phoneNumber: string;
  kycCard: string;
  role: 'USER' | 'ADMIN';
}

export interface LoginData {
  email: string;
  password: string;
}