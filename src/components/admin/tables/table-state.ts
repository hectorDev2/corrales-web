import type { TableActiveOrder } from "@/lib/api/tables";

export type TableState = "libre" | "pendiente" | "preparando" | "listo";

export const STATE_CONFIG: Record<
  TableState,
  { label: string; chip: string; dot: string; top: string; edge: string; halo: string; icon: string }
> = {
  libre:      { label: "Libre",             chip: "bg-surface-container-high text-on-surface-variant", dot: "bg-outline",    top: "#e0c49a", edge: "#b8925c", halo: "",        icon: "check_circle" },
  pendiente:  { label: "Pedido nuevo",      chip: "bg-yellow-100 text-yellow-800",                      dot: "bg-yellow-500", top: "#fcd34d", edge: "#d99a06", halo: "#f59e0b", icon: "notifications_active" },
  preparando: { label: "En preparación",    chip: "bg-blue-100 text-blue-700",                          dot: "bg-blue-500",   top: "#93c5fd", edge: "#3b82f6", halo: "#2563eb", icon: "skillet" },
  listo:      { label: "Listo para servir", chip: "bg-green-100 text-green-700",                        dot: "bg-green-500",  top: "#86efac", edge: "#22a05a", halo: "#16a34a", icon: "room_service" },
};

const STATE_PRIORITY: TableState[] = ["pendiente", "preparando", "listo"];

export function getTableState(orders: TableActiveOrder[]): TableState {
  for (const s of STATE_PRIORITY) {
    if (orders.some((o) => o.status === s)) return s;
  }
  return "libre";
}

export function minutesSince(iso: string, now: number) {
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
}
