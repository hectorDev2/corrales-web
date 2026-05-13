"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { ProductCardMini } from "@/components/products";
import { useCartStore } from "@/store/cart";
import type { Product, ProductVariant } from "@/types/product";

function AutoScrollCarousel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  function updateButtons(el: HTMLDivElement) {
    setCanScrollPrev(el.scrollLeft > 4);
    setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function handleScroll() {
      if (el) updateButtons(el);
    }

    if (el) updateButtons(el);

    const interval = setInterval(() => {
      const cardWidth = el.children[0]?.getBoundingClientRect().width ?? 188;
      const gap = 12;
      const step = cardWidth + gap;

      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 30000);

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearInterval(interval);
      el.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function scroll(direction: "prev" | "next") {
    const el = ref.current;
    if (!el) return;
    const cardWidth = el.children[0]?.getBoundingClientRect().width ?? 188;
    const gap = 12;
    const step = cardWidth + gap;
    el.scrollBy({ left: direction === "next" ? step : -step, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={ref}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {canScrollPrev && (
        <button
          onClick={() => scroll("prev")}
          className="absolute left-0 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-r-xl !bg-primary/60 px-1.5 py-5 !h-auto !w-auto !text-white backdrop-blur-xs transition-all active:scale-95 md:!bg-primary/80 md:px-2 md:py-7"
          aria-label="Anterior"
        >
          <svg className="rotate-180" width="8" height="14" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.38296 20.0762C0.111788 19.805 0.111788 19.3654 0.38296 19.0942L9.19758 10.2796L0.38296 1.46497C0.111788 1.19379 0.111788 0.754138 0.38296 0.482966C0.654131 0.211794 1.09379 0.211794 1.36496 0.482966L10.4341 9.55214C10.8359 9.9539 10.8359 10.6053 10.4341 11.007L1.36496 20.0762C1.09379 20.3474 0.654131 20.3474 0.38296 20.0762Z" fill="currentColor" />
          </svg>
        </button>
      )}

      {canScrollNext && (
        <button
          onClick={() => scroll("next")}
          className="absolute right-0 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-l-xl !bg-primary/60 px-1.5 py-5 !h-auto !w-auto !text-white backdrop-blur-xs transition-all active:scale-95 md:!bg-primary/80 md:px-2 md:py-7"
          aria-label="Siguiente"
        >
          <svg width="8" height="14" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.38296 20.0762C0.111788 19.805 0.111788 19.3654 0.38296 19.0942L9.19758 10.2796L0.38296 1.46497C0.111788 1.19379 0.111788 0.754138 0.38296 0.482966C0.654131 0.211794 1.09379 0.211794 1.36496 0.482966L10.4341 9.55214C10.8359 9.9539 10.8359 10.6053 10.4341 11.007L1.36496 20.0762C1.09379 20.3474 0.654131 20.3474 0.38296 20.0762Z" fill="currentColor" />
          </svg>
        </button>
      )}
    </div>
  );
}

const CATEGORY_ICONS: Record<string, string> = {
  "Pollo a la Brasa": "outdoor_grill",
  Parrillas: "kebab_dining",
  Acompañamiento: "yakitori",
  Bebidas: "local_bar",
  Broaster: "outdoor_grill",
  Burger: "lunch_dining",
  Cóctails: "nightlife",
  Extras: "add_circle",
  Postres: "icecream",
  Salchipapas: "fastfood",
  Tragos: "wine_bar",
};

interface MenuPageProps {
  products: Product[];
  categories: string[];
  initialQuery?: string;
}

export function MenuPage({ products, categories, initialQuery }: MenuPageProps) {
  const [search, setSearch] = useState(initialQuery ?? "");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { addItem } = useCartStore();

  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const navRef = useRef<HTMLDivElement>(null);

  const filteredBySearch = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
    );
  }, [products, search]);

  const categorySections = useMemo(() => {
    return categories
      .map((cat) => ({
        name: cat,
        icon: CATEGORY_ICONS[cat] ?? "label",
        items: filteredBySearch.filter((p) => p.category === cat),
      }))
      .filter((s) => s.items.length > 0);
  }, [categories, filteredBySearch]);

  function handleAdd(product: Product, variant: ProductVariant) {
    addItem(product, variant);
  }

  function scrollToCategory(name: string) {
    const el = sectionRefs.current.get(name);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 180;
      window.scrollTo({ top, behavior: "smooth" });
    }
    const activeButton = navRef.current?.querySelector<HTMLButtonElement>(
      `[data-category="${name}"]`,
    );
    activeButton?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  function setSectionRef(name: string, el: HTMLDivElement | null) {
    if (el) {
      sectionRefs.current.set(name, el);
    } else {
      sectionRefs.current.delete(name);
    }
  }

  useEffect(() => {
    let ticking = false;

    function handleScroll() {
      if (ticking) return;
      window.requestAnimationFrame(() => {
        const stickyBottom = 180;
        let active: string | null = null;

        for (const [name, el] of sectionRefs.current.entries()) {
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          if (rect.top <= stickyBottom) {
            active = name;
          }
        }

        if (!active && categorySections.length > 0) {
          active = categorySections[0].name;
        }

        setActiveCategory(active);
        ticking = false;
      });
      ticking = true;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [categorySections]);

  useEffect(() => {
    if (!activeCategory || !navRef.current) return;
    const button = navRef.current.querySelector<HTMLButtonElement>(
      `[data-category="${activeCategory}"]`,
    );
    if (!button) return;

    const container = navRef.current;
    const cr = container.getBoundingClientRect();
    const br = button.getBoundingClientRect();

    const isFullyVisible = br.left >= cr.left && br.right <= cr.right;
    if (isFullyVisible) return;

    container.scrollBy({
      left: br.left - cr.left - cr.width / 2 + br.width / 2,
      behavior: "smooth",
    });
  }, [activeCategory]);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-8">
      {/* Sticky search bar */}
      <div className="bg-background sticky top-[72px] z-40 py-3">
        <div className="relative">
          <span
            className="material-symbols-outlined text-on-surface-variant absolute top-1/2 left-4 -translate-y-1/2"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Busca tu antojo..."
            className="text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary focus:ring-primary/20 h-10 w-full rounded-full border border-[#dddddd] bg-white pr-4 pl-10 text-sm transition-all focus:ring-2 focus:outline-none"
          />
        </div>
      </div>

      {/* Category nav */}
      {categorySections.length > 1 && (
        <div className="bg-background sticky top-[135px] z-30 pb-2">
          <div
            ref={navRef}
            className="-mx-4 flex snap-x snap-mandatory scroll-pl-4 gap-2 overflow-x-auto overflow-y-hidden pr-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {categorySections.map((section) => (
              <button
                key={section.name}
                data-category={section.name}
                onClick={() => scrollToCategory(section.name)}
                className={`flex shrink-0 snap-start items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition-all active:scale-95 ${
                  activeCategory === section.name
                    ? "bg-primary border-primary text-white"
                    : "text-on-surface-variant border-[#dddddd] bg-white"
                }`}
              >
                <span
                  className="material-symbols-outlined text-base !leading-none"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20" }}
                >
                  {section.icon}
                </span>
                {section.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category carousels */}
      {categorySections.length > 0 ? (
        <div className="space-y-8">
          {categorySections.map((section) => (
            <section key={section.name} ref={(el) => setSectionRef(section.name, el)}>
              <h2 className="mb-3 flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                >
                  {section.icon}
                </span>
                <span className="text-on-surface text-lg font-black tracking-tight">
                  {section.name}
                </span>
              </h2>
              <AutoScrollCarousel>
                {section.items.map((product) => (
                  <div key={product.id} className="w-44 shrink-0 snap-start">
                    <ProductCardMini product={product} onAdd={handleAdd} />
                  </div>
                ))}
              </AutoScrollCarousel>
            </section>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span
            className="material-symbols-outlined mb-4 text-6xl text-[#e5e5e5]"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            restaurant_menu
          </span>
          <p className="text-on-surface-variant font-medium">Sin resultados</p>
          <p className="text-on-surface-variant/60 mt-1 text-xs">Prueba con otra palabra clave</p>
        </div>
      )}
    </div>
  );
}
