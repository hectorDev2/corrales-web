"use client";

import type { Order, OrderStatus } from "@/types/order";

interface Props {
  order: Order;
  onAdvance: (id: string, next: OrderStatus) => void;
  onCancel: (id: string) => void;
}

const STATUS_CONFIG = {
  pendiente: {
    label: "Pendiente",
    bg: "bg-yellow-100",
    text: "text-yellow-800",
  },
  preparando: {
    label: "Preparando",
    bg: "bg-blue-100",
    text: "text-blue-700",
  },
  listo: {
    label: "Listo",
    bg: "bg-green-100",
    text: "text-green-700",
  },
} satisfies Record<OrderStatus, { label: string; bg: string; text: string }>;

export function AdminOrderCard({ order, onAdvance, onCancel }: Props) {
  const { label, bg, text } = STATUS_CONFIG[order.status];

  const whatsappHref = `https://wa.me/51${order.customer.phone.replace(/\s/g, "")}`;

  return (
    <div className="bg-surface-container-lowest rounded-3xl shadow-[0_12px_40px_rgba(89,65,61,0.08)] overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="p-5 border-b border-outline-variant/15 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black tracking-tighter text-on-surface">
              ORDEN #{order.orderNumber}
            </span>
            <span className="text-[10px] font-medium text-on-surface-variant/60">
              {order.time} PM
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${bg} ${text}`}
            >
              {label}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-container-high text-secondary">
              {order.deliveryType === "delivery" ? "Delivery" : "Recojo"}
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
            <p className="text-sm font-bold text-on-surface">{order.customer.name}</p>
            <p className="text-xs text-on-surface-variant">{order.customer.phone}</p>
            {order.customer.address && (
              <div className="mt-2 flex items-center gap-1 text-on-surface-variant">
                <span
                  className="material-symbols-outlined text-base"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                >
                  location_on
                </span>
                <p className="text-[11px] leading-tight">{order.customer.address}</p>
              </div>
            )}
            {order.customer.notes && (
              <div className="mt-2 flex items-center gap-1 text-on-surface-variant italic">
                <span
                  className="material-symbols-outlined text-base"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                >
                  info
                </span>
                <p className="text-[11px] leading-tight">{order.customer.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl p-3 space-y-2">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center text-[13px]">
              <span className="font-medium text-on-surface">
                <span className="font-black text-primary">{item.quantity}x</span>{" "}
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer — actions by status */}
      <div className="p-4 bg-surface-container-low/30">
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
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
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
              <span
                className="material-symbols-outlined text-sm"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                chat
              </span>
              Contactar
            </a>
            <button
              onClick={() => onAdvance(order.id, "listo")}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-on-primary text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              Avanzar a listo
              <span
                className="material-symbols-outlined text-sm"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                arrow_forward
              </span>
            </button>
          </div>
        )}

        {order.status === "listo" && (
          <button
            onClick={() => onCancel(order.id)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-surface-container-highest text-on-surface-variant text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95"
          >
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              archive
            </span>
            Archivar pedido
          </button>
        )}
      </div>
    </div>
  );
}
