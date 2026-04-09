import type { Metadata } from "next";

import { AdminProductsPage } from "@/components/admin";

export const metadata: Metadata = {
  title: "Productos — Pollería & Fastfood Corrales",
};

export default function Page() {
  return <AdminProductsPage />;
}
