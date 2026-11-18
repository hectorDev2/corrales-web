"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  type KitchenOrder,
  type KitchenStatus,
  advanceKitchenOrder,
  getKitchenOrders,
} from "@/lib/api/kitchen";
import { supabase } from "@/lib/supabase";
import type { ProductStation } from "@/types/admin";

type StationFilter = "todas" | ProductStation;

const STATIONS: { id: StationFilter; label: string; icon: string }[] = [
  { id: "todas", label: "Todo", icon: "apps" },
  { id: "cocina", label: "Cocina", icon: "skillet" },
  { id: "horno", label: "Horno", icon: "outdoor_grill" },
  { id: "barra", label: "Barra", icon: "local_bar" },
];

const TYPE_LABEL = { delivery: "Delivery", pickup: "Para recoger", dine_in: "En mesa" } as const;

function minutesSince(iso: string, now: number) {
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
}

/** Pitido corto generado en el navegador (no descarga ningún audio). */
function beep() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    [880, 1175].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + i * 0.2 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.2 + 0.18);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.2);
      osc.stop(ctx.currentTime + i * 0.2 + 0.2);
    });
    setTimeout(() => void ctx.close(), 800);
  } catch {
    /* sin audio disponible: no pasa nada */
  }
}

function readStored<T extends string>(key: string, fallback: T, allowed: readonly T[]): T {
  try {
    const v = localStorage.getItem(key) as T | null;
    return v && allowed.includes(v) ? v : fallback;
  } catch {
    return fallback;
  }
}

