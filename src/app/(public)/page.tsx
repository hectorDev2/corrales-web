import { Suspense } from "react";

import {
  AppDownloadBanner,
  HomeLoadingSkeleton,
  KfcHeroSlider,
  KfcProductCarousel,
  LocationModal,
  SavingsCategories,
} from "@/components/home";
import { getProducts } from "@/lib/api/products";
import { getHomeSavingsSettings } from "@/lib/api/settings";
import { getSlides } from "@/lib/api/slider";

export default function Home() {
  return (
    <Suspense fallback={<HomeLoadingSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  const [slides, products, homeSavings] = await Promise.all([
    getSlides(),
    getProducts(),
    getHomeSavingsSettings(),
  ]);

  const visibleSlides = slides.filter((slide) => slide.type === "custom" || slide.image_url);

  return (
    <>
      <KfcHeroSlider slides={visibleSlides} />
      <div className="md:px-margin-desktop mx-auto max-w-[1280px] overflow-hidden px-4">
        {/* Hero Slider */}

        {/* Promos Grupales */}
        <KfcProductCarousel
          title="Promos Grupales 🔥"
          products={products.slice(0, 8)}
          href="/menu"
        />

        {/* Category Grid: Ahorrar nunca fue tan rico */}
        <SavingsCategories settings={homeSavings} />

        {/* Lo más top del momento */}
        <KfcProductCarousel title="Lo más top del momento 🔥" products={products} href="/menu" />

        {/* App Download Banner */}
        <AppDownloadBanner />

        {/* Location Modal */}
        <LocationModal />
      </div>
    </>
  );
}
