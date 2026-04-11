import type { Metadata } from "next";

import { AdminSliderPage } from "@/components/admin";
import { getAdminSlides } from "@/lib/api/slider";

export const metadata: Metadata = {
  title: "Slider — Admin Corrales",
};

export default async function Page() {
  const slides = await getAdminSlides();
  return <AdminSliderPage initialSlides={slides} />;
}
