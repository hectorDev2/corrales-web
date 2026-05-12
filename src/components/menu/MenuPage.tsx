"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { ProductCardMini } from "@/components/products";
import { useCartStore } from "@/store/cart";
import type { Product, ProductVariant } from "@/types/product";

function AutoScrollCarousel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

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

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={ref}
      className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory"
    >
      {children}
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
  const { addItem } = useCartStore();

  const filteredBySearch = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
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
            className="h-10 w-full rounded-full bg-white border border-[#dddddd] pr-4 pl-10 text-sm text-on-surface placeholder:text-on-surface-variant/60 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
        </div>
      </div>

      {/* Category carousels */}
      {categorySections.length > 0 ? (
        <div className="space-y-8">
          {categorySections.map((section) => (
            <section key={section.name}>
              <h2 className="flex items-center gap-2 mb-3">
                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                >
                  {section.icon}
                </span>
                <span className="text-lg font-black tracking-tight text-on-surface">
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
            className="material-symbols-outlined text-[#e5e5e5] mb-4 text-6xl"
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
