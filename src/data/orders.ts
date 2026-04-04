import type { Order } from "@/types/order";

export const MOCK_ORDERS: Order[] = [
  {
    id: "ord-2409",
    orderNumber: 2409,
    time: "14:20",
    status: "preparando",
    deliveryType: "delivery",
    customer: {
      name: "Ricardo Mendoza",
      phone: "987 654 321",
      address: "Av. Los Próceres 452, Int. 3, Chorrillos",
    },
    items: [
      { name: "1/2 Pollo + Papas + Ensalada", quantity: 1 },
      { name: "Gaseosa Inca Kola 1.5L", quantity: 2 },
      { name: "Porción Extra de Cremas", quantity: 1 },
    ],
    total: 84.5,
  },
  {
    id: "ord-2410",
    orderNumber: 2410,
    time: "14:35",
    status: "pendiente",
    deliveryType: "recojo",
    customer: {
      name: "Sandra Villar",
      phone: "912 334 556",
      notes: "Cliente vendrá al local en 15 min",
    },
    items: [{ name: "Pollo entero (Solo)", quantity: 1 }],
    total: 42.0,
  },
  {
    id: "ord-2411",
    orderNumber: 2411,
    time: "14:10",
    status: "listo",
    deliveryType: "delivery",
    customer: {
      name: "Carlos Ríos",
      phone: "999 111 222",
      address: "Jr. Miraflores 89, Barranco",
    },
    items: [
      { name: "Pollo entero + Papas grandes", quantity: 1 },
      { name: "Chicha morada 1L", quantity: 1 },
    ],
    total: 68.0,
  },
];
