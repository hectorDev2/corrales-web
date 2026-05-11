"use client";

import Image from "next/image";
import { useState } from "react";

import type { Product, ProductVariant } from "@/types/product";

interface ProductCardMiniProps {
  product: Product;
  onAdd?: (product: Product, variant: ProductVariant) => void;
}

export function ProductCardMini({ product, onAdd }: ProductCardMiniProps) {
  const hasVariants = product.variants.length > 1;
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0],
  );

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation();
    onAdd?.(product, selectedVariant);
  }

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Agregar ${product.name} al carrito`}
      onClick={() => onAdd?.(product, selectedVariant)}
      onKeyDown={(e) => e.key === "Enter" && onAdd?.(product, selectedVariant)}
      className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-card flex flex-col active:scale-95 transition-transform duration-200"
    >
      {/* Image */}
      <div className="relative h-32 w-full overflow-hidden">
        <Image
          src={product.image.src || "/images/404-image.png"}
          alt={product.image.alt}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(min-width: 768px) 25vw, 50vw"
        />
        {product.tag && (
          <div className="absolute top-2 right-2">
            <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-widest">
              {product.tag}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-sm font-bold text-[#111111] line-clamp-1">
          {product.name}
        </h3>
        <p className="text-[10px] text-on-surface-variant mt-1 line-clamp-2 leading-tight">
          {product.description}
        </p>

        {/* Variant selector */}
        {hasVariants && (
          <div className="flex flex-wrap gap-1 mt-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                onClick={(e) => { e.stopPropagation(); setSelectedVariant(v); }}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                  selectedVariant.id === v.id
                    ? "bg-primary text-white border-primary"
                    : "border-[#dddddd] text-on-surface-variant hover:border-primary"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto pt-3 flex justify-between items-center">
          <span className="font-extrabold text-[#111111] text-lg leading-none">
            S/ {selectedVariant.price.toFixed(2)}
          </span>
          <button
            onClick={handleAdd}
            aria-label={`Agregar ${product.name} al carrito`}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white hover:bg-primary/90 active:scale-90 transition-all"
          >
            <span
              className="material-symbols-outlined text-base"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              add
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
