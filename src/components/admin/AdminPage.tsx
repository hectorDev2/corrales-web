"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  assignDelivery,
  getActiveOrders,
  getDeliveryProfiles,
  updateOrderStatus,
} from "@/lib/api/admin";
import { supabase } from "@/lib/supabase";
import type { AdminOrder, AdminOrderStatus, DeliveryProfile } from "@/types/admin";

import { AdminOrderCard } from "./AdminOrderCard";
import { BentoStats } from "./BentoStats";
import { PushNotificationBanner } from "./PushNotificationBanner";

export function AdminPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [deliveryProfiles, setDeliveryProfiles] = useState<DeliveryProfile[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchOrders() {
    try {
      const data = await getActiveOrders();
      setOrders(data);
    } catch {
      toast.error("Error al cargar los pedidos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
    getDeliveryProfiles().then(setDeliveryProfiles).catch(() => {});

    // Suscripción en tiempo real
    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchOrders(),
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function handleAdvance(id: string, next: AdminOrderStatus) {
    try {
      await updateOrderStatus(id, next);
    } catch {
      toast.error("No se pudo actualizar el pedido.");
    }
  }

  async function handleAssign(orderId: string, deliveryUserId: string) {
    try {
      await assignDelivery(orderId, deliveryUserId);
      toast.success("Delivery asignado correctamente.");
    } catch {
      toast.error("No se pudo asignar el delivery.");
    }
  }

  async function handleCancel(id: string) {
    try {
      await updateOrderStatus(id, "cancelado");
    } catch {
      toast.error("No se pudo cancelar el pedido.");
    }
  }

  const activeOrders = orders.filter(
    (o) => o.status !== "entregado" && o.status !== "cancelado",
  );

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
          <p className="text-sm font-black text-primary">
            {activeOrders.length} Pedidos
          </p>
        </div>
      </div>

      {/* Push notifications */}
      <PushNotificationBanner />

      {/* Orders */}
      <section className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <span
              className="material-symbols-outlined text-4xl text-outline animate-spin"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}
            >
              progress_activity
            </span>
          </div>
        ) : activeOrders.length === 0 ? (
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
          activeOrders.map((order) => (
            <AdminOrderCard
              key={order.id}
              order={order}
              deliveryProfiles={deliveryProfiles}
              onAdvance={handleAdvance}
              onAssign={handleAssign}
              onCancel={handleCancel}
            />
          ))
        )}
      </section>

      <BentoStats orders={activeOrders} />
    </div>
  );
}
