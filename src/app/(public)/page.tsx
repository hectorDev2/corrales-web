import { HeroSection, HomeSlider } from "@/components/home";
import { MenuPage } from "@/components/menu";
import { getCategories, getProducts } from "@/lib/api/products";
import { getSlides } from "@/lib/api/slider";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; q?: string }>;
}) {
  const [slides, products, categories, { cat, q }] = await Promise.all([
    getSlides(),
    getProducts(),
    getCategories(),
    searchParams,
  ]);

  return (
    <>
      <HomeSlider slides={slides} />
      <HeroSection />
      <section id="menu" className="py-8">
        <MenuPage products={products} categories={categories} initialCategory={cat} initialQuery={q} />
      </section>
    </>
  );
}
