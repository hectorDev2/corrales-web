import type { Metadata } from "next";

import { AdminUsersPage } from "@/components/admin/AdminUsersPage";

export const metadata: Metadata = {
  title: "Repartidores — Admin Corrales",
};

export default function Page() {
  return <AdminUsersPage />;
}
