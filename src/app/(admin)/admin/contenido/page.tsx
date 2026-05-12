import type { Metadata } from "next";

import { AdminContentPage } from "@/components/admin";
import { getAdminSettings } from "@/lib/api/settings";
import { getAdminSlides } from "@/lib/api/slider";

export const metadata: Metadata = {
  title: "Contenido — Admin Corrales",
};

export default async function Page() {
  const [initialSlides, initialSettings] = await Promise.all([
    getAdminSlides(),
    getAdminSettings(),
  ]);

  return <AdminContentPage initialSlides={initialSlides} initialSettings={initialSettings} />;
}
