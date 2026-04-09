export type AdminOrderStatus =
  | "pendiente"
  | "preparando"
  | "listo"
  | "en_camino"
  | "entregado"
  | "cancelado";

export interface AdminOrderItem {
  id: string;
  product_name: string;
  variant_label: string | null;
  quantity: number;
  unit_price: number;
}

export interface AdminOrder {
  id: string;
  order_number: number;
  status: AdminOrderStatus;
  delivery_type: "delivery" | "pickup";
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  customer_notes: string | null;
  customer_location_url: string | null;
  payment_method: "yape" | "cash" | "culqi";
  total: number;
  assigned_to: string | null;
  assigned_profile: { full_name: string } | null;
  created_at: string;
  items: AdminOrderItem[];
}

export interface DeliveryProfile {
  id: string;
  full_name: string;
}
