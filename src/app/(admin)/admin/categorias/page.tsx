import type { Metadata } from "next";

import { AdminCategoriesPage } from "@/components/admin/AdminCategoriesPage";

export const metadata: Metadata = {
  title: "Categorías — Admin Corrales",
};

export default function Page() {
  return <AdminCategoriesPage />;
}
