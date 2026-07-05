import Link from "next/link";

import { KfcHeroSlider, KfcProductCarousel, LocationModal } from "@/components/home";
import { getCategories, getProducts } from "@/lib/api/products";
import { getSlides } from "@/lib/api/slider";

export default async function Home() {
  const [slides, products, categories] = await Promise.all([
    getSlides(),
    getProducts(),
    getCategories(),
  ]);

  const imageSlides = slides.filter((s) => s.type === "image" && s.image_url);

  return (
    <div className="max-w-[1280px] mx-auto overflow-hidden px-4 md:px-margin-desktop">
      {/* Hero Slider */}
      <KfcHeroSlider slides={imageSlides} />

      {/* Promos Grupales */}
      <KfcProductCarousel
        title="Promos Grupales 🔥"
        products={products.slice(0, 8)}
        href="/menu"
      />

      {/* Category Grid: Ahorrar nunca fue tan rico */}
      {categories.length > 0 && (
        <section className="py-8 bg-[#f5f5f5] -mx-4 md:-mx-margin-desktop px-4 md:px-margin-desktop">
          <h2 className="text-2xl font-bold mb-8">
            Ahorrar nunca fue tan rico
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.slice(0, 4).map((cat) => (
              <Link
                key={cat}
                href={`/menu?categoria=${encodeURIComponent(cat)}`}
                className="bg-white p-4 flex items-center justify-between border border-transparent hover:border-primary transition-all group"
              >
                <span className="text-xs font-bold tracking-wide">{cat}</span>
                <span className="material-symbols-outlined text-secondary group-hover:text-primary transition-colors">
                  chevron_right
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Lo más top del momento */}
      <KfcProductCarousel
        title="Lo más top del momento 🔥"
        products={products}
        href="/menu"
      />

      {/* App Download Banner */}
      <div className="-mx-4 md:-mx-margin-desktop mt-12 relative overflow-hidden">
        <img
          src="/banner-descargaapp_desktop.webp"
          alt="Descarga la app Corrales"
          className="w-full h-auto object-cover"
        />
      </div>

      {/* Location Modal */}
      <LocationModal />
    </div>
  );
}
