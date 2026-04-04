import type { Metadata } from "next";

import { CheckoutForm } from "@/components/checkout";

export const metadata: Metadata = {
  title: "Finalizar Pedido — Pollería & Fastfood Corrales",
};

export default function Page() {
  return <CheckoutForm />;
}
