"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  getAvailableOrders,
  getMyOrders,
  markDelivered,
  takeOrder,
} from "@/lib/api/delivery";
import { supabase } from "@/lib/supabase";
import type { AdminOrder } from "@/types/admin";

interface Props {
  userId: string;
  fullName: string;
}

export function DeliveryPage({ userId, fullName }: Props) {
  const [available, setAvailable] = useState<AdminOrder[]>([]);
  const [myOrders, setMyOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [takingId, setTakingId] = useState<string | null>(null);

  async function fetchAll() {
    try {
      const [avail, mine] = await Promise.all([
        getAvailableOrders(),
        getMyOrders(userId),
      ]);
      setAvailable(avail);
      setMyOrders(mine);
    } catch {
      toast.error("Error al cargar los pedidos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();

    const channel = supabase
      .channel("delivery-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchAll(),
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  async function handleTake(orderId: string) {
    setTakingId(orderId);
    try {
      await takeOrder(orderId, userId);
      toast.success("¡Pedido tomado! Ya está en tus entregas.");
    } catch {
      toast.error("No se pudo tomar el pedido. Intentá de nuevo.");
    } finally {
      setTakingId(null);
    }
  }

  async function handleDelivered(orderId: string) {
    try {
      await markDelivered(orderId);
      toast.success("Pedido entregado. ¡Buen trabajo!");
    } catch {
      toast.error("No se pudo actualizar el pedido.");
    }
  }

  return (
    <div className="w-full max-w-[390px] mx-auto px-4 py-4 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end py-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">
            Vista Repartidor
          </p>
          <h2 className="text-2xl font-black tracking-tighter text-on-surface">
            Hola, {fullName.split(" ")[0]}
          </h2>
        </div>
        <div className="bg-surface-container-high rounded-xl p-2 px-3 text-right">
          <p className="text-[10px] font-bold text-secondary uppercase">En ruta</p>
          <p className="text-sm font-black text-primary">{myOrders.length} Pedidos</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <span
            className="material-symbols-outlined text-4xl text-outline animate-spin"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}
          >
            progress_activity
          </span>
        </div>
      ) : (
        <>
          {/* Sección: disponibles */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-base text-secondary"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                inbox
              </span>
              <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">
                Disponibles ({available.length})
              </h3>
            </div>

            {available.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-on-surface-variant gap-2">
                <span
                  className="material-symbols-outlined text-4xl text-outline"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}
                >
                  check_circle
                </span>
                <p className="text-xs font-bold">Sin pedidos disponibles</p>
              </div>
            ) : (
              <div className="space-y-4">
                {available.map((order) => (
                  <AvailableOrderCard
                    key={order.id}
                    order={order}
                    taking={takingId === order.id}
                    onTake={handleTake}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Sección: mis entregas */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-base text-primary"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                delivery_dining
              </span>
              <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">
                Mis entregas ({myOrders.length})
              </h3>
            </div>

            {myOrders.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-on-surface-variant gap-2">
                <span
                  className="material-symbols-outlined text-4xl text-outline"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}
                >
                  moped
                </span>
                <p className="text-xs font-bold">No tenés pedidos en curso</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myOrders.map((order) => (
                  <DeliveryOrderCard
                    key={order.id}
                    order={order}
                    onDelivered={handleDelivered}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function AvailableOrderCard({
  order,
  taking,
  onTake,
}: {
  order: AdminOrder;
  taking: boolean;
  onTake: (id: string) => void;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-3xl shadow-[0_12px_40px_rgba(89,65,61,0.08)] overflow-hidden border border-outline-variant/20">
      <div className="p-5 flex justify-between items-start">
        <div>
          <span className="text-xs font-black tracking-tighter text-on-surface">
            ORDEN #{order.order_number}
          </span>
          <div className="mt-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700">
              Listo para retirar
            </span>
          </div>
          <p className="mt-2 text-sm font-bold text-on-surface">{order.customer_name}</p>
          {order.customer_address && (
            <p className="text-[11px] text-on-surface-variant mt-0.5 flex items-center gap-1">
              <span
                className="material-symbols-outlined text-sm"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                location_on
              </span>
              {order.customer_address}
            </p>
          )}
        </div>
        <p className="text-lg font-black text-primary">
          S/ {order.total.toFixed(2)}
        </p>
      </div>

      <div className="px-5 pb-3">
        <div className="bg-surface-container-low rounded-xl p-3 space-y-1">
          {order.items.map((item) => (
            <div key={item.id} className="text-[12px] text-on-surface">
              <span className="font-black text-primary">{item.quantity}x</span>{" "}
              {item.product_name}
              {item.variant_label && (
                <span className="text-on-surface-variant font-normal"> ({item.variant_label})</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-surface-container-low/30">
        <button
          onClick={() => onTake(order.id)}
          disabled={taking}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-on-secondary text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-secondary/20 transition-all active:scale-95 disabled:opacity-60"
        >
          <span
            className="material-symbols-outlined text-sm"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            {taking ? "progress_activity" : "add_circle"}
          </span>
          {taking ? "Tomando pedido..." : "Tomar pedido"}
        </button>
      </div>
    </div>
  );
}

function DeliveryOrderCard({
  order,
  onDelivered,
}: {
  order: AdminOrder;
  onDelivered: (id: string) => void;
}) {
  const whatsappHref = `https://wa.me/51${order.customer_phone.replace(/\s/g, "")}`;

  return (
    <div className="bg-surface-container-lowest rounded-3xl shadow-[0_12px_40px_rgba(89,65,61,0.08)] overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-outline-variant/15 flex justify-between items-start">
        <div>
          <span className="text-xs font-black tracking-tighter text-on-surface">
            ORDEN #{order.order_number}
          </span>
          <div className="mt-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700">
              En Camino
            </span>
          </div>
        </div>
        <p className="text-lg font-black text-primary">
          S/ {order.total.toFixed(2)}
        </p>
      </div>

      {/* Customer info */}
      <div className="p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
            <span
              className="material-symbols-outlined text-on-secondary-container"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              person
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-on-surface">{order.customer_name}</p>
            <p className="text-xs text-on-surface-variant">{order.customer_phone}</p>

            {order.customer_address && (
              <div className="mt-2 flex items-start gap-1 text-on-surface-variant">
                <span
                  className="material-symbols-outlined text-base mt-0.5"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                >
                  location_on
                </span>
                <p className="text-[11px] leading-tight">{order.customer_address}</p>
              </div>
            )}

            {order.customer_notes && (
              <div className="mt-2 flex items-start gap-1 text-on-surface-variant italic">
                <span
                  className="material-symbols-outlined text-base mt-0.5"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                >
                  info
                </span>
                <p className="text-[11px] leading-tight">{order.customer_notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="bg-surface-container-low rounded-xl p-3 space-y-1.5">
          {order.items.map((item) => (
            <div key={item.id} className="text-[13px] text-on-surface">
              <span className="font-black text-primary">{item.quantity}x</span>{" "}
              {item.product_name}
              {item.variant_label && (
                <span className="text-on-surface-variant font-normal"> ({item.variant_label})</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 bg-surface-container-low/30 grid grid-cols-2 gap-3">
        {order.customer_location_url ? (
          <a
            href={order.customer_location_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-surface-container-highest text-on-surface-variant text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
              map
            </span>
            Ver mapa
          </a>
        ) : (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-surface-container-highest text-on-surface-variant text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
              chat
            </span>
            Contactar
          </a>
        )}

        <button
          onClick={() => onDelivered(order.id)}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-on-primary text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
            check_circle
          </span>
          Entregado
        </button>
      </div>
    </div>
  );
}
