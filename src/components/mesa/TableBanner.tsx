"use client";

import { useSyncExternalStore } from "react";

import { useTableSession } from "@/store/table-session";

const noopSubscribe = () => () => {};

/** Franja visible en toda la web pública mientras el cliente está vinculado a una mesa. */
export function TableBanner() {
  // Evita desajuste de hidratación: el estado persistido solo existe en el cliente.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const table = useTableSession((s) => s.table);
  const clearTable = useTableSession((s) => s.clearTable);

  if (!mounted || !table) return null;

  return (
    <div className="bg-primary text-on-primary flex items-center justify-center gap-3 px-4 py-2 text-xs font-bold">
      <span className="material-symbols-outlined text-base" aria-hidden="true">
        table_restaurant
      </span>
      <span>
        Pidiendo desde la Mesa {table.label} · {table.zone}
      </span>
      <button type="button" onClick={clearTable} className="underline underline-offset-2">
        Salir
      </button>
    </div>
  );
}
