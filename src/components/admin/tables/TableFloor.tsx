"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { updateOrderStatus } from "@/lib/api/admin";
import {
  type RestaurantTable,
  type TableActiveOrder,
  createTable,
  updateTable,
} from "@/lib/api/tables";

import { STATE_CONFIG, type TableState, getTableState, minutesSince } from "./table-state";

// Escena 3D real (Three.js). Se carga solo en el navegador y solo cuando se usa.
const TableScene3D = dynamic(() => import("./TableScene3D"), {
  ssr: false,
  loading: () => (
    <div className="text-on-surface-variant flex h-full items-center justify-center gap-2 text-sm font-bold">
      <span className="material-symbols-outlined animate-spin">progress_activity</span>
      Cargando salón 3D…
    </div>
  ),
});

/** Si el equipo no soporta WebGL, muestra el mapa anterior en lugar de romper la pantalla. */
class WebGLBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

// ─── Estados ──────────────────────────────────────────────────────────────────

const ORDER_STEPS = ["Recibido", "Preparando", "Listo", "Servido"] as const;
const STEP_INDEX: Record<TableState, number> = { libre: 0, pendiente: 0, preparando: 1, listo: 2 };

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

// ─── Mapa ─────────────────────────────────────────────────────────────────────

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
  const [filter, setFilter] = useState<TableState | null>(null);
  const [view, setView] = useState<"mapa" | "lista">("mapa");
  const [selectedId, setSelectedId] = useState<string | null>(null);
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

  const zoneSummary = useMemo(() => {
    const m = new Map<string, { libres: number; nuevos: number }>();
    for (const z of zones) {
      let libres = 0;
      let nuevos = 0;
      for (const t of tables.filter((t) => t.zone === z && t.is_active)) {
        const st = getTableState(ordersByTable.get(t.id) ?? []);
        if (st === "libre") libres++;
        if (st === "pendiente") nuevos++;
      }
      m.set(z, { libres, nuevos });
    }
    return m;
  }, [zones, tables, ordersByTable]);

  async function moveTable(id: string, pos: { pos_x: number; pos_y: number }) {
    try {
      await updateTable(id, pos);
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

  async function rotateTable(table: RestaurantTable) {
    try {
      await updateTable(table.id, { rotation: table.rotation === 90 ? 0 : 90 });
      await onChanged();
    } catch {
      toast.error("No se pudo girar la mesa. ¿Ya aplicaste la migración de Supabase?");
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
          {zones.map((z) => {
            const sum = zoneSummary.get(z);
            return (
              <button
                key={z}
                type="button"
                onClick={() => setZone(z)}
                className={`relative rounded-2xl px-4 py-2 text-left ${
                  z === activeZone ? "bg-primary text-on-primary shadow" : "bg-surface-container-high text-on-surface-variant"
                }`}
              >
                <span className="block text-xs font-black">{z}</span>
                <span className="block text-xs font-bold opacity-80">{sum?.libres ?? 0} libres</span>
                {(sum?.nuevos ?? 0) > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-red-600 text-xs font-black text-white shadow ring-2 ring-white">
                    {sum?.nuevos}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <div className="bg-surface-container-high flex rounded-xl p-1" role="group" aria-label="Forma de ver las mesas">
            {(["mapa", "lista"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => {
                  setView(v);
                  if (v === "lista") setEditMode(false);
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold ${
                  view === v ? "bg-surface-container-lowest text-on-surface shadow" : "text-on-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined text-base">{v === "mapa" ? "map" : "list"}</span>
                {v === "mapa" ? "Mapa" : "Lista"}
              </button>
            ))}
          </div>
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
            hidden={view === "lista"}
            onClick={() => {
              setEditMode((v) => !v);
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
          <button
            key={s}
            type="button"
            aria-pressed={filter === s}
            onClick={() => setFilter((f) => (f === s ? null : s))}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${STATE_CONFIG[s].chip} ${
              filter === s ? "ring-2 ring-current ring-offset-1" : filter ? "opacity-50" : ""
            }`}
          >
            <span className="material-symbols-outlined text-sm">{STATE_CONFIG[s].icon}</span>
            {counts[s]} {STATE_CONFIG[s].label.toLowerCase()}
          </button>
        ))}
        {filter && (
          <button
            type="button"
            onClick={() => setFilter(null)}
            className="text-on-surface-variant px-2 text-xs font-bold underline"
          >
            Ver todas
          </button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {view === "lista" ? (
          <TableList
            tables={visible.filter((t) => t.is_active)}
            ordersByTable={ordersByTable}
            filter={filter}
            now={now}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        ) : (
          <div className="border-outline-variant/30 relative aspect-[4/3] w-full overflow-hidden rounded-3xl border bg-[#f4ede4] md:aspect-[16/11]">
            <WebGLBoundary
              fallback={
                <p className="text-on-surface-variant flex h-full items-center justify-center p-6 text-center text-sm font-bold">
                  Este equipo no puede mostrar el salón en 3D. Usa la vista «Lista».
                </p>
              }
            >
              <TableScene3D
                tables={visible}
                ordersByTable={ordersByTable}
                filter={filter}
                now={now}
                selectedId={selectedId}
                editMode={editMode}
                onSelect={setSelectedId}
                onMove={(id, pos) => void moveTable(id, pos)}
              />
            </WebGLBoundary>
            <p
              className={`pointer-events-none absolute bottom-3 left-3 rounded-full px-3 py-1 text-[11px] font-bold shadow ${
                editMode ? "bg-primary text-on-primary" : "bg-white/85 text-[#5b4636]"
              }`}
            >
              {editMode
                ? "Arrastra cada mesa a su lugar · tócala para girarla o cambiar sillas"
                : "Arrastra para girar la vista · rueda o pellizco para acercar"}
            </p>
          </div>
        )}

        <aside
          className={`bg-surface-container-lowest space-y-3 p-5 shadow-[0_-12px_40px_rgba(0,0,0,0.18)] max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-[60] max-lg:max-h-[75dvh] max-lg:overflow-y-auto max-lg:rounded-t-3xl lg:shadow-card lg:rounded-3xl ${
            selected ? "" : "max-lg:hidden"
          }`}
        >
          {selected && (
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="bg-surface-container-high text-on-surface-variant ml-auto flex h-10 items-center gap-1 rounded-full px-4 text-xs font-bold lg:hidden"
            >
              <span className="material-symbols-outlined text-base">close</span>
              Cerrar
            </button>
          )}
          {selected ? (
            <TableDetail
              table={selected}
              orders={ordersByTable.get(selected.id) ?? []}
              editMode={editMode}
              onSeats={(d) => void changeSeats(selected, d)}
              onRotate={() => void rotateTable(selected)}
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
  onRotate,
  onChanged,
}: {
  table: RestaurantTable;
  orders: TableActiveOrder[];
  editMode: boolean;
  onSeats: (delta: number) => void;
  onRotate: () => void;
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
      <div className="flex items-center gap-3">
        <div
          className="flex size-16 shrink-0 items-center justify-center rounded-2xl text-3xl font-black text-[#2b2118] shadow-inner"
          style={{ backgroundColor: cfg.top, boxShadow: `inset 0 -4px 0 ${cfg.edge}` }}
        >
          {table.label}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-on-surface-variant text-xs">
            {table.zone} · {table.capacity} personas
          </p>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold tracking-wider uppercase ${cfg.chip}`}
          >
            <span className="material-symbols-outlined text-sm">{table.is_active ? cfg.icon : "block"}</span>
            {table.is_active ? cfg.label : "Inactiva"}
          </span>
        </div>
      </div>

      {editMode && (
        <button
          type="button"
          onClick={onRotate}
          disabled={table.capacity <= 2}
          title={table.capacity <= 2 ? "Las mesas redondas no necesitan girarse" : undefined}
          className="bg-surface-container-high text-on-surface flex min-h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold active:scale-95 disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-xl">rotate_right</span>
          Girar mesa
        </button>
      )}

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
                <span className={`rounded-full px-2 py-0.5 text-xs uppercase ${STATE_CONFIG[o.status].chip}`}>
                  {STATE_CONFIG[o.status].label}
                </span>
              </div>
              <OrderTimeline step={STEP_INDEX[o.status]} />
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
                  className="bg-primary text-on-primary mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold tracking-wider uppercase active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">table_restaurant</span>
                  Servido en la mesa
                </button>
              )}
            </div>
          ))}
          <div className="bg-primary/5 flex items-end justify-between rounded-2xl px-4 py-3">
            <span className="text-on-surface-variant text-xs font-bold">Por cobrar</span>
            <span className="text-primary text-3xl leading-none font-black">S/ {total.toFixed(2)}</span>
          </div>
        </>
      )}
    </>
  );
}

function OrderTimeline({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-1 py-2" aria-label="Avance del pedido">
      {ORDER_STEPS.map((label, i) => {
        const done = i <= step;
        return (
          <li key={label} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <div className="flex w-full items-center">
              <span className={`h-0.5 flex-1 ${i === 0 ? "opacity-0" : done ? "bg-primary" : "bg-outline-variant"}`} />
              <span
                className={`size-3 shrink-0 rounded-full ${done ? "bg-primary" : "bg-outline-variant"} ${
                  i === step ? "ring-primary/30 ring-4" : ""
                }`}
              />
              <span
                className={`h-0.5 flex-1 ${i === ORDER_STEPS.length - 1 ? "opacity-0" : i < step ? "bg-primary" : "bg-outline-variant"}`}
              />
            </div>
            <span className={`text-xs font-bold ${done ? "text-on-surface" : "text-outline"}`}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

// ─── Vista de lista ───────────────────────────────────────────────────────────

function TableList({
  tables,
  ordersByTable,
  filter,
  now,
  selectedId,
  onSelect,
}: {
  tables: RestaurantTable[];
  ordersByTable: Map<string, TableActiveOrder[]>;
  filter: TableState | null;
  now: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const rows = tables
    .map((t) => {
      const orders = ordersByTable.get(t.id) ?? [];
      const state = getTableState(orders);
      const oldest = orders[0] ? minutesSince(orders[0].created_at, now) : null;
      return { t, orders, state, oldest, total: orders.reduce((sum, o) => sum + o.total, 0) };
    })
    .filter((r) => !filter || r.state === filter)
    // Primero lo que necesita atención: más tiempo esperando arriba; libres al final.
    .sort((a, b) => (b.oldest ?? -1) - (a.oldest ?? -1) || a.t.label.localeCompare(b.t.label, "es", { numeric: true }));

  if (rows.length === 0) {
    return <p className="text-on-surface-variant py-10 text-center text-sm">No hay mesas con ese estado.</p>;
  }

  return (
    <ul className="space-y-2">
      {rows.map(({ t, state, oldest, total }) => {
        const cfg = STATE_CONFIG[state];
        return (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => onSelect(t.id)}
              aria-pressed={selectedId === t.id}
              className={`bg-surface-container-lowest flex min-h-16 w-full items-center gap-3 rounded-2xl p-3 text-left shadow-sm transition ${
                selectedId === t.id ? "ring-primary ring-2" : ""
              }`}
            >
              <span
                className="flex size-12 shrink-0 items-center justify-center rounded-xl text-xl font-black text-[#2b2118]"
                style={{ backgroundColor: cfg.top, boxShadow: `inset 0 -3px 0 ${cfg.edge}` }}
              >
                {t.label}
              </span>
              <span className="min-w-0 flex-1">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${cfg.chip}`}>
                  <span className="material-symbols-outlined text-sm">{cfg.icon}</span>
                  {cfg.label}
                </span>
                <span className="text-on-surface-variant mt-1 block text-xs">
                  {t.capacity} personas{oldest !== null && oldest > 0 ? ` · espera ${oldest} min` : ""}
                </span>
              </span>
              {total > 0 && <span className="text-primary text-lg font-black">S/ {total.toFixed(2)}</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
