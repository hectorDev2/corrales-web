"use client";

import Image from "next/image";

import type { Product, ProductVariant } from "@/types/product";

interface ProductCardProps {
  product: Product;
  onAdd?: (product: Product, variant: ProductVariant) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <article className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-[0_12px_40px_rgba(89,65,61,0.08)] hover:-translate-y-1 transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={product.image.src}
          alt={product.image.alt}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(min-width: 768px) 50vw, 100vw"
        />
        {product.tag && (
          <div className="absolute top-4 left-4">
            <span className="bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
              {product.tag}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-primary tracking-tight mb-2">
          {product.name}
        </h3>
        <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
          {product.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-primary-container text-xl font-extrabold">
            S/ {product.variants[0]?.price.toFixed(2)}
          </span>
          <button
            onClick={() => onAdd?.(product, product.variants[0])}
            className="bg-linear-to-br from-primary to-primary-container text-on-primary px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 active:scale-95 transition-transform"
          >
            Agregar
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              add_shopping_cart
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
