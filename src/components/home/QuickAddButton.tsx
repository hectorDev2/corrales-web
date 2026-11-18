"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { useCartStore } from "@/store/cart";
import type { Product, ProductVariant } from "@/types/product";

interface QuickAddButtonProps {
  product: Product;
  variant?: ProductVariant;
  className?: string;
  children?: ReactNode;
}

export function QuickAddButton({ product, variant, className = "", children }: QuickAddButtonProps) {
  const router = useRouter();
  const { addItem, openDrawer } = useCartStore();
  const selectedVariant = variant ?? product.variants[0];
  const isOutOfStock = !selectedVariant || selectedVariant.stock <= 0;

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation();

    // Si el producto tiene opciones configuradas, redirigir al detalle
    if (product.optionGroups && product.optionGroups.length > 0) {
      router.push(`/producto/${product.id}`);
      return;
    }

    if (!selectedVariant) return;
    addItem(product, selectedVariant);
    openDrawer();
  }

  return (
    <button
      onClick={handleAdd}
      disabled={isOutOfStock && !(product.optionGroups && product.optionGroups.length > 0)}
      className={className}
      aria-label="Agregar al carrito"
    >
      {children ?? (
        <span className="material-symbols-outlined">add</span>
      )}
    </button>
  );
}
