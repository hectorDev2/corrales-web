import { supabase } from "@/lib/supabase";
import type { AdminOrder } from "@/types/admin";

const ORDER_QUERY = `
  id,
  order_number,
  status,
  delivery_type,
  customer_name,
  customer_phone,
  customer_address,
  customer_notes,
  customer_location_url,
  payment_method,
  total,
  assigned_to,
  created_at,
  profiles!orders_assigned_to_fkey ( full_name ),
  order_items ( id, product_name, variant_label, quantity, unit_price )
`;

function mapOrder(row: Record<string, unknown>): AdminOrder {
  return {
    ...(row as Omit<AdminOrder, "assigned_profile" | "items">),
    assigned_profile: row.profiles as { full_name: string } | null,
    items: (row.order_items as AdminOrder["items"]) ?? [],
  };
}

export async function getAvailableOrders(): Promise<AdminOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_QUERY)
    .eq("status", "listo")
    .eq("delivery_type", "delivery")
    .is("assigned_to", null)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data.map(mapOrder);
}

export async function getMyOrders(userId: string): Promise<AdminOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_QUERY)
    .eq("assigned_to", userId)
    .eq("status", "en_camino")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data.map(mapOrder);
}

export async function takeOrder(orderId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ assigned_to: userId, status: "en_camino" })
    .eq("id", orderId);

  if (error) throw error;
}

export async function markDelivered(orderId: string): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ status: "entregado" })
    .eq("id", orderId);

  if (error) throw error;
}
