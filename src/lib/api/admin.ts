import { supabase } from "@/lib/supabase";
import type { AdminOrder, AdminOrderStatus, DeliveryProfile } from "@/types/admin";

export async function getActiveOrders(): Promise<AdminOrder[]> {
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
      order_items ( id, product_name, variant_label, quantity, unit_price ),
      invoices ( id, series, number, sunat_status, pdf_url )
    `)
    .not("status", "in", '("entregado","cancelado")')
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map((row) => ({
    ...row,
    assigned_profile: row.profiles as { full_name: string } | null,
    items: (row.order_items as AdminOrder["items"]) ?? [],
    invoice: ((row.invoices as AdminOrder["invoice"][]) ?? [])[0] ?? null,
  }));
}

export async function updateOrderStatus(
  orderId: string,
  status: AdminOrderStatus,
): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) throw error;
}

export async function assignDelivery(
  orderId: string,
  deliveryUserId: string,
): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ assigned_to: deliveryUserId, status: "en_camino" })
    .eq("id", orderId);

  if (error) throw error;
}

export async function getOrderHistory(
  from: string,
  to: string,
  statuses: AdminOrderStatus[],
): Promise<AdminOrder[]> {
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
      order_items ( id, product_name, variant_label, quantity, unit_price ),
      invoices ( id, series, number, sunat_status, pdf_url )
    `)
    .in("status", statuses)
    .gte("created_at", `${from}T00:00:00`)
    .lte("created_at", `${to}T23:59:59`)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map((row) => ({
    ...row,
    assigned_profile: row.profiles as { full_name: string } | null,
    items: (row.order_items as AdminOrder["items"]) ?? [],
    invoice: ((row.invoices as AdminOrder["invoice"][]) ?? [])[0] ?? null,
  }));
}

export async function getDeliveryProfiles(): Promise<DeliveryProfile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "delivery")
    .eq("is_active", true);

  if (error) throw error;
  return data;
}
