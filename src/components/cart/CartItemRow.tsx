"use client";

import Image from "next/image";

import { useCartStore } from "@/store/cart";
import type { CartItem } from "@/types/cart";

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeItem } = useCartStore();
  const { product, variant, quantity } = item;

  return (
    <div className="flex gap-4 items-center">
      {/* Thumbnail */}
      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-surface-container-low relative">
        <Image
          src={product.image.src}
          alt={product.image.alt}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-on-surface truncate pr-2">
            {product.name}
            {variant.label && (
              <span className="ml-1 text-xs font-normal text-on-surface-variant">
                ({variant.label})
              </span>
            )}
          </h3>
          <button
            onClick={() => removeItem(variant.id)}
            aria-label={`Eliminar ${product.name}`}
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              delete
            </span>
          </button>
        </div>

        <p className="text-sm text-on-surface-variant mb-3 line-clamp-1">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          {/* Stepper */}
          <div className="flex items-center bg-surface-container-low rounded-lg p-1">
            <button
              onClick={() => updateQuantity(variant.id, quantity - 1)}
              aria-label="Reducir cantidad"
              className="w-7 h-7 flex items-center justify-center rounded-md bg-surface-container-lowest text-primary shadow-sm active:scale-90 transition-transform"
            >
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                remove
              </span>
            </button>
            <span className="px-3 font-bold text-sm min-w-[2rem] text-center">
              {quantity}
            </span>
            <button
              onClick={() => updateQuantity(variant.id, quantity + 1)}
              aria-label="Aumentar cantidad"
              className="w-7 h-7 flex items-center justify-center rounded-md bg-primary-container text-on-primary shadow-sm active:scale-90 transition-transform"
            >
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                add
              </span>
            </button>
          </div>

          <span className="font-bold text-on-surface">
            S/ {(variant.price * quantity).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
