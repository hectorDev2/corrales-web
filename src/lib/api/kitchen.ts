import { supabase } from "@/lib/supabase";
import type { ProductStation } from "@/types/admin";

export type KitchenStatus = "pendiente" | "preparando" | "listo";

export interface KitchenItem {
  id: string;
  product_name: string;
  variant_label: string | null;
  quantity: number;
  station: ProductStation;
}

export interface KitchenOrder {
  id: string;
  order_number: number;
  status: KitchenStatus;
  delivery_type: "delivery" | "pickup" | "dine_in";
  customer_name: string;
  customer_notes: string | null;
  table_label: string | null;
  created_at: string;
  items: KitchenItem[];
}

/** Pedidos de cocina: nuevos, en preparación y listos (aún sin recoger), del más antiguo al más nuevo. */
export async function getKitchenOrders(): Promise<KitchenOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `id, order_number, status, delivery_type, customer_name, customer_notes, created_at,
       restaurant_tables ( label ),
       order_items ( id, product_name, variant_label, quantity, products ( station ) )`,
    )
    .in("status", ["pendiente", "preparando", "listo"])
    .order("created_at", { ascending: true });

  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    order_number: row.order_number,
    status: row.status as KitchenStatus,
    delivery_type: row.delivery_type as KitchenOrder["delivery_type"],
    customer_name: row.customer_name,
    customer_notes: row.customer_notes,
    table_label: (row.restaurant_tables as { label: string } | null)?.label ?? null,
    created_at: row.created_at,
    items: (
      (row.order_items as unknown as Array<{
        id: string;
        product_name: string;
        variant_label: string | null;
        quantity: number;
        products: { station: ProductStation } | null;
      }>) ?? []
    ).map(({ products, ...item }) => ({ ...item, station: products?.station ?? "cocina" })),
  }));
}

export async function advanceKitchenOrder(id: string, status: "preparando" | "listo"): Promise<void> {
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw error;
}
