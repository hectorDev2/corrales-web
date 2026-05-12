import type { Metadata } from "next";

import { AdminFooterPage } from "@/components/admin";
import { getAdminSettings } from "@/lib/api/settings";

export const metadata: Metadata = {
  title: "Footer — Admin Corrales",
};

export default async function Page() {
  const settings = await getAdminSettings();
  return <AdminFooterPage initial={settings} />;
}
