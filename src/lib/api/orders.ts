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

// Retorna el order_number para mostrárselo al cliente
export async function createOrder(params: CreateOrderParams): Promise<number> {
  const { data, error } = await supabase.rpc("create_order", {
    p_delivery_type: params.deliveryType,
    p_customer_name: params.customerName,
    p_customer_phone: params.customerPhone,
    p_customer_address: (params.customerAddress ?? null) as string,
    p_customer_notes: (params.customerNotes ?? null) as string,
    p_customer_location_url: (params.customerLocationUrl ?? null) as string,
    p_payment_method: params.paymentMethod,
    p_total: params.total,
    p_items: params.items.map((item) => ({
      product_id: item.product.id,
      product_name: item.product.name,
      variant_id: item.variant.id,
      variant_label: item.variant.label,
      unit_price: item.variant.price,
      quantity: item.quantity,
    })),
  });

  if (error) throw error;
  return data;
}
