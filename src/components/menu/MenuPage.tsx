"use client";

import { useMemo, useState } from "react";

import { ProductCardMini } from "@/components/products";
import { useCartStore } from "@/store/cart";
import type { Product, ProductVariant } from "@/types/product";

const CATEGORY_ICONS: Record<string, string> = {
  Todos: "apps",
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
  initialCategory?: string;
}

export function MenuPage({ products, categories, initialCategory }: MenuPageProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(() => {
    if (initialCategory && categories.includes(initialCategory)) return initialCategory;
    return "Todos";
  });
  const { addItem } = useCartStore();

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = activeCategory === "Todos" || p.category === activeCategory;
      const matchesSearch =
        search.trim() === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, search, activeCategory]);

  function handleAdd(product: Product, variant: ProductVariant) {
    addItem(product, variant);
  }

  return (
    <div className="mx-auto max-w-2xl px-4">
      {/* Sticky search bar */}
      <div className="bg-surface sticky top-[67px] z-40 py-4 md:top-[83px]">
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
            className="bg-surface-container-high focus:ring-primary text-on-surface placeholder:text-on-surface-variant/60 h-14 w-full rounded-xl border-none pr-4 pl-12 transition-all focus:ring-2 focus:outline-none"
          />
        </div>
      </div>

      {/* Sticky category tabs */}
      <div className="bg-surface/95 sticky top-[135px] z-40 -mx-4 mb-6 px-4 py-2 backdrop-blur-sm md:top-[151px]">
        <nav
          aria-label="Categorías"
          className="flex gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {["Todos", ...categories].map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 pb-1 text-sm font-medium tracking-tight whitespace-nowrap transition-colors ${
                  isActive
                    ? "text-primary border-primary-container border-b-2 font-bold"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                <span
                  className="material-symbols-outlined text-[16px]"
                  style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20" }}
                  aria-hidden="true"
                >
                  {CATEGORY_ICONS[cat] ?? "label"}
                </span>
                {cat}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Product grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 pb-8">
          {filtered.map((product) => (
            <ProductCardMini key={product.id} product={product} onAdd={handleAdd} />
          ))}
        </div>
      ) : (
        <div className="col-span-2 flex flex-col items-center justify-center py-16 text-center">
          <span
            className="material-symbols-outlined text-surface-container-highest mb-4 text-6xl"
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
