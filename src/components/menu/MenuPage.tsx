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
  initialQuery?: string;
}

export function MenuPage({ products, categories, initialCategory, initialQuery }: MenuPageProps) {
  const [search, setSearch] = useState(initialQuery ?? "");
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

      {/* Sticky category tabs */}
      <div className="bg-background sticky top-[124px] z-40 -mx-4 mb-6 px-4 py-2">
        <nav
          aria-label="Categorías"
          className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {["Todos", ...categories].map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium whitespace-nowrap rounded-full transition-colors ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "bg-[#f5f5f5] text-on-surface-variant hover:bg-[#ebebeb]"
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
