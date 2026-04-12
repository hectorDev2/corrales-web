"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { getOrderHistory } from "@/lib/api/admin";
import type { AdminOrder, AdminOrderStatus } from "@/types/admin";

type StatusFilter = "all" | "entregado" | "cancelado";

const STATUS_CONFIG: Record<AdminOrderStatus, { label: string; bg: string; text: string }> = {
  pendiente:  { label: "Pendiente",  bg: "bg-yellow-100", text: "text-yellow-800" },
  preparando: { label: "Preparando", bg: "bg-blue-100",   text: "text-blue-700"   },
  listo:      { label: "Listo",      bg: "bg-green-100",  text: "text-green-700"  },
  en_camino:  { label: "En Camino",  bg: "bg-purple-100", text: "text-purple-700" },
  entregado:  { label: "Entregado",  bg: "bg-gray-100",   text: "text-gray-600"   },
  cancelado:  { label: "Cancelado",  bg: "bg-red-100",    text: "text-red-600"    },
};

const PAYMENT_LABEL: Record<string, string> = {
  yape: "Yape",
  cash: "Efectivo",
  culqi: "Tarjeta",
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function sevenDaysAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  return d.toISOString().slice(0, 10);
}

export function AdminOrderHistoryPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(sevenDaysAgo());
  const [to, setTo] = useState(today());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const statuses: AdminOrderStatus[] =
        statusFilter === "all"
          ? ["entregado", "cancelado"]
          : [statusFilter];
      const data = await getOrderHistory(from, to, statuses);
      setOrders(data);
    } catch {
      toast.error("Error al cargar el historial.");
    } finally {
      setLoading(false);
    }
  }, [from, to, statusFilter]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const totalRevenue = orders
    .filter((o) => o.status === "entregado")
    .reduce((sum, o) => sum + o.total, 0);

  const delivered = orders.filter((o) => o.status === "entregado").length;
  const cancelled = orders.filter((o) => o.status === "cancelado").length;

  return (
    <div className="w-full max-w-[390px] mx-auto px-4 space-y-5 py-4">
      {/* Header */}
      <div className="flex justify-between items-end py-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">
            Admin
          </p>
          <h2 className="text-2xl font-black tracking-tighter text-on-surface">
            Historial
          </h2>
        </div>
        <button
          onClick={fetchHistory}
          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-surface-container-high text-on-surface-variant active:scale-90 transition-all"
        >
          <span
            className="material-symbols-outlined text-xl"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            refresh
          </span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-surface-container-lowest rounded-2xl p-3 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">
            Ingresos
          </p>
          <p className="text-base font-black text-primary leading-none">
            S/ {totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-3 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">
            Entregados
          </p>
          <p className="text-base font-black text-on-surface leading-none">
            {delivered}
          </p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-3 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">
            Cancelados
          </p>
          <p className="text-base font-black text-error leading-none">
            {cancelled}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface-container-lowest rounded-3xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 block">
              Desde
            </label>
            <input
              type="date"
              value={from}
              max={to}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full bg-surface-container-high rounded-xl px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 border-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1 block">
              Hasta
            </label>
            <input
              type="date"
              value={to}
              min={from}
              max={today()}
              onChange={(e) => setTo(e.target.value)}
              className="w-full bg-surface-container-high rounded-xl px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 border-none"
            />
          </div>
        </div>

        {/* Status tabs */}
        <div className="grid grid-cols-3 gap-1.5 bg-surface-container-high rounded-2xl p-1">
          {(["all", "entregado", "cancelado"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                statusFilter === s
                  ? "bg-surface shadow-sm text-primary"
                  : "text-on-surface-variant"
              }`}
            >
              {s === "all" ? "Todos" : s === "entregado" ? "Entregados" : "Cancelados"}
            </button>
          ))}
        </div>
      </div>

      {/* Order list */}
      <section className="space-y-3 pb-32">
        {loading ? (
          <div className="flex justify-center py-16">
            <span
              className="material-symbols-outlined text-4xl text-outline animate-spin"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}
            >
              progress_activity
            </span>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-on-surface-variant gap-3">
            <span
              className="material-symbols-outlined text-5xl text-outline"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}
            >
              history
            </span>
            <p className="font-bold text-sm">Sin resultados para este período</p>
          </div>
        ) : (
          orders.map((order) => (
            <HistoryOrderCard key={order.id} order={order} />
          ))
        )}
      </section>
    </div>
  );
}

function HistoryOrderCard({ order }: { order: AdminOrder }) {
  const { label, bg, text } = STATUS_CONFIG[order.status];

  const createdAt = new Date(order.created_at).toLocaleString("es-PE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
      <div className="p-4 flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-black tracking-tighter text-on-surface">
              #{order.order_number}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${bg} ${text}`}>
              {label}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-container-high text-secondary">
              {order.delivery_type === "delivery" ? "Delivery" : "Recojo"}
            </span>
          </div>

          <p className="text-sm font-bold text-on-surface truncate">{order.customer_name}</p>
          <p className="text-[11px] text-on-surface-variant mt-0.5">{createdAt}</p>

          <div className="mt-2 text-[11px] text-on-surface-variant space-y-0.5">
            {order.items.map((item) => (
              <p key={item.id}>
                <span className="font-black text-primary">{item.quantity}x</span>{" "}
                {item.product_name}
                {item.variant_label && (
                  <span className="text-on-surface-variant/70"> ({item.variant_label})</span>
                )}
              </p>
            ))}
          </div>
        </div>

        <div className="text-right ml-3 shrink-0">
          <p className="text-base font-black text-primary">S/ {order.total.toFixed(2)}</p>
          <p className="text-[10px] text-on-surface-variant mt-0.5">
            {PAYMENT_LABEL[order.payment_method] ?? order.payment_method}
          </p>
          {order.assigned_profile && (
            <p className="text-[10px] text-on-surface-variant mt-1 flex items-center justify-end gap-0.5">
              <span
                className="material-symbols-outlined text-xs text-primary"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                delivery_dining
              </span>
              {order.assigned_profile.full_name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
