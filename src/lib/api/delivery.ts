import { supabase } from "@/lib/supabase";
import type { AdminOrder } from "@/types/admin";

export async function getMyOrders(userId: string): Promise<AdminOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(`
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
    `)
    .eq("assigned_to", userId)
    .eq("status", "en_camino")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map((row) => ({
    ...row,
    assigned_profile: row.profiles as { full_name: string } | null,
    items: (row.order_items as AdminOrder["items"]) ?? [],
  }));
}

export async function markDelivered(orderId: string): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ status: "entregado" })
    .eq("id", orderId);

  if (error) throw error;
}
