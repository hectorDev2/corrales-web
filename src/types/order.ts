export type OrderStatus = "pendiente" | "preparando" | "listo";
export type DeliveryType = "delivery" | "recojo";

export interface OrderItem {
  name: string;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: number;
  time: string;
  status: OrderStatus;
  deliveryType: DeliveryType;
  customer: {
    name: string;
    phone: string;
    address?: string;
    notes?: string;
  };
  items: OrderItem[];
  total: number;
}
