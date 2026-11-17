"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { updateOrderStatus } from "@/lib/api/admin";
import {
  type RestaurantTable,
  type TableActiveOrder,
  createTable,
  updateTable,
} from "@/lib/api/tables";

// ─── Estados ──────────────────────────────────────────────────────────────────

type TableState = "libre" | "pendiente" | "preparando" | "listo";

const STATE_CONFIG: Record<
  TableState,
  { label: string; chip: string; dot: string; top: string; edge: string }
> = {
  libre:      { label: "Libre",             chip: "bg-surface-container-high text-on-surface-variant", dot: "bg-outline",    top: "#e0c49a", edge: "#b8925c" },
  pendiente:  { label: "Pedido nuevo",      chip: "bg-yellow-100 text-yellow-800",                      dot: "bg-yellow-500", top: "#fcd34d", edge: "#d99a06" },
  preparando: { label: "En preparación",    chip: "bg-blue-100 text-blue-700",                          dot: "bg-blue-500",   top: "#93c5fd", edge: "#3b82f6" },
  listo:      { label: "Listo para servir", chip: "bg-green-100 text-green-700",                        dot: "bg-green-500",  top: "#86efac", edge: "#22a05a" },
};

const STATE_PRIORITY: TableState[] = ["pendiente", "preparando", "listo"];

