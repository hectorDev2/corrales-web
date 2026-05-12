"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { useCartStore } from "@/store/cart";
import type { Product, ProductVariant } from "@/types/product";

import { OptionGroupAccordion } from "./OptionGroupAccordion";

interface Props {
  product: Product;
}

type Selections = Record<string, Record<string, number>>;

function initSelections(groups: Product["optionGroups"]): Selections {
  if (!groups) return {};
  const result: Selections = {};
  for (const group of groups) {
    result[group.id] = {};
    for (const option of group.options) {
      result[group.id][option.id] = 0;
    }
  }
  return result;
}

function getOptionsPriceDelta(
  selections: Selections,
  groups: Product["optionGroups"],
): number {
  if (!groups) return 0;
  let total = 0;
  for (const group of groups) {
    for (const option of group.options) {
      const qty = selections[group.id]?.[option.id] ?? 0;
      total += option.priceDelta * qty;
    }
  }
  return total;
}

export function ProductDetailPage({ product }: Props) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0],
  );
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<Selections>(() =>
    initSelections(product.optionGroups),
  );
  const [openGroupId, setOpenGroupId] = useState<string | null>(
    product.optionGroups?.[0]?.id ?? null,
  );

  const { addItem, openDrawer } = useCartStore();

  const hasVariants = product.variants.length > 1;
  const hasOptionGroups = (product.optionGroups?.length ?? 0) > 0;
  const optionsDelta = getOptionsPriceDelta(selections, product.optionGroups);
  const unitPrice = selectedVariant.price + optionsDelta;
  const totalPrice = unitPrice * quantity;

  const handleOptionChange = useCallback(
    (groupId: string, optionId: string, delta: number) => {
      setSelections((prev) => {
        const group = product.optionGroups?.find((g) => g.id === groupId);
        if (!group) return prev;

        const current = { ...prev };

        if (group.selectionType === "single") {
          if (delta > 0) {
            const newGroup: Record<string, number> = {};
            for (const opt of group.options) {
              newGroup[opt.id] = opt.id === optionId ? 1 : 0;
            }
            current[groupId] = newGroup;
          } else {
            current[groupId] = { ...prev[groupId], [optionId]: 0 };
          }
        } else {
          const newQty = (prev[groupId]?.[optionId] ?? 0) + delta;
          current[groupId] = {
            ...prev[groupId],
            [optionId]: Math.max(0, newQty),
          };
        }

        return current;
      });
    },
    [product.optionGroups],
  );

  function handleAdd() {
    addItem(product, selectedVariant);
    toast.success(`${product.name} agregado al carrito`, {
      action: {
        label: "Ver carrito",
        onClick: () => openDrawer(),
      },
    });
  }

  function isAddDisabled(): string | null {
    if (!hasOptionGroups) return null;
    for (const group of product.optionGroups!) {
      const groupSelections = selections[group.id] ?? {};
      const selectedCount = Object.values(groupSelections).reduce(
        (s, q) => s + q,
        0,
      );
      if (group.selectionType === "single" && selectedCount === 0) continue;
      if (group.isRequired && selectedCount < group.minSelect) {
        return `Completá "${group.name}"`;
      }
    }
    return null;
  }

  const disabledReason = isAddDisabled();

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      {/* ── Header ──────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-sm border-b border-outline-variant/30">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-3">
          <Link
            href="/menu"
            className="flex items-center gap-1 text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              arrow_back
            </span>
            Menú
          </Link>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────── */}
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col lg:flex-row lg:gap-8 lg:px-4">
        {/* ── Left: Image ──────────────────────────────── */}
        <div className="relative w-full shrink-0 overflow-hidden bg-surface-container-high lg:sticky lg:top-16 lg:h-[calc(100dvh-8rem)] lg:w-[45%] lg:self-start">
          <div className="aspect-[4/3] w-full lg:h-full lg:aspect-auto">
            <Image
              src={product.image.src || "/images/404-image.png"}
              alt={product.image.alt}
              fill
              className="object-contain lg:object-cover"
              sizes="(max-width: 1024px) 100vw, 45vw"
              priority
            />
            {product.tag && (
              <div className="absolute top-3 left-3 z-10">
                <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-md uppercase tracking-widest">
                  {product.tag}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Content ──────────────────────────── */}
        <div className="flex flex-1 flex-col pb-40 lg:py-6">
          {/* Info */}
          <div className="px-4 lg:px-0">
            <h1 className="text-2xl font-black tracking-tight text-on-surface lg:text-3xl">
              {product.name}
            </h1>
            <p className="mt-2 text-sm text-on-surface-variant leading-relaxed lg:text-base">
              {product.description}
            </p>

            <p className="mt-3 text-3xl font-black text-primary lg:text-4xl">
              S/ {selectedVariant.price.toFixed(2)}
            </p>

            {/* Variants */}
            {hasVariants && (
              <section className="mt-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                  Elegí tu porción
                </h2>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant.id === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => {
                          setSelectedVariant(v);
                          setQuantity(1);
                        }}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-outline-variant text-on-surface-variant hover:border-primary/50"
                        }`}
                      >
                        <span>{v.label}</span>
                        <span className="font-normal text-xs opacity-70">
                          S/ {v.price.toFixed(2)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Option Groups */}
          {hasOptionGroups && (
            <section className="mt-6">
              <div className="px-4 mb-3 lg:px-0">
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Personaliza tu pedido
                </span>
              </div>
              <div className="mx-4 rounded-xl bg-white shadow-card lg:mx-0">
                {product.optionGroups!.map((group) => (
                  <OptionGroupAccordion
                    key={group.id}
                    group={group}
                    selections={selections[group.id] ?? {}}
                    onChange={(optionId, delta) =>
                      handleOptionChange(group.id, optionId, delta)
                    }
                    isOpen={openGroupId === group.id}
                    onToggle={() =>
                      setOpenGroupId((prev) =>
                        prev === group.id ? null : group.id,
                      )
                    }
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* ── Sticky bottom bar ────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-outline-variant/30 bg-white shadow-lg">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4">
          {/* Quantity */}
          <div className="flex shrink-0 items-center rounded-xl border border-outline-variant overflow-hidden">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="flex items-center justify-center w-10 h-10 text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-30"
              aria-label="Reducir cantidad"
            >
              <span
                className="material-symbols-outlined text-lg"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                remove
              </span>
            </button>
            <span className="w-10 text-center font-bold text-sm text-on-surface select-none">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(Math.min(99, quantity + 1))}
              disabled={quantity >= 99}
              className="flex items-center justify-center w-10 h-10 text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-30"
              aria-label="Aumentar cantidad"
            >
              <span
                className="material-symbols-outlined text-lg"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                add
              </span>
            </button>
          </div>

          {/* Add button */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={!!disabledReason}
            className={`flex-1 flex items-center justify-center gap-2 bg-primary text-on-primary font-black py-3 rounded-xl shadow-lg shadow-primary/30 transition-all text-base tracking-tight ${
              disabledReason
                ? "opacity-60 cursor-not-allowed"
                : "hover:scale-[1.02] active:scale-95"
            }`}
          >
            <span
              className="material-symbols-outlined text-lg"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              shopping_cart
            </span>
            {disabledReason
              ? disabledReason
              : `Agregar · S/ ${totalPrice.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
