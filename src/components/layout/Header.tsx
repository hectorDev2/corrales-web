import Link from "next/link";

import { MobileMenuButton } from "./MobileMenuButton";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/menu", label: "Menú" },
  { href: "/reservas", label: "Reservas" },
  { href: "/nosotros", label: "Nosotros" },
] as const;

export function Header() {
  return (
    <>
      {/* Top accent bar */}
      <div className="fixed top-0 left-0 w-full h-[3px] bg-primary-container z-[60]" />

      <header className="fixed top-[3px] w-full z-50 bg-[#fff8f2]/80 backdrop-blur-md shadow-[0_12px_40px_rgba(89,65,61,0.08)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 h-16 md:h-20">

          {/* Mobile: hamburger */}
          <MobileMenuButton />

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span
                className="material-symbols-outlined text-white text-2xl"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                local_fire_department
              </span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-black text-primary uppercase tracking-tight">
                Corrales
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70">
                Pollería &amp; Fastfood
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Navegación desktop">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200 text-sm tracking-wide"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              aria-label="Buscar"
              className="hidden md:flex p-2 text-on-surface-variant hover:text-primary transition-colors"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                search
              </span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
