"use client";

import Link from "next/link";
import { useState } from "react";

import { CartButton } from "./CartButton";
import { HeaderSearch } from "./HeaderSearch";

export function HeaderClient({ isAdmin }: { isAdmin: boolean }) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-1 md:gap-2 ml-auto">
        {/* Mobile search toggle */}
        <button
          aria-label="Buscar"
          onClick={() => setSearchOpen(!searchOpen)}
          className="md:hidden p-2 text-white/80 hover:text-white transition-colors"
        >
          <span
            className="material-symbols-outlined text-2xl"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            {searchOpen ? "close" : "search"}
          </span>
        </button>

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

      {/* Mobile search bar below header */}
      {searchOpen && (
        <div className="md:hidden fixed top-[72px] left-0 w-full z-40 bg-primary pb-4 px-4 pt-2 shadow-md">
          <HeaderSearch />
        </div>
      )}
    </>
  );
}
