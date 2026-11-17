import type { Metadata } from "next";

import { CheckoutEntry } from "@/components/checkout/CheckoutEntry";

export const metadata: Metadata = {
  title: "Finalizar Pedido — Pollería & Fastfood Corrales",
};

export default function Page() {
  return <CheckoutEntry />;
}
