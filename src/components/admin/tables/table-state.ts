import type { TableActiveOrder } from "@/lib/api/tables";

export type TableState = "libre" | "pendiente" | "preparando" | "listo";

export const STATE_CONFIG: Record<
  TableState,
  { label: string; chip: string; dot: string; top: string; edge: string; halo: string; icon: string }
> = {
  libre:      { label: "Libre",             chip: "bg-surface-container-high text-on-surface-variant", dot: "bg-outline",    top: "#e0c49a", edge: "#b8925c", halo: "",        icon: "check_circle" },
  pendiente:  { label: "Pedido nuevo",      chip: "bg-[#fde7ea] text-[#9b0020]", dot: "bg-[#e4002b]", top: "#f4909c", edge: "#c4152f", halo: "#e4002b", icon: "notifications_active" },
  preparando: { label: "En preparación",    chip: "bg-[#fdf1d6] text-[#7a4b00]", dot: "bg-[#f5a623]", top: "#f8cf7a", edge: "#d18a00", halo: "#f5a623", icon: "skillet" },
  listo:      { label: "Listo para servir", chip: "bg-[#dff1e6] text-[#1d5a38]", dot: "bg-[#2e8b57]", top: "#8fd3ab", edge: "#2e8b57", halo: "#2e8b57", icon: "room_service" },
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
