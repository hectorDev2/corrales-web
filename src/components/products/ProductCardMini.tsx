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

  return (
    <article className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(89,65,61,0.05)] flex flex-col active:scale-95 transition-transform duration-200">
      {/* Image */}
      <div className="relative h-32 w-full overflow-hidden">
        <Image
          src={product.image.src || "/placeholder.jpg"}
          alt={product.image.alt}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(min-width: 768px) 25vw, 50vw"
        />
        {product.tag && (
          <div className="absolute top-2 right-2">
            <span className="bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">
              {product.tag}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-sm font-bold text-on-surface line-clamp-1">
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
                onClick={() => setSelectedVariant(v)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                  selectedVariant.id === v.id
                    ? "bg-primary text-on-primary border-primary"
                    : "border-outline-variant text-on-surface-variant hover:border-primary"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto pt-3 flex justify-between items-center">
          <span className="text-primary font-bold">
            S/ {selectedVariant.price.toFixed(2)}
          </span>
          <button
            onClick={() => onAdd?.(product, selectedVariant)}
            aria-label={`Agregar ${product.name} al carrito`}
            className="bg-primary-container text-on-primary p-1.5 rounded-lg shadow-lg shadow-primary/20 active:scale-90 transition-transform"
          >
            <span
              className="material-symbols-outlined text-sm"
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