export function KitchenPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [station, setStation] = useState<StationFilter>("todas");
  const [tab, setTab] = useState<KitchenStatus>("pendiente");
  const [sound, setSound] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const knownIds = useRef<Set<string> | null>(null);
  const soundRef = useRef(false);

  useEffect(() => {
    // Preferencias guardadas en este equipo (cada puesto recuerda su estación).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStation(readStored<StationFilter>("kitchen-station", "todas", ["todas", "cocina", "horno", "barra"]));
    const stored = readStored("kitchen-sound", "off", ["on", "off"]) === "on";
    setSound(stored);
    soundRef.current = stored;
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const load = useCallback(async () => {
    try {
      const data = await getKitchenOrders();
      // Aviso sonoro solo cuando entra un pedido nuevo después de la primera carga.
      if (knownIds.current) {
        const fresh = data.some((o) => o.status === "pendiente" && !knownIds.current!.has(o.id));
        if (fresh && soundRef.current) beep();
      }
      knownIds.current = new Set(data.map((o) => o.id));
      setOrders(data);
    } catch {
      toast.error("No se pudieron cargar los pedidos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    const channel = supabase
      .channel("kitchen-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => void load())
      .subscribe();
    // Respaldo por si se pierde la conexión en tiempo real.
    const poll = setInterval(() => void load(), 30_000);
    return () => {
      clearInterval(poll);
      void supabase.removeChannel(channel);
    };
  }, [load]);

  function chooseStation(next: StationFilter) {
    setStation(next);
    try {
      localStorage.setItem("kitchen-station", next);
    } catch {
      /* ignorar */
    }
  }

  function toggleSound() {
    const next = !sound;
    setSound(next);
    soundRef.current = next;
    try {
      localStorage.setItem("kitchen-sound", next ? "on" : "off");
    } catch {
      /* ignorar */
    }
    if (next) beep(); // también confirma que se escucha
  }

  async function advance(order: KitchenOrder, next: "preparando" | "listo") {
    // Se actualiza al instante; el tiempo real confirma después.
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: next } : o)));
    if (next === "listo") toast.success(`Pedido #${order.order_number} listo.`);
    try {
      await advanceKitchenOrder(order.id, next);
    } catch {
      toast.error("No se pudo actualizar el pedido.");
      void load();
    }
  }

  // Cada puesto ve solo los productos de su estación.
  const visible = useMemo(
    () =>
      orders
        .map((o) => ({ ...o, items: station === "todas" ? o.items : o.items.filter((i) => i.station === station) }))
        .filter((o) => o.items.length > 0),
    [orders, station],
  );
  const byStatus = {
    pendiente: visible.filter((o) => o.status === "pendiente"),
    preparando: visible.filter((o) => o.status === "preparando"),
    listo: visible.filter((o) => o.status === "listo"),
  };

  const columns = (["pendiente", "preparando", "listo"] as const).map((status) => ({
    status,
    orders: byStatus[status],
    onAdvance: (status === "pendiente" ? "preparando" : status === "preparando" ? "listo" : null) as "preparando" | "listo" | null,
  }));

  return (
    <div className="mx-auto w-full max-w-[110rem] space-y-4 px-4 py-4 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="radiogroup" aria-label="Estación" className="bg-surface-container-high flex flex-wrap gap-1 rounded-2xl p-1">
          {STATIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={station === s.id}
              onClick={() => chooseStation(s.id)}
              className={`flex min-h-12 items-center gap-2 rounded-xl px-4 text-sm font-bold transition ${
                station === s.id ? "bg-primary text-on-primary shadow" : "text-on-surface-variant"
              }`}
            >
              <span className="material-symbols-outlined text-xl">{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={sound}
          className={`flex min-h-12 items-center gap-2 rounded-xl px-4 text-sm font-bold ${
            sound ? "bg-[#dff1e6] text-[#1d5a38]" : "bg-surface-container-high text-on-surface-variant"
          }`}
        >
          <span className="material-symbols-outlined text-xl">{sound ? "volume_up" : "volume_off"}</span>
          {sound ? "Sonido activado" : "Activar sonido"}
        </button>
      </div>

      {/* En celular y tablet: pestañas con contador. En pantalla grande: tres columnas. */}
      <div role="tablist" aria-label="Estado de los pedidos" className="grid grid-cols-3 gap-2 lg:hidden">
        {columns.map(({ status, orders: list }) => {
          const cfg = STATUS[status];
          return (
            <button
              key={status}
              type="button"
              role="tab"
              aria-selected={tab === status}
              onClick={() => setTab(status)}
              className={`flex min-h-16 flex-col items-center justify-center rounded-2xl text-sm font-black transition ${
                tab === status ? `${cfg.solid} shadow-md` : `${cfg.soft}`
              }`}
            >
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xl">{cfg.icon}</span>
                {cfg.title}
              </span>
              <span className="text-lg leading-none">{list.length}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="material-symbols-outlined text-outline animate-spin text-5xl">progress_activity</span>
        </div>
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-3">
          {columns.map(({ status, orders: list, onAdvance }) => {
            const cfg = STATUS[status];
            return (
              <section key={status} className={`space-y-3 ${tab === status ? "" : "max-lg:hidden"}`}>
                <h2 className={`hidden items-center gap-2 rounded-2xl px-4 py-3 text-base font-black lg:flex ${cfg.solid}`}>
                  <span className="material-symbols-outlined text-2xl">{cfg.icon}</span>
                  {cfg.title}
                  <span className="ml-auto rounded-full bg-white/25 px-3 py-0.5 text-sm">{list.length}</span>
                </h2>
                <p className="text-on-surface-variant px-1 text-sm lg:text-xs">{cfg.hint}</p>
                {list.length === 0 ? (
                  <p className="text-on-surface-variant bg-surface-container-low rounded-2xl py-10 text-center text-sm font-bold">
                    {status === "pendiente" ? "No hay pedidos nuevos" : status === "preparando" ? "Nada en preparación" : "Ningún pedido listo"}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {list.map((o) => (
                      <OrderCard
                        key={o.id}
                        order={o}
                        now={now}
                        onAdvance={onAdvance ? () => void advance(o, onAdvance) : null}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Paleta de estados alineada con la marca: rojo Corrales (nuevo), ámbar (en el fuego) y verde (listo).
const STATUS = {
  pendiente: {
    title: "Nuevos",
    icon: "notifications_active",
    hint: "Toca «Empezar» cuando comiences a prepararlo.",
    solid: "bg-[#e4002b] text-white",
    soft: "bg-[#fde7ea] text-[#9b0020]",
    border: "border-[#e4002b]",
    band: "bg-[#e4002b] text-white",
    label: "NUEVO",
  },
  preparando: {
    title: "Preparando",
    icon: "skillet",
    hint: "Toca «Marcar como listo» cuando esté terminado.",
    solid: "bg-[#f5a623] text-[#3a2400]",
    soft: "bg-[#fdf1d6] text-[#7a4b00]",
    border: "border-[#f5a623]",
    band: "bg-[#f5a623] text-[#3a2400]",
    label: "PREPARANDO",
  },
  listo: {
    title: "Listos",
    icon: "check_circle",
    hint: "Esperan a que los recojan o los sirvan.",
    solid: "bg-[#2e8b57] text-white",
    soft: "bg-[#dff1e6] text-[#1d5a38]",
    border: "border-[#2e8b57]",
    band: "bg-[#2e8b57] text-white",
    label: "LISTO",
  },
} as const;

const STEPS = ["Nuevo", "Preparando", "Listo"] as const;
const STEP_INDEX = { pendiente: 0, preparando: 1, listo: 2 } as const;

function OrderCard({ order, now, onAdvance }: { order: KitchenOrder; now: number; onAdvance: (() => void) | null }) {
  const cfg = STATUS[order.status];
  const mins = minutesSince(order.created_at, now);
  const waiting = order.status !== "listo";
  const late = waiting && mins >= 20;
  const warn = waiting && mins >= 10 && !late;
  const where =
    order.delivery_type === "dine_in" && order.table_label ? `Mesa ${order.table_label}` : TYPE_LABEL[order.delivery_type];
  const step = STEP_INDEX[order.status];

  return (
    <article className={`bg-surface-container-lowest overflow-hidden rounded-3xl border-4 shadow-sm ${late ? "border-[#2b2118]" : cfg.border}`}>
      {/* Franja con el estado, siempre visible */}
      <div className={`flex items-center justify-between px-5 py-2.5 ${cfg.band}`}>
        <span className="flex items-center gap-2 text-base font-black tracking-wider">
          <span className="material-symbols-outlined text-2xl">{cfg.icon}</span>
          {cfg.label}
        </span>
        <span className="flex items-center gap-1 text-sm font-black">
          <span className="material-symbols-outlined text-lg">timer</span>
          {mins} min{late && " · ¡TARDA!"}
          {warn && " · atento"}
        </span>
      </div>

      <div className="space-y-3 p-5">
        <header className="flex items-end justify-between gap-3">
          <p className="text-4xl leading-none font-black">#{order.order_number}</p>
          <p className="bg-surface-container-high rounded-full px-3 py-1 text-sm font-black">{where}</p>
        </header>

        {/* Avance: Nuevo → Preparando → Listo */}
        <ol className="flex items-center" aria-label="Avance del pedido">
          {STEPS.map((label, i) => (
            <li key={label} className="flex flex-1 items-center last:flex-none">
              <span
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ${
                  i === step ? cfg.solid : i < step ? "bg-surface-container-high text-on-surface" : "text-outline"
                }`}
              >
                {i < step && <span className="material-symbols-outlined text-sm">check</span>}
                {label}
              </span>
              {i < STEPS.length - 1 && <span className={`mx-1 h-0.5 flex-1 ${i < step ? "bg-on-surface/40" : "bg-outline-variant"}`} />}
            </li>
          ))}
        </ol>

        <ul className="space-y-1.5 pt-1">
          {order.items.map((i) => (
            <li key={i.id} className="flex items-baseline gap-3 text-xl leading-snug font-bold">
              <span className="text-primary min-w-9 text-3xl font-black">{i.quantity}×</span>
              <span>
                {i.product_name}
                {i.variant_label && <span className="text-on-surface-variant font-semibold"> ({i.variant_label})</span>}
              </span>
            </li>
          ))}
        </ul>

        {order.customer_notes && (
          <p className="rounded-xl bg-[#fdf1d6] px-3 py-2 text-base font-bold text-[#7a4b00]">
            <span className="material-symbols-outlined mr-1 align-middle text-lg">edit_note</span>
            {order.customer_notes}
          </p>
        )}

        {onAdvance && (
          <button
            type="button"
            onClick={onAdvance}
            className={`flex min-h-16 w-full items-center justify-center gap-2 rounded-2xl text-lg font-black transition active:scale-[0.98] ${
              order.status === "pendiente" ? STATUS.preparando.solid : STATUS.listo.solid
            }`}
          >
            <span className="material-symbols-outlined text-2xl">{order.status === "pendiente" ? "play_arrow" : "check_circle"}</span>
            {order.status === "pendiente" ? "Empezar a preparar" : "Marcar como listo"}
          </button>
        )}
      </div>
    </article>
  );
}
