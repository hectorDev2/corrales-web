import { supabase } from "@/lib/supabase";
import type { CartItem } from "@/types/cart";

interface CreateOrderParams {
  customerName: string;
  customerPhone: string;
  deliveryType: "delivery" | "pickup";
  customerAddress?: string;
  customerNotes?: string;
  customerLocationUrl?: string;
  paymentMethod: "yape" | "cash" | "culqi";
  items: CartItem[];
  total: number;
}

function serializeOrderItems(items: CartItem[]) {
  return items.map((item) => ({
    product_id: item.product.id,
    variant_id: item.variant.id,
    quantity: item.quantity,
    selected_options: Object.values(item.selectedOptions).flatMap((options) =>
      options.map((option) => ({
        option_id: option.optionId,
        quantity: option.quantity,
      })),
    ),
  }));
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
    p_items: serializeOrderItems(params.items),
  });

  if (error) throw error;
  return data;
}
