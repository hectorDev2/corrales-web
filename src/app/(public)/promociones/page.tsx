import { PromotionsPage } from "@/components/promotions";
import { getProducts } from "@/lib/api/products";

export const metadata = {
  title: "Promociones — Pollería & Fastfood Corrales",
  description: "Encontrá las promociones vigentes de Corrales.",
};

export default async function Page({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
  const { tag } = await searchParams;
  const allProducts = await getProducts();
  const tags = Array.from(
    new Set(
      allProducts
        .map((product) => product.tag?.trim())
        .filter((productTag): productTag is string => Boolean(productTag)),
    ),
  );
  const activeTag = tag?.trim();
  const products = allProducts.filter(
    (product) =>
      product.tag &&
      (!activeTag || product.tag.toLocaleLowerCase() === activeTag.toLocaleLowerCase()),
  );

  return <PromotionsPage products={products} tags={tags} activeTag={activeTag} />;
}