function getTableState(orders: TableActiveOrder[]): TableState {
  for (const s of STATE_PRIORITY) {
    if (orders.some((o) => o.status === s)) return s;
  }
  return "libre";
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function minutesSince(iso: string, now: number) {
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
}

function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

// ─── Mesa dibujada (SVG) ──────────────────────────────────────────────────────

/** Mesa vista en perspectiva, con sillas repartidas según la capacidad. */
function TableGraphic({
  label,
  seats,
  top,
  edge,
  muted,
}: {
  label: string;
  seats: number;
  top: string;
  edge: string;
  muted: boolean;
}) {
  const n = clamp(seats, 1, 12);
  const chairs = Array.from({ length: n }, (_, i) => {
    const a = (-90 + (360 / n) * i) * (Math.PI / 180);
    return { x: 60 + Math.cos(a) * 47, y: 52 + Math.sin(a) * 27, back: Math.sin(a) < 0 };
  });

  const chair = (c: { x: number; y: number }, i: number) => (
    <g key={i}>
      <ellipse cx={c.x} cy={c.y + 4} rx={8} ry={4} fill="#000" opacity={0.12} />
      <rect x={c.x - 7} y={c.y - 7} width={14} height={11} rx={4} fill="#6b5b4b" />
      <rect x={c.x - 7} y={c.y - 10} width={14} height={4} rx={2} fill="#4a3d31" />
    </g>
  );

  return (
    <svg
      viewBox="0 0 120 96"
      className={muted ? "grayscale" : ""}
      aria-hidden="true"
      style={{ overflow: "visible" }}
    >
      <ellipse cx={60} cy={84} rx={44} ry={9} fill="#000" opacity={0.15} />
      {chairs.filter((c) => c.back).map(chair)}
      {/* patas */}
      <rect x={42} y={58} width={5} height={22} rx={2} fill="#5a4636" />
      <rect x={73} y={58} width={5} height={22} rx={2} fill="#5a4636" />
      {/* canto y tapa */}
      <ellipse cx={60} cy={59} rx={36} ry={18} fill={edge} />
      <ellipse cx={60} cy={53} rx={36} ry={18} fill={top} stroke={edge} strokeWidth={1.5} />
      <text
        x={60}
        y={59}
        textAnchor="middle"
        fontSize={19}
        fontWeight={900}
        fill="#2b2118"
        style={{ fontFamily: "inherit" }}
      >
        {label}
      </text>
      {chairs.filter((c) => !c.back).map(chair)}
    </svg>
  );
}

// ─── Mapa ─────────────────────────────────────────────────────────────────────

const TILT = 50; // grados de inclinación del piso en vista 3D

export function TableMap({
  tables,
  ordersByTable,
  onChanged,
}: {
  tables: RestaurantTable[];
  ordersByTable: Map<string, TableActiveOrder[]>;
  onChanged: () => Promise<void>;
}) {
  const zones = useMemo(
    () => [...new Set(tables.map((t) => t.zone))].sort((a, b) => a.localeCompare(b, "es", { numeric: true })),
    [tables],
  );
  const [zone, setZone] = useState<string | null>(null);
  const activeZone = zone && zones.includes(zone) ? zone : (zones[0] ?? null);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ id: string; x: number; y: number } | null>(null);
  const floorRef = useRef<HTMLDivElement>(null);
  const now = useNow(30_000);

  const visible = tables.filter((t) => t.zone === activeZone);
  const selected = tables.find((t) => t.id === selectedId) ?? null;

  const counts = useMemo(() => {
    const c: Record<TableState, number> = { libre: 0, pendiente: 0, preparando: 0, listo: 0 };
    for (const t of tables.filter((t) => t.zone === activeZone && t.is_active)) {
      c[getTableState(ordersByTable.get(t.id) ?? [])]++;
    }
    return c;
  }, [tables, activeZone, ordersByTable]);

  function pointFromEvent(e: React.PointerEvent) {
    const rect = floorRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: clamp(((e.clientX - rect.left) / rect.width) * 100, 5, 95),
      y: clamp(((e.clientY - rect.top) / rect.height) * 100, 12, 94),
    };
  }

  async function finishDrag() {
    if (!drag) return;
    const { id, x, y } = drag;
    setDrag(null);
    try {
      await updateTable(id, { pos_x: Math.round(x * 100) / 100, pos_y: Math.round(y * 100) / 100 });
      await onChanged();
    } catch {
      toast.error("No se pudo guardar la posición.");
    }
  }

  async function addTable() {
    const nums = tables.map((t) => Number.parseInt(t.label, 10)).filter(Number.isFinite);
    const label = String((nums.length ? Math.max(...nums) : tables.length) + 1);
    try {
      await createTable({ label, zone: activeZone ?? "Salón", capacity: 4 });
      await onChanged();
      toast.success(`Mesa ${label} agregada. Arrástrala a su lugar.`);
    } catch {
      toast.error("No se pudo agregar la mesa.");
    }
  }

  async function changeSeats(table: RestaurantTable, delta: number) {
    const capacity = clamp(table.capacity + delta, 1, 12);
    if (capacity === table.capacity) return;
    try {
      await updateTable(table.id, { capacity });
      await onChanged();
    } catch {
      toast.error("No se pudo cambiar la capacidad.");
    }
  }

  if (tables.length === 0) {
    return (
      <div className="text-on-surface-variant flex flex-col items-center gap-3 py-16">
        <span className="material-symbols-outlined text-outline text-5xl">table_restaurant</span>
        <p className="text-sm font-bold">Aún no hay mesas. Créalas en la pestaña «Mesas y QR».</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {zones.map((z) => (
            <button
              key={z}
              type="button"
              onClick={() => setZone(z)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold ${
                z === activeZone ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {z}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {editMode && (
            <button
              type="button"
              onClick={() => void addTable()}
              className="bg-surface-container-high text-on-surface-variant flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold tracking-wider uppercase"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Mesa
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setEditMode((v) => !v);
              setDrag(null);
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold tracking-wider uppercase ${
              editMode ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"
            }`}
          >
            <span className="material-symbols-outlined text-base">{editMode ? "check" : "open_with"}</span>
            {editMode ? "Listo" : "Acomodar mesas"}
          </button>
        </div>
      </div>

      {/* Resumen de un vistazo */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(STATE_CONFIG) as TableState[]).map((s) => (
          <span
            key={s}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${STATE_CONFIG[s].chip}`}
          >
            <span className={`size-2.5 rounded-full ${STATE_CONFIG[s].dot}`} />
            {counts[s]} {STATE_CONFIG[s].label.toLowerCase()}
          </span>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* Escenario */}
        <div
          className="bg-surface-container-low border-outline-variant/30 relative aspect-[16/11] w-full overflow-hidden rounded-3xl border"
          style={{ perspective: "1400px", containerType: "inline-size" }}
        >
          <div
            ref={floorRef}
            role="application"
            aria-label={`Salón ${activeZone ?? ""}${editMode ? ", modo acomodar" : ""}`}
            className="absolute inset-0 touch-none transition-transform duration-500 ease-out motion-reduce:transition-none"
            style={{
              transformStyle: "preserve-3d",
              transform: editMode ? "none" : `translateY(-2%) rotateX(${TILT}deg) scale(0.84)`,
              transformOrigin: "50% 55%",
              borderRadius: "1.25rem",
              backgroundColor: "#e9d8bd",
              backgroundImage: editMode
                ? "linear-gradient(to right, rgba(0,0,0,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.07) 1px, transparent 1px)"
                : "repeating-linear-gradient(90deg, rgba(0,0,0,0) 0 56px, rgba(120,80,30,0.14) 56px 58px)",
              backgroundSize: editMode ? "5% 7%" : undefined,
              boxShadow: "0 18px 0 #b99a6b, 0 30px 40px rgba(0,0,0,0.25)",
            }}
            onPointerMove={(e) => {
              if (!drag) return;
              const p = pointFromEvent(e);
              if (p) setDrag({ id: drag.id, ...p });
            }}
            onPointerUp={() => void finishDrag()}
            onPointerCancel={() => setDrag(null)}
          >
            {visible.map((t) => {
              const tableOrders = ordersByTable.get(t.id) ?? [];
              const state = t.is_active ? getTableState(tableOrders) : "libre";
              const cfg = STATE_CONFIG[state];
              const x = drag?.id === t.id ? drag.x : t.pos_x;
              const y = drag?.id === t.id ? drag.y : t.pos_y;
              const isSelected = selectedId === t.id;
              const oldest = tableOrders[0];
              const mins = oldest ? minutesSince(oldest.created_at, now) : null;
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-label={`Mesa ${t.label}, ${t.is_active ? cfg.label : "inactiva"}`}
                  onClick={() => setSelectedId(t.id)}
                  onPointerDown={(e) => {
                    if (!editMode) return;
                    e.currentTarget.setPointerCapture(e.pointerId);
                    setSelectedId(t.id);
                    setDrag({ id: t.id, x: t.pos_x, y: t.pos_y });
                  }}
                  className={`absolute flex flex-col items-center transition-transform duration-500 ease-out motion-reduce:transition-none ${
                    editMode ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
                  }`}
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    width: "clamp(64px, 15cqw, 130px)",
                    transformOrigin: "50% 100%",
                    // De pie respecto al piso: contrarresta la inclinación para mirar al frente.
                    transform: `translate(-50%, -100%) rotateX(${editMode ? 0 : -TILT}deg)`,
                    filter: isSelected ? "drop-shadow(0 0 6px rgba(0,0,0,0.45))" : undefined,
                  }}
                >
                  <span
                    className={`relative block w-full ${
                      state === "pendiente" ? "motion-safe:animate-pulse" : ""
                    }`}
                  >
                    <TableGraphic
                      label={t.label}
                      seats={t.capacity}
                      top={cfg.top}
                      edge={cfg.edge}
                      muted={!t.is_active}
                    />
                  </span>
                  {t.is_active && state !== "libre" && (
                    <span
                      className={`-mt-1 rounded-full px-2 py-0.5 text-[10px] leading-none font-black shadow ${cfg.chip}`}
                    >
                      {mins !== null && mins > 0 ? `${mins} min` : cfg.label}
                    </span>
                  )}
                  {isSelected && (
                    <span className="bg-primary mt-0.5 h-1 w-8 rounded-full" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>

          {editMode && (
            <p className="bg-surface-container-lowest/90 pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1.5 text-[11px] font-bold shadow">
              Arrastra las mesas a su lugar
            </p>
          )}
        </div>

        <aside className="bg-surface-container-lowest shadow-card space-y-3 rounded-3xl p-5">
          {selected ? (
            <TableDetail
              table={selected}
              orders={ordersByTable.get(selected.id) ?? []}
              editMode={editMode}
              onSeats={(d) => void changeSeats(selected, d)}
              onChanged={onChanged}
            />
          ) : (
            <p className="text-on-surface-variant text-sm">
              Toca una mesa para ver sus pedidos.
              {!editMode && " Usa «Acomodar mesas» para moverlas como están en el salón."}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

// ─── Detalle de mesa ──────────────────────────────────────────────────────────

function TableDetail({
  table,
  orders,
  editMode,
  onSeats,
  onChanged,
}: {
  table: RestaurantTable;
  orders: TableActiveOrder[];
  editMode: boolean;
  onSeats: (delta: number) => void;
  onChanged: () => Promise<void>;
}) {
  const state = table.is_active ? getTableState(orders) : "libre";
  const cfg = STATE_CONFIG[state];
  const total = orders.reduce((sum, o) => sum + o.total, 0);

  async function markServed(orderId: string) {
    try {
      await updateOrderStatus(orderId, "entregado");
      await onChanged();
      toast.success("Pedido marcado como servido.");
    } catch {
      toast.error("No se pudo actualizar el pedido.");
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-on-surface text-xl font-black">Mesa {table.label}</p>
          <p className="text-on-surface-variant text-xs">
            {table.zone} · {table.capacity} personas
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase ${cfg.chip}`}>
          {table.is_active ? cfg.label : "Inactiva"}
        </span>
      </div>

      {editMode && (
        <div className="bg-surface-container-low flex items-center justify-between rounded-xl p-2">
          <span className="text-on-surface-variant pl-2 text-xs font-bold">Sillas</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Quitar silla"
              onClick={() => onSeats(-1)}
              className="bg-surface-container-high flex size-8 items-center justify-center rounded-lg text-lg font-black"
            >
              −
            </button>
            <span className="w-5 text-center text-sm font-black">{table.capacity}</span>
            <button
              type="button"
              aria-label="Agregar silla"
              onClick={() => onSeats(1)}
              className="bg-surface-container-high flex size-8 items-center justify-center rounded-lg text-lg font-black"
            >
              +
            </button>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <p className="text-on-surface-variant text-sm">Sin pedidos en curso.</p>
      ) : (
        <>
          {orders.map((o) => (
            <div key={o.id} className="bg-surface-container-low space-y-1 rounded-xl p-3">
              <div className="flex items-center justify-between text-xs font-black">
                <span>ORDEN #{o.order_number}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${STATE_CONFIG[o.status].chip}`}>
                  {STATE_CONFIG[o.status].label}
                </span>
              </div>
              {o.items.map((i) => (
                <p key={i.id} className="text-[13px]">
                  <span className="text-primary font-black">{i.quantity}x</span> {i.product_name}
                  {i.variant_label && <span className="text-on-surface-variant"> ({i.variant_label})</span>}
                </p>
              ))}
              {o.status === "listo" && (
                <button
                  type="button"
                  onClick={() => void markServed(o.id)}
                  className="bg-primary text-on-primary mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[11px] font-bold tracking-wider uppercase active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">table_restaurant</span>
                  Servido en la mesa
                </button>
              )}
            </div>
          ))}
          <div className="flex justify-between border-t border-dashed pt-3 text-sm font-black">
            <span>Por cobrar</span>
            <span className="text-primary">S/ {total.toFixed(2)}</span>
          </div>
        </>
      )}
    </>
  );
}
