"use client";

import { useState } from "react";

import type { AdminOrder, AdminOrderStatus, DeliveryProfile } from "@/types/admin";

interface Props {
  order: AdminOrder;
  deliveryProfiles: DeliveryProfile[];
  onAdvance: (id: string, next: AdminOrderStatus) => void;
  onAssign: (orderId: string, deliveryUserId: string) => void;
  onCancel: (id: string) => void;
}

const STATUS_CONFIG: Record<AdminOrderStatus, { label: string; bg: string; text: string }> = {
  pendiente:  { label: "Pendiente",  bg: "bg-yellow-100", text: "text-yellow-800" },
  preparando: { label: "Preparando", bg: "bg-blue-100",   text: "text-blue-700"   },
  listo:      { label: "Listo",      bg: "bg-green-100",  text: "text-green-700"  },
  en_camino:  { label: "En Camino",  bg: "bg-purple-100", text: "text-purple-700" },
  entregado:  { label: "Entregado",  bg: "bg-gray-100",   text: "text-gray-600"   },
  cancelado:  { label: "Cancelado",  bg: "bg-red-100",    text: "text-red-600"    },
};

export function AdminOrderCard({ order, deliveryProfiles, onAdvance, onAssign, onCancel }: Props) {
  const [selectedDelivery, setSelectedDelivery] = useState("");
  const { label, bg, text } = STATUS_CONFIG[order.status];
  const whatsappHref = `https://wa.me/51${order.customer_phone.replace(/\s/g, "")}`;
  const createdAt = new Date(order.created_at).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-surface-container-lowest rounded-3xl shadow-[0_12px_40px_rgba(89,65,61,0.08)] overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="p-5 border-b border-outline-variant/15 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black tracking-tighter text-on-surface">
              ORDEN #{order.order_number}
            </span>
            <span className="text-[10px] font-medium text-on-surface-variant/60">
              {createdAt}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${bg} ${text}`}>
              {label}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-container-high text-secondary">
              {order.delivery_type === "delivery" ? "Delivery" : "Recojo"}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-on-surface-variant">Total</p>
          <p className="text-lg font-black text-primary leading-none">
            S/ {order.total.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Customer info */}
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

            {order.customer_location_url && (
              <a
                href={order.customer_location_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-[11px] text-primary font-bold hover:underline"
              >
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                >
                  open_in_new
                </span>
                Ver en Google Maps
              </a>
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
        <div className="bg-surface-container-low rounded-xl p-3 space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center text-[13px]">
              <span className="font-medium text-on-surface">
                <span className="font-black text-primary">{item.quantity}x</span>{" "}
                {item.product_name}
                {item.variant_label && (
                  <span className="text-on-surface-variant font-normal"> ({item.variant_label})</span>
                )}
              </span>
            </div>
          ))}
        </div>

        {/* Assigned delivery */}
        {order.assigned_profile && (
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span
              className="material-symbols-outlined text-base text-primary"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              delivery_dining
            </span>
            <span>Repartidor: <strong className="text-on-surface">{order.assigned_profile.full_name}</strong></span>
          </div>
        )}
      </div>

      {/* Footer — acciones según estado */}
      <div className="p-4 bg-surface-container-low/30 space-y-3">
        {order.status === "pendiente" && (
          <div className="flex gap-3">
            <button
              onClick={() => onAdvance(order.id, "preparando")}
              className="flex-1 py-3 rounded-xl bg-primary text-on-primary text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              Aceptar y Preparar
            </button>
            <button
              onClick={() => onCancel(order.id)}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-error-container text-error transition-all active:scale-90"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
                close
              </span>
            </button>
          </div>
        )}

        {order.status === "preparando" && (
          <div className="grid grid-cols-2 gap-3">
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
            <button
              onClick={() => onAdvance(order.id, "listo")}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-on-primary text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              Listo
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
                arrow_forward
              </span>
            </button>
          </div>
        )}

        {order.status === "listo" && order.delivery_type === "delivery" && (
          <div className="space-y-2">
            <select
              value={selectedDelivery}
              onChange={(e) => setSelectedDelivery(e.target.value)}
              className="w-full bg-surface-container-high border-none rounded-xl py-3 px-4 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Asignar repartidor...</option>
              {deliveryProfiles.map((p) => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
            <button
              disabled={!selectedDelivery}
              onClick={() => onAssign(order.id, selectedDelivery)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-on-primary text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
                delivery_dining
              </span>
              Enviar a delivery
            </button>
          </div>
        )}

        {order.status === "listo" && order.delivery_type === "pickup" && (
          <button
            onClick={() => onAdvance(order.id, "entregado")}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-surface-container-highest text-on-surface-variant text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
              check_circle
            </span>
            Entregado al cliente
          </button>
        )}

        {order.status === "en_camino" && (
          <div className="flex items-center justify-center gap-2 py-3 text-on-surface-variant text-[11px] font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
              delivery_dining
            </span>
            En camino con {order.assigned_profile?.full_name ?? "el repartidor"}
          </div>
        )}
      </div>
    </div>
  );
}
