"use client";

import { useEffect, useState } from "react";

import { useCartStore } from "@/store/cart";

export function CartButton() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { openDrawer, totalItems } = useCartStore();
  const count = mounted ? totalItems() : 0;

  return (
    <button
      aria-label="Carrito de compras"
      onClick={openDrawer}
      className="relative p-2 text-white transition-transform active:scale-90"
    >
      <span
        className="material-symbols-outlined text-2xl md:text-3xl"
        style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
      >
        shopping_cart
      </span>
      {count > 0 && (
        <span className="absolute top-1 right-1 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-primary shadow-md">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
