"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", icon: "home", label: "Inicio" },
  { href: "/menu", icon: "restaurant", label: "Carta" },
  { href: "/carrito", icon: "shopping_bag", label: "Carrito" },
  { href: "/perfil", icon: "person", label: "Perfil" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-[#fff8f2]/90 backdrop-blur-xl rounded-t-[2rem] shadow-[0_-8px_30px_rgba(89,65,61,0.12)]"
    >
      {NAV_ITEMS.map(({ href, icon, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center p-2 transition-all duration-200 ${
              isActive
                ? "bg-primary text-on-primary rounded-2xl shadow-lg shadow-primary/30 scale-110"
                : "text-stone-400 hover:text-primary active:scale-95"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontVariationSettings: isActive
                  ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
                  : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
              }}
            >
              {icon}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest mt-1">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
