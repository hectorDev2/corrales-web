"use client";

import Image from "next/image";

import type { Product } from "@/types/product";

interface ProductCardMiniProps {
  product: Product;
  onAdd?: (product: Product) => void;
}

export function ProductCardMini({ product, onAdd }: ProductCardMiniProps) {
  return (
    <article className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(89,65,61,0.05)] flex flex-col active:scale-95 transition-transform duration-200">
      {/* Image */}
      <div className="relative h-32 w-full overflow-hidden">
        <Image
          src={product.image.src}
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
        <div className="mt-auto pt-3 flex justify-between items-center">
          <span className="text-primary font-bold">
            S/ {product.price.toFixed(2)}
          </span>
          <button
            onClick={() => onAdd?.(product)}
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
