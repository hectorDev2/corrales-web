import type { Metadata } from "next";

import { MenuPage } from "@/components/menu";

export const metadata: Metadata = {
  title: "Carta — Pollería & Fastfood Corrales",
  description: "Pollo a la brasa, parrillas, fast food y más. Pedí online.",
};

export default function Page() {
  return <MenuPage />;
}
