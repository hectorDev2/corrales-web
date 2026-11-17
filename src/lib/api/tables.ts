import { supabase } from "@/lib/supabase";
import type { CartItem } from "@/types/cart";

export interface RestaurantTable {
  id: string;
  label: string;
  zone: string;
  capacity: number;
  pos_x: number;
  pos_y: number;
  qr_token: string;
  is_active: boolean;
}

export type TableOrderStatus = "pendiente" | "preparando" | "listo";

export interface TableActiveOrder {
  id: string;
  order_number: number;
  table_id: string;
  status: TableOrderStatus;
  total: number;
  created_at: string;
  items: { id: string; product_name: string; variant_label: string | null; quantity: number }[];
}

export type TableInput = Pick<RestaurantTable, "label" | "zone" | "capacity">;

const TABLE_COLUMNS = "id, label, zone, capacity, pos_x, pos_y, qr_token, is_active";

export async function getTables(): Promise<RestaurantTable[]> {
  const { data, error } = await supabase
    .from("restaurant_tables")
    .select(TABLE_COLUMNS)
    .order("zone", { ascending: true })
    .order("label", { ascending: true });

  if (error) throw error;
  return data as RestaurantTable[];
}

export async function createTable(input: TableInput): Promise<void> {
  // Escalonamos la posición inicial para que las mesas nuevas no se apilen.
  const { count } = await supabase
    .from("restaurant_tables")
    .select("id", { count: "exact", head: true });
  const n = count ?? 0;

  const { error } = await supabase.from("restaurant_tables").insert({
    ...input,
    pos_x: 8 + (n % 6) * 15,
    pos_y: 10 + (Math.floor(n / 6) % 6) * 14,
  });
  if (error) throw error;
}

export async function updateTable(
  id: string,
  patch: Partial<Omit<RestaurantTable, "id" | "qr_token">>,
): Promise<void> {
  const { error } = await supabase.from("restaurant_tables").update(patch).eq("id", id);
  if (error) throw error;
}

/** Genera un token nuevo: el QR impreso anterior deja de funcionar. */
export async function regenerateTableToken(id: string): Promise<void> {
  const token = crypto.randomUUID().replaceAll("-", "");
  const { error } = await supabase
    .from("restaurant_tables")
    .update({ qr_token: token })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteTable(id: string): Promise<void> {
  const { error } = await supabase.from("restaurant_tables").delete().eq("id", id);
  if (error) throw error;
}

export async function getTableActiveOrders(): Promise<TableActiveOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, table_id, status, total, created_at, order_items ( id, product_name, variant_label, quantity )",
    )
    .not("table_id", "is", null)
    .in("status", ["pendiente", "preparando", "listo"])
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    order_number: row.order_number,
    table_id: row.table_id as string,
    status: row.status as TableOrderStatus,
    total: row.total,
    created_at: row.created_at,
    items: (row.order_items as TableActiveOrder["items"]) ?? [],
  }));
}

export function buildTableUrl(origin: string, token: string): string {
  return `${origin}/mesa/${token}`;
}

// ─── Lado cliente (QR) ────────────────────────────────────────────────────────

export async function getTableByToken(
  token: string,
): Promise<{ id: string; label: string; zone: string } | null> {
  const { data, error } = await supabase.rpc("get_table_by_token", { p_token: token });
  if (error) throw error;
  return data?.[0] ?? null;
}

interface CreateTableOrderParams {
  tableToken: string;
  customerName?: string;
  customerNotes?: string;
  items: CartItem[];
}

export async function createTableOrder(params: CreateTableOrderParams): Promise<number> {
  const { data, error } = await supabase.rpc("create_table_order", {
    p_table_token: params.tableToken,
    p_customer_name: params.customerName ?? "",
    p_customer_notes: params.customerNotes ?? "",
    p_items: params.items.map((item) => ({
      product_id: item.product.id,
      variant_id: item.variant.id,
      quantity: item.quantity,
      selected_options: Object.values(item.selectedOptions).flatMap((options) =>
        options.map((option) => ({ option_id: option.optionId, quantity: option.quantity })),
      ),
    })),
  });

  if (error) throw error;
  return data;
}
