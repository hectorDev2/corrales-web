import type { Metadata } from "next";

import { CorporateSalesPage } from "@/components/corporate-sales";

export const metadata: Metadata = {
  title: "Ventas corporativas — Corrales",
  description: "Organizá tus eventos corporativos con el sabor de la familia Corrales.",
};

export default function Page() {
  return <CorporateSalesPage />;
}
