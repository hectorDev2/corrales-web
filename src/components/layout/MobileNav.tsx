"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Inicio", icon: "home" },
  { href: "/menu", label: "Menú", icon: "restaurant_menu" },
  { href: "/reservas", label: "Reservas", icon: "event_seat" },
  { href: "/nosotros", label: "Nosotros", icon: "groups" },
  { href: "/trabaja-con-nosotros", label: "trabaja con nosotros", icon: "work" },
] as const;

interface MobileNavProps {
  isAdmin?: boolean;
}

export function MobileNav({ isAdmin }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button */}
      <button
        type="button"
        aria-label="Abrir menú"
        onClick={() => setOpen(true)}
        className="flex items-center p-2 text-white transition-transform active:scale-90"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          fill="currentColor"
          viewBox="0 0 32 32"
          aria-label="menu"
          role="img"
          className="text-3xl"
        >
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M4 6h24v2H4zm0 18h24v2H4zm24-12H4v2h24zM4 18h24v2H4z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 z-[80] h-full w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#e5e5e5] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <span className="material-symbols-outlined text-lg text-white">
                local_fire_department
              </span>
            </div>
            <span className="text-primary text-base font-black tracking-tight uppercase">
              Corrales
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-on-surface-variant hover:bg-surface-container-high rounded-xl p-1.5 transition-colors active:scale-90"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <nav className="bg-gray-bg space-y-1 px-3 py-4" aria-label="Navegación móvil">
          {NAV_LINKS.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="text-on-surface-variant hover:text-primary flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold transition-colors hover:bg-white"
            >
              <span className="material-symbols-outlined text-xl">{icon}</span>
              {label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-3 rounded-2xl px-4 py-3 font-bold transition-colors"
            >
              <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
              Panel Admin
            </Link>
          )}
        </nav>
      </div>
    </>
  );
}
