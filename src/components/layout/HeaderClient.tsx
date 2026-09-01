"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useCartStore } from "@/store/cart";

interface HeaderClientProps {
  isAdmin: boolean;
  mobileOnly?: boolean;
}

export function HeaderClient({ isAdmin, mobileOnly }: HeaderClientProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { openDrawer, totalItems, subtotal } = useCartStore();
  const count = mounted ? totalItems() : 0;
  const cartTotal = mounted ? subtotal() : 0;

  // Mobile: solo carrito con badge
  if (mobileOnly) {
    return (
      <button
        type="button"
        onClick={openDrawer}
        aria-label={`Carrito, ${count} productos`}
        className="flex items-center gap-1.5 text-white"
      >
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.25em" height="1.25em" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9.75 20.25a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m8.25-1.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m4.473-11.8-2.404 8.652a2.256 2.256 0 0 1-2.163 1.648H8.64a2.255 2.255 0 0 1-2.171-1.648L3.18 3.75H1.5a.75.75 0 0 1 0-1.5h2.25a.75.75 0 0 1 .723.55L5.362 6H21.75a.75.75 0 0 1 .723.95m-1.71.55H5.779l2.138 7.7a.75.75 0 0 0 .723.55h9.266a.75.75 0 0 0 .723-.55z" />
          </svg>
          {count > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-white text-[10px] font-bold text-primary leading-none px-1 shadow-md">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </div>
      </button>
    );
  }

  // Desktop: cart + notifications + admin
  return (
    <div className="flex items-center gap-3 text-white ml-auto">
      {/* Cart */}
      <button
        type="button"
        onClick={openDrawer}
        aria-label={`Carrito, ${count} productos, total S/ ${cartTotal.toFixed(2)}`}
        className="flex items-center gap-1.5 text-white hover:text-white/80 transition-colors"
      >
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.25em" height="1.25em" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9.75 20.25a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m8.25-1.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m4.473-11.8-2.404 8.652a2.256 2.256 0 0 1-2.163 1.648H8.64a2.255 2.255 0 0 1-2.171-1.648L3.18 3.75H1.5a.75.75 0 0 1 0-1.5h2.25a.75.75 0 0 1 .723.55L5.362 6H21.75a.75.75 0 0 1 .723.95m-1.71.55H5.779l2.138 7.7a.75.75 0 0 0 .723.55h9.266a.75.75 0 0 0 .723-.55z" />
          </svg>
          {count > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-white text-[10px] font-bold text-primary leading-none px-1 shadow-md">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </div>
        <span className="hidden md:inline text-xs font-bold tracking-wide whitespace-nowrap">
          S/ {cartTotal.toFixed(2)}
        </span>
      </button>

      {/* Notifications */}
      <button
        type="button"
        aria-label="Notificaciones"
        className="relative text-white hover:text-white/80 transition-colors"
      >
        <span className="relative inline-flex">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.25em" height="1.25em" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" fillOpacity="0.01" d="M0 0h24v24H0z" style={{ mixBlendMode: "multiply" }} />
            <path d="m21.53 14.47-2.03-2.03V9.75a7.51 7.51 0 0 0-6.75-7.462V.75h-1.5v1.538A7.51 7.51 0 0 0 4.5 9.75v2.69l-2.03 2.03a.75.75 0 0 0-.22.53v2.25A.75.75 0 0 0 3 18h5.25v.583a3.864 3.864 0 0 0 3.375 3.899 3.754 3.754 0 0 0 4.125-3.732V18H21a.75.75 0 0 0 .75-.75V15a.75.75 0 0 0-.22-.53m-7.28 4.28a2.25 2.25 0 0 1-4.5 0V18h4.5zm6-2.25H3.75v-1.19l2.03-2.03a.75.75 0 0 0 .22-.53v-3a6 6 0 1 1 12 0v3c0 .199.08.39.22.53l2.03 2.03z" />
          </svg>
        </span>
      </button>

      {/* Admin */}
      {isAdmin && (
        <Link
          href="/admin"
          className="flex items-center gap-1 rounded-xl bg-white/20 px-2.5 py-1.5 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-white/30 active:scale-95"
        >
          <span
            className="material-symbols-outlined text-sm"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            admin_panel_settings
          </span>
          <span className="max-md:hidden">Admin</span>
        </Link>
      )}
    </div>
  );
}
