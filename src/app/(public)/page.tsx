import { HeroSection, HomeSlider } from "@/components/home";
import { MenuPage } from "@/components/menu";
import { getCategories, getProducts } from "@/lib/api/products";
import { getSlides } from "@/lib/api/slider";

export default async function Home() {
  const [slides, products, categories] = await Promise.all([
    getSlides(),
    getProducts(),
    getCategories(),
  ]);

  return (
    <>
      <HomeSlider slides={slides} />
      <HeroSection />
      <section id="menu" className="py-8">
        <MenuPage products={products} categories={categories} />
      </section>
    </>
  );
}
