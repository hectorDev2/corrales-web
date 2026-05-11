import type { Metadata } from "next";

import { FacturacionPage } from "@/components/admin/FacturacionPage";

export const metadata: Metadata = {
  title: "Facturación Electrónica — Admin Corrales",
};

export default function Page() {
  return <FacturacionPage />;
}
