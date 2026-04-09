"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", icon: "home", label: "Inicio" },
  { href: "/menu", icon: "restaurant", label: "Carta" },
  { href: "/admin", icon: "receipt_long", label: "Pedidos" },
  { href: "/admin/productos", icon: "restaurant_menu", label: "Productos" },
] as const;

export function AdminBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-surface/90 backdrop-blur-xl shadow-[0_-8px_30px_rgba(89,65,61,0.12)] rounded-t-3xl">
      {NAV_ITEMS.map(({ href, icon, label }, i) => {
        const isActive =
          href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(href);
        return (
          <Link
            key={`${href}-${icon}`}
            href={href}
            className={`flex flex-col items-center justify-center p-2 transition-all ${
              isActive ? "bg-primary text-on-primary rounded-2xl shadow-lg shadow-primary/30 scale-110" : "text-outline hover:text-primary"
            }`}
          >
            <span
              className="material-symbols-outlined text-2xl"
              style={{
                fontVariationSettings: `'FILL' ${isActive ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
              }}
            >
              {icon}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest mt-1">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
