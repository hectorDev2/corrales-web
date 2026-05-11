import Link from "next/link";

import { createSupabaseServerClient } from "@/lib/supabase-server";

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
      <header className="fixed top-0 w-full z-50 bg-primary h-[72px] shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 h-full">
          {/* Mobile: hamburger + drawer */}
          <MobileNav isAdmin={isAdmin} />

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-white text-3xl"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                local_fire_department
              </span>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-black text-white uppercase tracking-tight">
                  Corrales
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                  Pollería &amp; Fastfood
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Navegación desktop">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-white/80 font-medium hover:text-white transition-colors duration-200 text-sm tracking-wide"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              aria-label="Buscar"
              className="hidden md:flex p-2 text-white/80 hover:text-white transition-colors"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                search
              </span>
            </button>

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
                Panel
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
