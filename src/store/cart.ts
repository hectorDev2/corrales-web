import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { CartItem, SelectedOptionsMap } from "@/types/cart";
import { calcOptionsTotal, getCartItemKey } from "@/types/cart";
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
  addItem: (
    product: Product,
    variant: ProductVariant,
    selectedOptions?: SelectedOptionsMap,
    qty?: number,
  ) => string; // devuelve el itemKey
  removeItem: (itemKey: string) => void;
  updateQuantity: (itemKey: string, quantity: number) => void;
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
        get().items.reduce((sum, item) => {
          const optionsExtra = calcOptionsTotal(item.product, item.selectedOptions);
          return sum + (item.variant.price + optionsExtra) * item.quantity;
        }, 0),

      total: () => {
        const { items, subtotal, deliveryCost } = get();
        return items.length > 0 ? subtotal() + deliveryCost : 0;
      },

      openDrawer: () => set({ isOpen: true }),
      closeDrawer: () => set({ isOpen: false }),

      addItem: (product, variant, selectedOptions = {}, qty = 1) => {
        const key = getCartItemKey(variant.id, selectedOptions);
        set((state) => {
          const existing = state.items.find((i) => i.key === key);
          const requestedQuantity = Math.max(0, qty);
          const availableQuantity = Math.max(0, variant.stock - (existing?.quantity ?? 0));
          const quantityToAdd = Math.min(requestedQuantity, availableQuantity);

          if (quantityToAdd === 0) return state;

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.key === key ? { ...i, quantity: i.quantity + quantityToAdd } : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                key,
                product,
                variant,
                quantity: quantityToAdd,
                selectedOptions,
              },
            ],
          };
        });
        return key;
      },

      removeItem: (itemKey) =>
        set((state) => ({
          items: state.items.filter((i) => i.key !== itemKey),
        })),

      updateQuantity: (itemKey, quantity) =>
        set((state) => {
          const item = state.items.find((current) => current.key === itemKey);
          if (!item || quantity <= 0) {
            return { items: state.items.filter((i) => i.key !== itemKey) };
          }
          const cappedQuantity = Math.min(quantity, item.variant.stock);
          if (cappedQuantity <= 0) {
            return { items: state.items.filter((i) => i.key !== itemKey) };
          }
          return {
            items: state.items.map((i) =>
              i.key === itemKey ? { ...i, quantity: cappedQuantity } : i,
            ),
          };
        }),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "corrales-cart",
      partialize: (state) => ({ items: state.items }),
      // Migración: items antiguas sin `key` ni `selectedOptions` se normalizan
      onRehydrateStorage: () => (state) => {
        if (state && state.items) {
          state.items = state.items.map((item: Partial<CartItem> & { key?: string }) => {
            if (!item.key) {
              item.key = getCartItemKey(
                item.variant?.id ?? "unknown",
                item.selectedOptions ?? {},
              );
            }
            if (!item.selectedOptions) {
              item.selectedOptions = {};
            }
            if (typeof item.variant?.stock !== "number") {
              item.variant = { ...item.variant, stock: 0 } as ProductVariant;
            }
            return item as CartItem;
          });
        }
      },
    },
  ),
);
