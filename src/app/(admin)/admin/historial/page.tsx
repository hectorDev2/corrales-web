import type { Metadata } from "next";

import { AdminOrderHistoryPage } from "@/components/admin";

export const metadata: Metadata = {
  title: "Historial — Pollería & Fastfood Corrales",
};

export default function Page() {
  return <AdminOrderHistoryPage />;
}
