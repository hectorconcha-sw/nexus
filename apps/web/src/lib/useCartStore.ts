import { create } from 'zustand';
import { Cart, CartItem } from '@/types/cart';

interface CartState {
  isOpen: boolean;
  items: CartItem[];
  isLoading: boolean;
  openCart: () => void;
  closeCart: () => void;
  fetchCart: () => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  isOpen: false,
  items: [],
  isLoading: false,
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/cart');
      if (!res.ok) throw new Error('Failed to fetch cart');
      const data: Cart = await res.json();
      set({ items: data.items || [] });
    } catch (error) {
      console.error(error);
      // Fail gracefully, keep old state
    } finally {
      set({ isLoading: false });
    }
  },

  removeItem: async (productId: string) => {
    // Optimistic Update: Remove from UI immediately
    const previousItems = get().items;
    set({ items: previousItems.filter((i) => i.productId !== productId) });

    try {
      const res = await fetch(`/api/cart/items/${productId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove item');
    } catch (error) {
      console.error(error);
      // Rollback on failure
      set({ items: previousItems });
    }
  },

  getTotal: () => {
    return get().items.reduce((total, item) => total + item.priceCents * item.quantity, 0);
  },
}));
