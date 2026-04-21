"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { getProducts } from "@/lib/api/products";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/types/product";

const UPSELL_MAP: Record<string, string[]> = {
  "Pollo a la Brasa": ["Bebidas", "Extras"],
  "Parrillas":        ["Bebidas", "Extras"],
  "Bebidas":          ["Pollo a la Brasa", "Parrillas"],
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
  const { addItem, items } = useCartStore();

  useEffect(() => {
    getProducts().then(setAllProducts).catch(() => {});
  }, []);

  const cartCategories = [...new Set(items.map((i) => i.product.category))];
  const suggestedCategories = getSuggestedCategories(cartCategories);
  const products = allProducts.filter(
    (p) =>
      suggestedCategories.includes(p.category) &&
      !items.some((i) => i.product.id === p.id),
  );

  if (products.length === 0) return null;

  return (
    <div className="bg-surface-container-low p-5 rounded-3xl">
      <h3 className="text-sm font-black tracking-tight mb-3 flex items-center gap-2">
        <span
          className="material-symbols-outlined text-primary text-base"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
        >
          restaurant
        </span>
        ¿Le sumamos algo más?
      </h3>

      <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-none">
        {products.map((product) => {
          const variant = product.variants[0];
          if (!variant) return null;

          const inCart = items.some((i) => i.variant.id === variant.id);

          return (
            <div
              key={product.id}
              className="snap-start shrink-0 w-28 flex flex-col gap-1.5"
            >
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-surface-container">
                {product.image.src ? (
                  <Image
                    src={product.image.src}
                    alt={product.image.alt}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span
                      className="material-symbols-outlined text-outline text-3xl"
                      style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}
                    >
                      image
                    </span>
                  </div>
                )}
              </div>

              <p className="text-[11px] font-bold text-on-surface leading-tight line-clamp-2">
                {product.name}
              </p>
              <p className="text-[11px] text-primary font-black">
                S/ {variant.price.toFixed(2)}
              </p>

              <button
                type="button"
                onClick={() => addItem(product, variant)}
                className={`w-full py-1.5 rounded-xl text-[11px] font-bold transition-all active:scale-95 flex items-center justify-center gap-1 ${
                  inCart
                    ? "bg-tertiary-fixed text-on-tertiary-fixed"
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
    </div>
  );
}
