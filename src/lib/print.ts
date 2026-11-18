import type { AdminOrder, ProductStation } from "@/types/admin";

export type PrinterTarget = "caja" | ProductStation;

const AGENT_URL = process.env.NEXT_PUBLIC_PRINT_AGENT_URL ?? "http://localhost:9101";
const AGENT_TOKEN = process.env.NEXT_PUBLIC_PRINT_AGENT_TOKEN ?? "";

async function send(body: Record<string, unknown>): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${AGENT_URL}/print`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-print-token": AGENT_TOKEN },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("No se pudo conectar con el agente de impresión. ¿Está encendido?");
  }
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: "" }));
    throw new Error(error || "Error al imprimir.");
  }
}

/** Boleta en caja: incluye todos los productos del pedido. */
export function printReceipt(order: AdminOrder, opts: { openDrawer?: boolean } = {}): Promise<void> {
  return send({ printer: "caja", type: "receipt", order, openDrawer: opts.openDrawer });
}

/**
 * Comandas por estación: cada impresora (cocina / horno / barra) recibe solo sus productos.
 * Devuelve las estaciones impresas. Si alguna falla, lanza un error indicando cuáles.
 */
export async function printStationTickets(order: AdminOrder): Promise<ProductStation[]> {
  const byStation = new Map<ProductStation, AdminOrder["items"]>();
  for (const item of order.items) {
    byStation.set(item.station, [...(byStation.get(item.station) ?? []), item]);
  }

  const results = await Promise.allSettled(
    [...byStation].map(([station, items]) =>
      send({ printer: station, type: "kitchen", station, order: { ...order, items } }),
    ),
  );

  const stations = [...byStation.keys()];
  const failed = stations.filter((_, i) => results[i].status === "rejected");
  if (failed.length > 0) {
    const reason = (results.find((r) => r.status === "rejected") as PromiseRejectedResult).reason;
    throw new Error(`Falló la impresión en: ${failed.join(", ")}. ${reason instanceof Error ? reason.message : ""}`);
  }
  return stations;
}
