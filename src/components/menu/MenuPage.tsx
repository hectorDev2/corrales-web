"use client";

import { useMemo, useState } from "react";

import { ProductCardMini } from "@/components/products";
import { CATEGORIES, PRODUCTS, type Category } from "@/data/products";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/types/product";

export function MenuPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | "Todos">("Todos");
  const { addItem, openDrawer } = useCartStore();

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchesCategory =
        activeCategory === "Todos" || p.category === activeCategory;
      const matchesSearch =
        search.trim() === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  function handleAdd(product: Product) {
    addItem(product);
    openDrawer();
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      {/* Sticky search bar */}
      <div className="sticky top-[67px] md:top-[83px] z-40 bg-surface py-4">
        <div className="relative">
          <span
            className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Busca tu antojo..."
            className="w-full h-14 pl-12 pr-4 bg-surface-container-high border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-on-surface placeholder:text-on-surface-variant/60 transition-all"
          />
        </div>
      </div>

      {/* Sticky category tabs */}
      <div className="sticky top-[135px] md:top-[151px] z-40 bg-surface/95 backdrop-blur-sm -mx-4 px-4 py-2 mb-6">
        <nav
          aria-label="Categorías"
          className="flex gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {(["Todos", ...CATEGORIES] as const).map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat as Category | "Todos")}
                className={`whitespace-nowrap pb-1 text-sm tracking-tight transition-colors font-medium ${
                  isActive
                    ? "text-primary font-bold border-b-2 border-primary-container"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
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
            <ProductCardMini
              key={product.id}
              product={product}
              onAdd={handleAdd}
            />
          ))}
        </div>
      ) : (
        <div className="col-span-2 py-16 flex flex-col items-center justify-center text-center">
          <span
            className="material-symbols-outlined text-6xl text-surface-container-highest mb-4"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            restaurant_menu
          </span>
          <p className="text-on-surface-variant font-medium">Sin resultados</p>
          <p className="text-xs text-on-surface-variant/60 mt-1">
            Prueba con otra palabra clave
          </p>
        </div>
      )}
    </div>
  );
}
