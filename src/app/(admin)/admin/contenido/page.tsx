import type { Metadata } from "next";

import { AdminContentPage } from "@/components/admin";
import { getActiveCategoryOptions } from "@/lib/api/products";
import { getAdminSettings } from "@/lib/api/settings";
import { getAdminSlides } from "@/lib/api/slider";

export const metadata: Metadata = {
  title: "Contenido — Admin Corrales",
};

export default async function Page() {
  const [initialSlides, initialSettings, categories] = await Promise.all([
    getAdminSlides(),
    getAdminSettings(),
    getActiveCategoryOptions(),
  ]);

  return (
    <AdminContentPage
      initialSlides={initialSlides}
      initialSettings={initialSettings}
      categories={categories}
    />
  );
}
