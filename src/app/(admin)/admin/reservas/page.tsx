import type { Metadata } from "next";

import { AdminReservationsPage } from "@/components/admin";

export const metadata: Metadata = {
  title: "Reservas — Pollería & Fastfood Corrales",
};

export default function Page() {
  return <AdminReservationsPage />;
}
