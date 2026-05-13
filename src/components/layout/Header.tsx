import Link from "next/link";

import { createSupabaseServerClient } from "@/lib/supabase-server";

import { HeaderClient } from "./HeaderClient";
import { MobileNav } from "./MobileNav";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/menu", label: "Menú" },
  { href: "/reservas", label: "Reservas" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/trabaja-con-nosotros", label: "Trabaja con nosotros" },
] as const;

export async function Header() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
      <header className="bg-primary fixed top-0 z-50 h-[72px] w-full shadow-md">
        <div className="mx-auto flex h-full max-w-7xl items-center gap-4 px-4">
          {/* Left: hamburger + logo */}
          <div className="flex shrink-0 items-center gap-2">
            <MobileNav isAdmin={isAdmin} />
            <Link href="/" className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-3xl text-white"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                local_fire_department
              </span>
              <div className="flex flex-col leading-none max-md:hidden">
                <span className="text-xl font-black tracking-tight text-white uppercase">
                  Corrales
                </span>
                <span className="text-[10px] font-bold tracking-widest text-white/70 uppercase">
                  Pollería &amp; Fastfood
                </span>
              </div>
            </Link>
          </div>

          {/* Spacer + desktop nav + actions */}
          <div className="ml-auto hidden items-center gap-6 lg:flex">
            <nav className="flex items-center gap-6" aria-label="Navegación desktop">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm font-medium tracking-wide whitespace-nowrap text-white/80 transition-colors duration-200 hover:text-white"
                >
                  {label}
                </Link>
              ))}
            </nav>
            <HeaderClient isAdmin={isAdmin} />
          </div>
        </div>
      </header>
    </>
  );
}
