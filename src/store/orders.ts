import { create } from "zustand";

import { MOCK_ORDERS } from "@/data/orders";
import type { Order, OrderStatus } from "@/types/order";

interface OrdersStore {
  orders: Order[];

  // Selectors
  pendingCount: () => number;

  // Actions
  advanceStatus: (id: string, next: OrderStatus) => void;
  removeOrder: (id: string) => void;
  resetOrders: () => void;
}

export const useOrdersStore = create<OrdersStore>((set, get) => ({
  orders: MOCK_ORDERS,

  pendingCount: () =>
    get().orders.filter((o) => o.status === "pendiente").length,

  advanceStatus: (id, next) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, status: next } : o)),
    })),

  removeOrder: (id) =>
    set((state) => ({
      orders: state.orders.filter((o) => o.id !== id),
    })),

  resetOrders: () => set({ orders: MOCK_ORDERS }),
}));
