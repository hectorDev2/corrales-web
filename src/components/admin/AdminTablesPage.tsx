"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  type RestaurantTable,
  type TableActiveOrder,
  buildTableUrl,
  createTable,
  deleteTable,
  getTableActiveOrders,
  getTables,
  regenerateTableToken,
  updateTable,
} from "@/lib/api/tables";
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  brandedTableCardSvg,
  svgToDataUrl,
  svgToPngDataUrl,
} from "@/lib/branded-qr";
import { supabase } from "@/lib/supabase";

import { TableMap } from "./tables/TableFloor";

type Tab = "mapa" | "qr";
export function AdminTablesPage() {
  const [tab, setTab] = useState<Tab>("mapa");
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [orders, setOrders] = useState<TableActiveOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [t, o] = await Promise.all([getTables(), getTableActiveOrders()]);
      setTables(t);
      setOrders(o);
    } catch {
      toast.error("Error al cargar las mesas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAll();
    const channel = supabase
      .channel("tables-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => void fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "restaurant_tables" }, () => void fetchAll())
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [fetchAll]);

  const ordersByTable = useMemo(() => {
    const map = new Map<string, TableActiveOrder[]>();
    for (const o of orders) map.set(o.table_id, [...(map.get(o.table_id) ?? []), o]);
    return map;
  }, [orders]);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-4 pb-24 md:max-w-5xl md:px-8 md:py-8 lg:max-w-7xl">
      <div className="flex items-end justify-between py-2">
        <div>
          <p className="text-secondary text-xs font-bold tracking-widest uppercase">Administración</p>
          <h2 className="text-on-surface text-2xl font-black tracking-tighter md:text-3xl">Mesas</h2>
        </div>
        <div className="bg-surface-container-high flex rounded-xl p-1">
          {(["mapa", "qr"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-2 text-xs font-bold tracking-wider uppercase transition-all ${
                tab === t ? "bg-primary text-on-primary shadow" : "text-on-surface-variant"
              }`}
            >
              {t === "mapa" ? "Mapa" : "Mesas y QR"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="material-symbols-outlined text-outline animate-spin text-4xl">
            progress_activity
          </span>
        </div>
      ) : tab === "mapa" ? (
        <TableMap tables={tables} ordersByTable={ordersByTable} onChanged={fetchAll} />
      ) : (
        <TableManager tables={tables} onChanged={fetchAll} />
      )}
    </div>
  );
}

// ─── Gestión de mesas y QR ────────────────────────────────────────────────────

const FLOORS = ["Piso 1", "Piso 2", "Piso 3"];

const byLabel = (a: RestaurantTable, b: RestaurantTable) =>
  a.label.localeCompare(b.label, "es", { numeric: true });

function nextNumber(all: RestaurantTable[]) {
  const nums = all.map((t) => Number.parseInt(t.label, 10)).filter(Number.isFinite);
  return (nums.length ? Math.max(...nums) : 0) + 1;
}

function TableManager({
  tables,
  onChanged,
}: {
  tables: RestaurantTable[];
  onChanged: () => Promise<void>;
}) {
  const floors = useMemo(() => {
    const extra = [...new Set(tables.map((t) => t.zone))].filter((z) => !FLOORS.includes(z));
    return [...FLOORS, ...extra];
  }, [tables]);
  const [floor, setFloor] = useState(FLOORS[0]);
  const floorTables = useMemo(() => tables.filter((t) => t.zone === floor).sort(byLabel), [tables, floor]);

  async function run(action: () => Promise<void>, ok: string) {
    try {
      await action();
      await onChanged();
      toast.success(ok);
    } catch {
      toast.error("No se pudo completar la acción.");
    }
  }

  async function addSingle() {
    const n = nextNumber(tables);
    await run(
      () => createTable({ label: String(n), zone: floor, capacity: 4 }),
      `Mesa ${n} agregada al ${floor}.`,
    );
  }

  async function printQr(list: RestaurantTable[]) {
    const active = list.filter((t) => t.is_active);
    if (active.length === 0) return;
    const cards = active.map((t) => {
      const svg = brandedTableCardSvg(buildTableUrl(window.location.origin, t.qr_token), t.label, t.zone);
      return `<div class="c"><img src="${svgToDataUrl(svg)}" alt="Mesa ${escapeHtml(t.label)}"/></div>`;
    });
    const w = window.open("", "_blank");
    if (!w) {
      toast.error("Permite las ventanas emergentes para imprimir.");
      return;
    }
    w.document.write(
      `<!doctype html><title>QR de mesas</title><style>
      @page{size:A4;margin:10mm}
      body{margin:0;display:grid;grid-template-columns:1fr 1fr;gap:8mm}
      .c{break-inside:avoid;display:flex;justify-content:center}
      img{width:100%;max-width:92mm;height:auto}
      </style>${cards.join("")}<script>addEventListener("load",()=>setTimeout(()=>print(),300))</script>`,
    );
    w.document.close();
  }

  return (
    <div className="space-y-6">
      {/* Selector de piso */}
      <div className="grid grid-cols-3 gap-2 sm:flex">
        {floors.map((f) => {
          const count = tables.filter((t) => t.zone === f).length;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFloor(f)}
              className={`rounded-2xl px-5 py-3 text-left transition-all sm:min-w-32 ${
                f === floor ? "bg-primary text-on-primary shadow" : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              <span className="block text-sm font-black">{f}</span>
              <span className="block text-[11px] font-bold opacity-80">
                {count} {count === 1 ? "mesa" : "mesas"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mesas del piso */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-on-surface text-base font-black">
          Mesas del {floor} <span className="text-on-surface-variant font-bold">({floorTables.length})</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void addSingle()}
            className="bg-surface-container-high text-on-surface-variant flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold tracking-wider uppercase"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Una mesa más
          </button>
          {floorTables.length > 0 && (
            <button
              type="button"
              onClick={() => void printQr(floorTables)}
              className="bg-surface-container-high text-on-surface-variant flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold tracking-wider uppercase"
            >
              <span className="material-symbols-outlined text-base">print</span>
              Imprimir QR del piso
            </button>
          )}
          {tables.length > floorTables.length && (
            <button
              type="button"
              onClick={() => void printQr([...tables].sort(byLabel))}
              className="bg-surface-container-high text-on-surface-variant flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold tracking-wider uppercase"
            >
              <span className="material-symbols-outlined text-base">print</span>
              Todos los QR
            </button>
          )}
        </div>
      </div>

      {floorTables.length === 0 ? (
        <p className="text-on-surface-variant text-sm">
          Este piso aún no tiene mesas. Toca «Una mesa más» para agregar la primera.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {floorTables.map((t) => (
            <TableCard
              key={t.id}
              table={t}
              onToggle={() =>
                run(() => updateTable(t.id, { is_active: !t.is_active }), t.is_active ? "Mesa desactivada." : "Mesa activada.")
              }
              onRegenerate={() => {
                if (!window.confirm(`El QR impreso de la mesa ${t.label} dejará de funcionar. ¿Regenerar?`)) return;
                void run(() => regenerateTableToken(t.id), "QR regenerado. Imprime el nuevo código.");
              }}
              onDelete={() => {
                if (!window.confirm(`¿Eliminar la mesa ${t.label}? Sus pedidos pasados se conservan.`)) return;
                void run(() => deleteTable(t.id), "Mesa eliminada.");
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function TableCard({
  table,
  onToggle,
  onRegenerate,
  onDelete,
}: {
  table: RestaurantTable;
  onToggle: () => void;
  onRegenerate: () => void;
  onDelete: () => void;
}) {
  const url = typeof window === "undefined" ? "" : buildTableUrl(window.location.origin, table.qr_token);
  const card = useMemo(
    () => (url ? svgToDataUrl(brandedTableCardSvg(url, table.label, table.zone)) : null),
    [url, table.label, table.zone],
  );

  async function downloadPng() {
    try {
      const png = await svgToPngDataUrl(
        brandedTableCardSvg(url, table.label, table.zone),
        CARD_WIDTH,
        CARD_HEIGHT,
      );
      const a = document.createElement("a");
      a.href = png;
      a.download = `qr-mesa-${table.label}.png`;
      a.click();
    } catch {
      toast.error("No se pudo generar la imagen.");
    }
  }

  return (
    <div className={`bg-surface-container-lowest shadow-card space-y-3 rounded-3xl p-5 ${table.is_active ? "" : "opacity-60"}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-on-surface text-lg font-black">Mesa {table.label}</p>
          <p className="text-on-surface-variant text-xs">
            {table.zone} · {table.capacity} personas
          </p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="bg-surface-container-high text-on-surface-variant rounded-full px-3 py-1 text-[10px] font-bold uppercase"
        >
          {table.is_active ? "Activa" : "Inactiva"}
        </button>
      </div>

      <div className="flex justify-center rounded-2xl bg-surface-container-low p-3">
        {card ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={card} alt={`Tarjeta con el código QR de la mesa ${table.label}`} className="w-44 drop-shadow-md" />
        ) : (
          <div className="bg-surface-container aspect-[600/900] w-44 animate-pulse rounded-xl" />
        )}
      </div>
      <p className="text-outline text-center text-[10px] break-all">{url}</p>

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => void downloadPng()}
          disabled={!card}
          className="bg-primary text-on-primary flex items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-bold uppercase disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-sm">download</span>
          PNG
        </button>
        <button
          type="button"
          onClick={onRegenerate}
          className="bg-surface-container-high text-on-surface-variant flex items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-bold uppercase"
        >
          <span className="material-symbols-outlined text-sm">autorenew</span>
          Nuevo
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="bg-error-container text-error flex items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-bold uppercase"
        >
          <span className="material-symbols-outlined text-sm">delete</span>
          Borrar
        </button>
      </div>
    </div>
  );
}
