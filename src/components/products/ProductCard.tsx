"use client";

import Image from "next/image";

import type { Product, ProductVariant } from "@/types/product";

interface ProductCardProps {
  product: Product;
  onAdd?: (product: Product, variant: ProductVariant) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <article className="group bg-white rounded-xl overflow-hidden shadow-card hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-300">
      {/* Image: 1:1 aspect ratio */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.image.src}
          alt={product.image.alt}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(min-width: 768px) 50vw, 100vw"
        />
        {product.tag && (
          <div className="absolute top-3 left-3">
            <span className="bg-primary text-white px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">
              {product.tag}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-lg font-bold text-[#111111] tracking-tight mb-1">
          {product.name}
        </h3>
        <p className="text-on-surface-variant text-xs mb-3 leading-relaxed line-clamp-2">
          {product.description}
        </p>

        {/* Price and add button */}
        <div className="flex items-center justify-between">
          <span className="text-[28px] font-extrabold text-[#111111] leading-none">
            S/ {product.variants[0]?.price.toFixed(2)}
          </span>
          <button
            onClick={() => onAdd?.(product, product.variants[0])}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#dddddd] bg-white text-primary hover:bg-primary hover:text-white hover:border-primary active:scale-90 transition-all"
            aria-label={`Agregar ${product.name} al carrito`}
          >
            <span
              className="material-symbols-outlined text-lg"
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
