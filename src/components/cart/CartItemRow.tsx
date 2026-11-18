"use client";

import Image from "next/image";
import Link from "next/link";

import { useCartStore } from "@/store/cart";
import type { CartItem } from "@/types/cart";
import { calcOptionsTotal } from "@/types/cart";

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, closeDrawer } = useCartStore();
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
    <article className="rounded-xl bg-white p-4 shadow-sm sm:px-8 sm:py-5">
      <div className="flex justify-end">
        <Link
          href={`/producto/${product.id}`}
          onClick={closeDrawer}
          className="focus-visible:outline-primary flex items-center gap-1 text-xs font-bold text-[#111111] hover:underline focus-visible:outline-2"
        >
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
            edit
          </span>
          Editar
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 sm:flex-nowrap">
        <div className="relative size-16 shrink-0 overflow-hidden sm:size-[72px]">
          <Image
            src={product.image.src}
            alt={product.image.alt}
            fill
            className="object-contain"
            sizes="72px"
          />
        </div>

        <h3 className="line-clamp-2 min-w-0 flex-1 basis-40 leading-snug font-bold text-[#111111] sm:text-lg">
          {product.name}
          {variant.label && (
            <span className="text-on-surface-variant ml-1 text-xs font-normal">
              ({variant.label})
            </span>
          )}
        </h3>

        <p className="w-28 shrink-0 text-sm leading-tight text-[#111111] sm:w-36">
          <span className="block text-xs font-bold">Precio</span>
          <span className="text-base font-black">S/ {(unitPrice * quantity).toFixed(2)}</span>
          {quantity > 1 && (
            <span className="block text-xs font-bold text-green-600">
              unidad S/ {unitPrice.toFixed(2)}
            </span>
          )}
        </p>

        <div className="ml-auto flex items-center rounded-lg border border-[#d5d5d5] bg-white p-1">
          <button
            type="button"
            onClick={() => updateQuantity(item.key, quantity - 1)}
            aria-label={quantity === 1 ? `Eliminar ${product.name}` : "Reducir cantidad"}
            className="bg-primary flex size-8 items-center justify-center rounded-full text-white transition-transform active:scale-90"
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              aria-hidden="true"
            >
              {quantity === 1 ? "delete" : "remove"}
            </span>
          </button>
          <span className="min-w-10 px-2 text-center text-base font-bold">{quantity}</span>
          <button
            type="button"
            onClick={() => updateQuantity(item.key, quantity + 1)}
            aria-label="Aumentar cantidad"
            className="bg-primary flex size-8 items-center justify-center rounded-full text-white transition-transform active:scale-90"
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              aria-hidden="true"
            >
              add
            </span>
          </button>
        </div>
      </div>

      {optionDisplays.length > 0 && (
        <details className="group mt-4 border-t border-[#ececec] pt-3">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-[#111111] [&::-webkit-details-marker]:hidden">
            Ver detalle del pedido
            <span
              className="material-symbols-outlined transition-transform group-open:rotate-180"
              aria-hidden="true"
            >
              keyboard_arrow_down
            </span>
          </summary>
          <div className="mt-3 space-y-1.5">
            {optionDisplays.map((display) => (
              <div
                key={`${display.groupName}:${display.optionName}:${display.qty}`}
                className="flex items-start justify-between gap-3 text-xs"
              >
                <span className="text-on-surface-variant">
                  {display.groupName}: {display.optionName}
                  {display.qty > 1 && ` x${display.qty}`}
                </span>
                {display.priceDelta > 0 && (
                  <span className="text-primary shrink-0 font-bold">
                    +S/ {display.priceDelta.toFixed(2)}
                  </span>
                )}
              </div>
            ))}
            {hasDeltaOptions && (
              <p className="text-on-surface-variant pt-1 text-[10px]">
                S/ {variant.price.toFixed(2)} base + S/ {optionsExtra.toFixed(2)} extras
              </p>
            )}
          </div>
        </details>
      )}
    </article>
  );
}
