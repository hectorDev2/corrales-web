import { notFound } from "next/navigation";

import { MenuPage } from "@/components/menu";
import { getActiveCategoryOptions, getProductsByCategory } from "@/lib/api/products";
import { getHomeSavingsSettings } from "@/lib/api/settings";
import { getCategoryForCartaSlug, slugifyCategoryName } from "@/lib/menu/category-routes";

export const metadata = {
  title: "Carta — Pollería & Fastfood Corrales",
  description: "Pollo a la brasa, parrillas, fast food y más. Pedí online.",
};

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [categoryOptions, homeSavings] = await Promise.all([
    getActiveCategoryOptions(),
    getHomeSavingsSettings(),
  ]);
  const activeTiles = homeSavings.tiles
    .filter((tile) => tile.isActive)
    .sort((first, second) => first.sortOrder - second.sortOrder);
  const tile = activeTiles.find((candidate) => slugifyCategoryName(candidate.label) === slug);

  if (tile) {
    const target =
      categoryOptions.find((category) => category.id === tile.targetCategoryId) ??
      categoryOptions.find((category) => category.name === tile.targetCategory);
    if (!target) notFound();

    const products = await getProductsByCategory(target.name);
    return (
      <MenuPage
        products={products}
        categories={categoryOptions.map((option) => option.name)}
        activeCategory={tile.label}
        categoryNavigation={activeTiles.map((item) => ({
          label: item.label,
          href: item.href,
          slug: slugifyCategoryName(item.label),
        }))}
      />
    );
  }

  const category = getCategoryForCartaSlug(slug, categoryOptions);
  if (!category) notFound();

  const products = await getProductsByCategory(category);
  const categories = categoryOptions.map((option) => option.name);

  return <MenuPage products={products} categories={categories} activeCategory={category} />;
}
