import { supabase } from "@/lib/supabase";
import type { CartItem } from "@/types/cart";

interface CreateOrderParams {
  customerName: string;
  customerPhone: string;
  deliveryType: "delivery" | "pickup";
  customerAddress?: string;
  customerNotes?: string;
  customerLocationUrl?: string;
  paymentMethod: "yape" | "cash";
  items: CartItem[];
  total: number;
}

export async function createOrder(params: CreateOrderParams): Promise<string> {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      status: "pendiente",
      delivery_type: params.deliveryType,
      customer_name: params.customerName,
      customer_phone: params.customerPhone,
      customer_address: params.customerAddress ?? null,
      customer_notes: params.customerNotes ?? null,
      customer_location_url: params.customerLocationUrl ?? null,
      payment_method: params.paymentMethod,
      total: params.total,
    })
    .select("id")
    .single();

  if (orderError) throw orderError;

  const { error: itemsError } = await supabase.from("order_items").insert(
    params.items.map((item) => ({
      order_id: order.id,
      product_id: item.product.id,
      product_name: item.product.name,
      variant_id: item.variant.id,
      variant_label: item.variant.label,
      unit_price: item.variant.price,
      quantity: item.quantity,
    })),
  );

  if (itemsError) throw itemsError;

  return order.id;
}
