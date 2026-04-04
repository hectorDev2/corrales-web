import type { Metadata } from "next";

import { AdminPage } from "@/components/admin";

export const metadata: Metadata = {
  title: "Admin — Pollería & Fastfood Corrales",
};

export default function Page() {
  return <AdminPage />;
}
