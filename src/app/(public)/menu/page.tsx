import type { Metadata } from "next";

import { getCategories, getProducts } from "@/lib/api/products";
import { MenuPage } from "@/components/menu";

export const metadata: Metadata = {
  title: "Carta — Pollería & Fastfood Corrales",
  description: "Pollo a la brasa, parrillas, fast food y más. Pedí online.",
};

export default async function Page() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return <MenuPage products={products} categories={categories} />;
}
