"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", icon: "home", label: "Inicio" },
  { href: "/menu", icon: "restaurant_menu", label: "Carta" },
  { href: "/carrito", icon: "shopping_bag", label: "Carrito" },
  { href: "/perfil", icon: "person", label: "Perfil" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación principal"
      className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16 bg-white border-t border-[#eeeeee]"
    >
      {NAV_ITEMS.map(({ href, icon, label }) => {
        const isActive = pathname === href;
        return (
          <Link key={href} href={href}
            className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-all duration-200 ${
              isActive
                ? "bg-primary text-white rounded-full scale-110 shadow-lg shadow-primary/30"
                : "text-[#999999] hover:text-primary active:scale-95"
            }`}
          >
            <span className="material-symbols-outlined text-2xl"
              style={{ fontVariationSettings: isActive ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >{icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest mt-0.5">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
