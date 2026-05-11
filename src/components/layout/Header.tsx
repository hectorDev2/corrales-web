import Link from "next/link";

import { createSupabaseServerClient } from "@/lib/supabase-server";

import { HeaderClient } from "./HeaderClient";
import { HeaderSearch } from "./HeaderSearch";
import { MobileNav } from "./MobileNav";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/menu", label: "Menú" },
  { href: "/reservas", label: "Reservas" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/trabaja-con-nosotros", label: "Únete" },
] as const;

export async function Header() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
  }

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-primary shadow-md h-[72px]">
        <div className="max-w-7xl mx-auto h-full flex items-center gap-4 px-4">
          {/* Left: hamburger + logo */}
          <div className="flex items-center gap-2 shrink-0">
            <MobileNav isAdmin={isAdmin} />
            <Link href="/" className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-white text-3xl"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                local_fire_department
              </span>
              <div className="flex flex-col leading-none max-md:hidden">
                <span className="text-xl font-black text-white uppercase tracking-tight">
                  Corrales
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                  Pollería &amp; Fastfood
                </span>
              </div>
            </Link>
          </div>

          {/* Center: search (desktop) */}
          <div className="hidden md:block flex-1 max-w-md">
            <HeaderSearch />
          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6" aria-label="Navegación desktop">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-white/80 font-medium hover:text-white transition-colors duration-200 text-sm tracking-wide whitespace-nowrap"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right: actions (client component) */}
          <HeaderClient isAdmin={isAdmin} />
        </div>
      </header>
    </>
  );
}
