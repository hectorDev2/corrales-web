import { create } from "zustand";

import type { CartItem } from "@/types/cart";
import type { Product } from "@/types/product";

const DELIVERY_COST = 5.0;

interface CartStore {
  items: CartItem[];
  isOpen: boolean;

  // Selectors
  totalItems: () => number;
  subtotal: () => number;
  total: () => number;
  deliveryCost: number;

  // Actions
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,
  deliveryCost: DELIVERY_COST,

  totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

  subtotal: () =>
    get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),

  total: () => {
    const { items, subtotal, deliveryCost } = get();
    return items.length > 0 ? subtotal() + deliveryCost : 0;
  },

  openDrawer: () => set({ isOpen: true }),
  closeDrawer: () => set({ isOpen: false }),

  addItem: (product) =>
    set((state) => {
      const existing = state.items.find((i) => i.product.id === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
          ),
        };
      }
      return { items: [...state.items, { product, quantity: 1 }] };
    }),

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((i) => i.product.id !== productId),
    })),

  updateQuantity: (productId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return { items: state.items.filter((i) => i.product.id !== productId) };
      }
      return {
        items: state.items.map((i) =>
          i.product.id === productId ? { ...i, quantity } : i,
        ),
      };
    }),

  clearCart: () => set({ items: [] }),
}));
