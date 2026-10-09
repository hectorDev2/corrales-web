"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { getProducts } from "@/lib/api/products";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/types/product";

const UPSELL_MAP: Record<string, string[]> = {
  "Pollo a la Brasa": ["Bebidas", "Extras"],
  Parrillas: ["Bebidas", "Extras"],
  Bebidas: ["Pollo a la Brasa", "Parrillas"],
};

function getSuggestedCategories(cartCategories: string[]): string[] {
  const suggested = new Set<string>();
  for (const cat of cartCategories) {
    const targets = UPSELL_MAP[cat] ?? ["Bebidas", "Extras"];
    targets.forEach((t) => suggested.add(t));
  }
  cartCategories.forEach((c) => suggested.delete(c));
  return [...suggested];
}

export function UpsellSection() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const productsViewportRef = useRef<HTMLDivElement>(null);
  const { addItem, items } = useCartStore();

  function scrollProducts(direction: -1 | 1) {
    productsViewportRef.current?.scrollBy({ left: direction * 280, behavior: "smooth" });
  }

  useEffect(() => {
    getProducts()
      .then(setAllProducts)
      .catch(() => {});
  }, []);

  const cartCategories = [...new Set(items.map((i) => i.product.category))];
  const suggestedCategories = getSuggestedCategories(cartCategories);
  const products = allProducts.filter(
    (p) => suggestedCategories.includes(p.category) && !items.some((i) => i.product.id === p.id),
  );

  if (products.length === 0) return null;

  return (
    <div className="shadow-card rounded-3xl bg-white p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-black tracking-tight">
        <span
          className="material-symbols-outlined text-primary text-base"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
        >
          restaurant
        </span>
        ¿Le sumamos algo más?
      </h3>

      <div className="relative">
        <div
          ref={productsViewportRef}
          data-testid="upsell-products-viewport"
          className="flex snap-x snap-mandatory scrollbar-none gap-3 overflow-x-auto pb-1"
        >
          {products.map((product) => {
            const variant = product.variants[0];
            if (!variant) return null;

            const inCart = items.some((i) => i.variant.id === variant.id);

            return (
              <div key={product.id} className="flex w-28 shrink-0 snap-start flex-col gap-1.5">
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#f0f0f0]">
                  {product.image.src ? (
                    <Image
                      src={product.image.src}
                      alt={product.image.alt}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span
                        className="material-symbols-outlined text-outline text-3xl"
                        style={{
                          fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24",
                        }}
                      >
                        image
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-on-surface line-clamp-2 text-[11px] leading-tight font-bold">
                  {product.name}
                </p>
                <p className="text-primary text-[11px] font-black">S/ {variant.price.toFixed(2)}</p>

                <button
                  type="button"
                  onClick={() => addItem(product, variant)}
                  className={`flex w-full items-center justify-center gap-1 rounded-xl py-1.5 text-[11px] font-bold transition-all active:scale-95 ${
                    inCart
                      ? "bg-[#e5e7eb] text-[#111827]"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-sm"
                    style={{ fontVariationSettings: "'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24" }}
                  >
                    {inCart ? "check" : "add"}
                  </span>
                  {inCart ? "Agregado" : "Agregar"}
                </button>
              </div>
            );
          })}
        </div>

        {products.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => scrollProducts(-1)}
              aria-label="Productos sugeridos anteriores"
              className="bg-primary/80 hover:bg-primary absolute top-14 left-1 z-10 flex size-9 items-center justify-center rounded-full text-white shadow-md transition-colors"
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                chevron_left
              </span>
            </button>
            <button
              type="button"
              onClick={() => scrollProducts(1)}
              aria-label="Productos sugeridos siguientes"
              className="bg-primary/80 hover:bg-primary absolute top-14 right-1 z-10 flex size-9 items-center justify-center rounded-full text-white shadow-md transition-colors"
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                chevron_right
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
