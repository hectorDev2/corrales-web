"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  type KitchenOrder,
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
    setOrders((prev) => (next === "listo" ? prev.filter((o) => o.id !== order.id) : prev.map((o) => (o.id === order.id ? { ...o, status: next } : o))));
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
  const nuevos = visible.filter((o) => o.status === "pendiente");
  const enCurso = visible.filter((o) => o.status === "preparando");

  return (
    <div className="mx-auto w-full max-w-[110rem] space-y-5 px-4 py-5 md:px-8">
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
            sound ? "bg-green-100 text-green-800" : "bg-surface-container-high text-on-surface-variant"
          }`}
        >
          <span className="material-symbols-outlined text-xl">{sound ? "volume_up" : "volume_off"}</span>
          {sound ? "Sonido activado" : "Activar sonido de pedidos nuevos"}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="material-symbols-outlined text-outline animate-spin text-5xl">progress_activity</span>
        </div>
      ) : visible.length === 0 ? (
        <div className="text-on-surface-variant flex flex-col items-center gap-3 py-24">
          <span className="material-symbols-outlined text-outline text-7xl">task_alt</span>
          <p className="text-xl font-black">Todo al día</p>
          <p className="text-sm">Los pedidos nuevos aparecerán aquí solos.</p>
        </div>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <Column title="Nuevos" count={nuevos.length} tone="new">
            {nuevos.map((o) => (
              <OrderCard key={o.id} order={o} now={now} onAdvance={() => void advance(o, "preparando")} />
            ))}
          </Column>
          <Column title="Preparando" count={enCurso.length} tone="cooking">
            {enCurso.map((o) => (
              <OrderCard key={o.id} order={o} now={now} onAdvance={() => void advance(o, "listo")} />
            ))}
          </Column>
        </div>
      )}
    </div>
  );
}

function Column({
  title,
  count,
  tone,
  children,
}: {
  title: string;
  count: number;
  tone: "new" | "cooking";
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-lg font-black">
        <span className={`size-3 rounded-full ${tone === "new" ? "bg-yellow-500" : "bg-blue-500"}`} />
        {title}
        <span className="bg-surface-container-high text-on-surface-variant rounded-full px-2.5 py-0.5 text-sm">{count}</span>
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">{children}</div>
      {count === 0 && <p className="text-on-surface-variant py-4 text-sm">Nada por aquí.</p>}
    </section>
  );
}

function OrderCard({ order, now, onAdvance }: { order: KitchenOrder; now: number; onAdvance: () => void }) {
  const mins = minutesSince(order.created_at, now);
  const late = mins >= 20;
  const warn = mins >= 10 && !late;
  const where =
    order.delivery_type === "dine_in" && order.table_label ? `Mesa ${order.table_label}` : TYPE_LABEL[order.delivery_type];

  return (
    <article
      className={`bg-surface-container-lowest flex flex-col gap-3 rounded-3xl p-5 shadow-sm ring-2 ${
        late ? "ring-red-500" : warn ? "ring-amber-400" : "ring-transparent"
      }`}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-3xl leading-none font-black">#{order.order_number}</p>
          <p className="text-on-surface-variant mt-1 text-sm font-bold">{where}</p>
        </div>
        <span
          className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-black ${
            late ? "bg-red-100 text-red-700" : warn ? "bg-amber-100 text-amber-800" : "bg-surface-container-high text-on-surface-variant"
          }`}
        >
          <span className="material-symbols-outlined text-lg">timer</span>
          {mins} min
        </span>
      </header>

      <ul className="space-y-1.5">
        {order.items.map((i) => (
          <li key={i.id} className="flex items-baseline gap-3 text-xl leading-snug font-bold">
            <span className="text-primary min-w-8 text-2xl font-black">{i.quantity}×</span>
            <span>
              {i.product_name}
              {i.variant_label && <span className="text-on-surface-variant font-semibold"> ({i.variant_label})</span>}
            </span>
          </li>
        ))}
      </ul>

      {order.customer_notes && (
        <p className="rounded-xl bg-yellow-50 px-3 py-2 text-base font-bold text-yellow-900">
          <span className="material-symbols-outlined mr-1 align-middle text-lg">edit_note</span>
          {order.customer_notes}
        </p>
      )}

      <button
        type="button"
        onClick={onAdvance}
        className={`min-h-14 rounded-2xl text-base font-black tracking-wide uppercase transition active:scale-[0.98] ${
          order.status === "pendiente" ? "bg-blue-600 text-white" : "bg-green-600 text-white"
        }`}
      >
        {order.status === "pendiente" ? "Empezar a preparar" : "¡Listo!"}
      </button>
    </article>
  );
}
