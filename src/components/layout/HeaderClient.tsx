"use client";

import Link from "next/link";

import { CartButton } from "./CartButton";

export function HeaderClient({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="flex items-center gap-1 md:gap-2 ml-auto">
      <CartButton />

      {isAdmin && (
        <Link
          href="/admin"
          className="flex items-center gap-1.5 bg-white/20 text-white text-xs font-black uppercase tracking-widest px-3 py-2 rounded-xl hover:bg-white/30 active:scale-95 transition-all"
        >
          <span
            className="material-symbols-outlined text-base"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            admin_panel_settings
          </span>
          <span className="max-md:hidden">Panel</span>
        </Link>
      )}
    </div>
  );
}
