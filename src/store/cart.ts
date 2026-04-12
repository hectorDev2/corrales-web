import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { CartItem } from "@/types/cart";
import type { Product, ProductVariant } from "@/types/product";

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
  addItem: (product: Product, variant: ProductVariant) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
  items: [],
  isOpen: false,
  deliveryCost: DELIVERY_COST,

  totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

  subtotal: () =>
    get().items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0),

  total: () => {
    const { items, subtotal, deliveryCost } = get();
    return items.length > 0 ? subtotal() + deliveryCost : 0;
  },

  openDrawer: () => set({ isOpen: true }),
  closeDrawer: () => set({ isOpen: false }),

  addItem: (product, variant) =>
    set((state) => {
      const existing = state.items.find((i) => i.variant.id === variant.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.variant.id === variant.id ? { ...i, quantity: i.quantity + 1 } : i,
          ),
        };
      }
      return { items: [...state.items, { product, variant, quantity: 1 }] };
    }),

  removeItem: (variantId) =>
    set((state) => ({
      items: state.items.filter((i) => i.variant.id !== variantId),
    })),

  updateQuantity: (variantId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return { items: state.items.filter((i) => i.variant.id !== variantId) };
      }
      return {
        items: state.items.map((i) =>
          i.variant.id === variantId ? { ...i, quantity } : i,
        ),
      };
    }),

  clearCart: () => set({ items: [] }),
    }),
    {
      name: "corrales-cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
