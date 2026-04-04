"use client";

import { useState } from "react";

import { MOCK_ORDERS } from "@/data/orders";
import type { Order, OrderStatus } from "@/types/order";

import { AdminOrderCard } from "./AdminOrderCard";
import { BentoStats } from "./BentoStats";

export function AdminPage() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);

  const todayCount = orders.length;

  function handleAdvance(id: string, next: OrderStatus) {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: next } : o)),
    );
  }

  function handleCancel(id: string) {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }

  return (
    <div className="w-full max-w-[390px] mx-auto px-4 space-y-6 py-4">
      {/* Dashboard header */}
      <div className="flex justify-between items-end py-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">
            Panel de Control
          </p>
          <h2 className="text-2xl font-black tracking-tighter text-on-surface">
            Admin de Pedidos
          </h2>
        </div>
        <div className="bg-surface-container-high rounded-xl p-2 px-3 text-right">
          <p className="text-[10px] font-bold text-secondary uppercase">Hoy</p>
          <p className="text-sm font-black text-primary">{todayCount} Pedidos</p>
        </div>
      </div>

      {/* Orders */}
      <section className="space-y-4">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-on-surface-variant gap-3">
            <span
              className="material-symbols-outlined text-5xl text-outline"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}
            >
              receipt_long
            </span>
            <p className="font-bold text-sm">Sin pedidos activos</p>
          </div>
        ) : (
          orders.map((order) => (
            <AdminOrderCard
              key={order.id}
              order={order}
              onAdvance={handleAdvance}
              onCancel={handleCancel}
            />
          ))
        )}
      </section>

      {/* Bento stats */}
      <BentoStats orders={orders} />
    </div>
  );
}
