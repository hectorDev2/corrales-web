import type { Metadata } from "next";

import { AdminTablesPage } from "@/components/admin";

export const metadata: Metadata = {
  title: "Mesas — Pollería & Fastfood Corrales",
};

export default function Page() {
  return <AdminTablesPage />;
}
