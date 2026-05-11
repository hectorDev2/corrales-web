"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", icon: "receipt_long", label: "Pedidos" },
  { href: "/admin/productos", icon: "restaurant_menu", label: "Productos" },
  { href: "/admin/categorias", icon: "category", label: "Categorías" },
  { href: "/admin/facturacion", icon: "receipt", label: "Facturación" },
  { href: "/admin/slider", icon: "slideshow", label: "Slider" },
  { href: "/admin/usuarios", icon: "group", label: "Usuarios" },
  { href: "/admin/historial", icon: "history", label: "Historial" },
  { href: "/admin/reservas", icon: "event_seat", label: "Reservas" },
  { href: "/", icon: "home", label: "Inicio" },
] as const;

export function AdminBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-white/90 backdrop-blur-xl shadow-[0_-8px_30px_rgba(0,0,0,0.08)] rounded-t-3xl border-t border-[#e5e5e5]">
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none px-3 pb-6 pt-2 snap-x snap-mandatory">
      {NAV_ITEMS.map(({ href, icon, label }, i) => {
        const isActive =
          href === "/" || href === "/admin"
            ? pathname === href
            : pathname.startsWith(href);
        return (
          <Link
            key={`${href}-${icon}`}
            href={href}
            className={`snap-center shrink-0 flex flex-col items-center justify-center p-2 min-w-[64px] transition-all ${
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
      </div>
    </nav>
  );
}
