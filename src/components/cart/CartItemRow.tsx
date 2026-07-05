"use client";

import Image from "next/image";

import { useCartStore } from "@/store/cart";
import type { CartItem } from "@/types/cart";
import { calcOptionsTotal } from "@/types/cart";

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeItem } = useCartStore();
  const { product, variant, quantity, selectedOptions } = item;
  const optionsExtra = calcOptionsTotal(product, selectedOptions);
  const unitPrice = variant.price + optionsExtra;

  interface OptionDisplay {
    groupName: string;
    optionName: string;
    qty: number;
    priceDelta: number;
  }

  const optionDisplays: OptionDisplay[] = [];

  if (product.optionGroups && Object.keys(selectedOptions).length > 0) {
    for (const group of product.optionGroups) {
      const sel = selectedOptions[group.id];
      if (!sel || sel.length === 0) continue;
      for (const s of sel) {
        const opt = group.options.find((o) => o.id === s.optionId);
        if (!opt) continue;
        optionDisplays.push({
          groupName: group.name,
          optionName: opt.name,
          qty: s.quantity,
          priceDelta: opt.priceDelta * s.quantity,
        });
      }
    }
  }

  const hasDeltaOptions = optionsExtra > 0;

  return (
    <div className="flex gap-4 items-center">
      {/* Thumbnail */}
      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-[#f5f5f5] relative">
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
          <div className="min-w-0 pr-2">
            <h3 className="font-bold text-[#111111] truncate">
              {product.name}
              {variant.label && (
                <span className="ml-1 text-xs font-normal text-on-surface-variant">
                  ({variant.label})
                </span>
              )}
            </h3>
            {optionDisplays.length > 0 && (
              <div className="mt-1 space-y-0.5">
                {optionDisplays.map((d, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-[11px] text-on-surface-variant leading-tight truncate pr-2">
                      {d.groupName}: {d.optionName}
                      {d.qty > 1 && ` x${d.qty}`}
                    </span>
                    {d.priceDelta > 0 && (
                      <span className="text-[11px] font-bold text-primary shrink-0">
                        +S/ {d.priceDelta.toFixed(2)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => removeItem(item.key)}
            aria-label={`Eliminar ${product.name}`}
            className="shrink-0 text-on-surface-variant hover:text-primary transition-colors"
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              delete
            </span>
          </button>
        </div>

        <div className="flex items-center justify-between mt-2">
          {/* Stepper */}
          <div className="flex items-center bg-[#f5f5f5] rounded-lg p-1">
            <button
              onClick={() => updateQuantity(item.key, quantity - 1)}
              aria-label="Reducir cantidad"
              className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-primary border border-[#e5e5e5] active:scale-90 transition-transform"
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
              onClick={() => updateQuantity(item.key, quantity + 1)}
              aria-label="Aumentar cantidad"
              className="w-7 h-7 flex items-center justify-center rounded-md bg-primary text-white active:scale-90 transition-transform"
            >
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                add
              </span>
            </button>
          </div>

          <span className="font-bold text-[#111111]">
            S/ {(unitPrice * quantity).toFixed(2)}
          </span>
        </div>
        {hasDeltaOptions && (
          <p className="text-[10px] text-on-surface-variant mt-0.5">
            S/ {variant.price.toFixed(2)} base + S/ {optionsExtra.toFixed(2)} extras
          </p>
        )}
      </div>
    </div>
  );
}
