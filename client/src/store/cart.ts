import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '../types';

interface CartState {
  items: CartItem[];
  total: number;
  addItem: (product: Product, color: string, size: string, quantity: number) => void;
  removeItem: (productId: string, color: string, size: string) => void;
  updateQuantity: (productId: string, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      
      addItem: (product, color, size, quantity) => {
        const items = get().items;
        const existingIndex = items.findIndex(
          item => item.productId === product.id && 
                  item.color === color && 
                  item.size === size
        );
        
        let newItems;
        if (existingIndex >= 0) {
          newItems = [...items];
          newItems[existingIndex].quantity += quantity;
        } else {
          const newItem: CartItem = {
            productId: product.id,
            product,
            color,
            size,
            quantity,
            price: product.price,
          };
          newItems = [...items, newItem];
        }
        
        const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        set({ items: newItems, total });
      },
      
      removeItem: (productId, color, size) => {
        const items = get().items.filter(
          item => !(item.productId === productId && 
                   item.color === color && 
                   item.size === size)
        );
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        set({ items, total });
      },
      
      updateQuantity: (productId, color, size, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, color, size);
          return;
        }
        
        const items = get().items.map(item => 
          item.productId === productId && 
          item.color === color && 
          item.size === size
            ? { ...item, quantity }
            : item
        );
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        set({ items, total });
      },
      
      clearCart: () => {
        set({ items: [], total: 0 });
      },
      
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);