import type { Metadata } from "next";

import { NosotrosPage } from "@/components/nosotros";

export const metadata: Metadata = {
  title: "Nosotros — Pollería & Fastfood Corrales",
  description: "Tres generaciones, un solo sabor. Conocé la historia de la familia Corrales desde 1987.",
};

export default function Page() {
  return <NosotrosPage />;
}
