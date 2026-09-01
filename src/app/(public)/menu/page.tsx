import { MenuPage } from "@/components/menu";
import {
  getCategories,
  getProducts,
  getProductsByCategory,
  getProductsByTag,
  searchProducts,
} from "@/lib/api/products";

export const metadata = {
  title: "Carta — Pollería & Fastfood Corrales",
  description: "Pollo a la brasa, parrillas, fast food y más. Pedí online.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string; tag?: string }>;
}) {
  const { q, categoria, tag } = await searchParams;

  let products;
  let categories;

  if (tag?.trim()) {
    const [results, cats] = await Promise.all([getProductsByTag(tag.trim()), getCategories()]);
    products = results;
    categories = cats;
  } else if (categoria?.trim()) {
    const [results, cats] = await Promise.all([
      getProductsByCategory(categoria.trim()),
      getCategories(),
    ]);
    products = results;
    categories = cats;
  } else if (q?.trim()) {
    const [results, cats] = await Promise.all([searchProducts(q.trim()), getCategories()]);
    products = results;
    categories = cats;
  } else {
    const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
    products = prods;
    categories = cats;
  }

  return (
    <MenuPage
      products={products}
      categories={categories}
      activeCategory={categoria?.trim()}
      query={q?.trim()}
      tag={tag?.trim()}
    />
  );
}
