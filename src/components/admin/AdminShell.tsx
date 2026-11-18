"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { LogoutButton } from "@/components/auth/LogoutButton";

import { MOBILE_PRIMARY, NAV_GROUPS, type NavItem, isNavActive } from "./nav";

const ICON_STYLE = (filled: boolean) => ({
  fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
});

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="bg-primary text-on-primary flex size-9 items-center justify-center rounded-xl">
        <span className="material-symbols-outlined text-xl" style={ICON_STYLE(true)}>
          local_fire_department
        </span>
      </span>
      <div className="leading-none">
        <p className="text-on-surface text-base font-black tracking-tight uppercase">Corrales</p>
        <p className="text-on-surface-variant mt-0.5 text-[10px] font-bold tracking-widest uppercase">
          Administración
        </p>
      </div>
    </div>
  );
}

function SidebarLink({ item, active, onClick }: { item: NavItem; active: boolean; onClick?: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
        active
          ? "bg-primary text-on-primary shadow-primary/25 shadow-md"
          : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
      }`}
    >
      <span className="material-symbols-outlined text-[22px]" style={ICON_STYLE(active)}>
        {item.icon}
      </span>
      {item.label}
    </Link>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // El panel «Más» se abre para una ruta concreta: al navegar deja de coincidir y se cierra solo.
  const [openFor, setOpenFor] = useState<string | null>(null);
  const moreOpen = openFor === pathname;
  const setMoreOpen = (open: boolean) => setOpenFor(open ? pathname : null);

  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenFor(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moreOpen]);

  const primaryActive = MOBILE_PRIMARY.some((i) => isNavActive(pathname, i.href));

  return (
    <div className="bg-surface min-h-dvh">
      {/* Barra lateral (escritorio) */}
      <aside className="border-outline-variant/30 fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-white lg:flex">
        <div className="px-5 py-5">
          <Brand />
        </div>
        <nav aria-label="Administración" className="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1">
              <p className="text-outline px-3 pb-1 text-[10px] font-black tracking-widest uppercase">
                {group.title}
              </p>
              {group.items.map((item) => (
                <SidebarLink key={item.href} item={item} active={isNavActive(pathname, item.href)} />
              ))}
            </div>
          ))}
        </nav>
        <div className="border-outline-variant/30 flex items-center justify-between border-t px-5 py-4">
          <Link
            href="/"
            className="text-on-surface-variant hover:text-primary flex items-center gap-1.5 text-xs font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-base" style={ICON_STYLE(false)}>
              storefront
            </span>
            Ver sitio
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Cabecera (móvil / tablet) */}
      <header className="border-outline-variant/30 fixed top-0 z-40 w-full border-b bg-white/90 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Brand />
          <LogoutButton />
        </div>
      </header>

      <main className="min-h-dvh pt-16 pb-28 lg:pt-0 lg:pb-0 lg:pl-64">{children}</main>

      {/* Barra inferior (móvil / tablet) */}
      <nav
        aria-label="Navegación principal"
        className="border-outline-variant/30 fixed bottom-0 z-40 w-full rounded-t-3xl border-t bg-white/95 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl lg:hidden"
      >
        <div className="mx-auto grid max-w-lg grid-cols-4 gap-1 px-3 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {MOBILE_PRIMARY.map((item) => {
            const active = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center justify-center rounded-2xl py-2 transition-all ${
                  active ? "bg-primary text-on-primary shadow-primary/30 shadow-lg" : "text-outline"
                }`}
              >
                <span className="material-symbols-outlined text-2xl" style={ICON_STYLE(active)}>
                  {item.icon}
                </span>
                <span className="mt-0.5 text-[10px] font-bold tracking-wider uppercase">{item.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={moreOpen}
            className={`flex flex-col items-center justify-center rounded-2xl py-2 transition-all ${
              !primaryActive ? "bg-primary text-on-primary shadow-primary/30 shadow-lg" : "text-outline"
            }`}
          >
            <span className="material-symbols-outlined text-2xl" style={ICON_STYLE(!primaryActive)}>
              apps
            </span>
            <span className="mt-0.5 text-[10px] font-bold tracking-wider uppercase">Más</span>
          </button>
        </div>
      </nav>

      {/* Panel «Más» */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Todas las secciones">
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-white px-4 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl">
            <div className="bg-outline-variant mx-auto mb-4 h-1.5 w-10 rounded-full" aria-hidden="true" />
            <div className="space-y-5">
              {NAV_GROUPS.map((group) => (
                <section key={group.title}>
                  <h2 className="text-outline mb-2 px-1 text-[10px] font-black tracking-widest uppercase">
                    {group.title}
                  </h2>
                  <div className="grid grid-cols-3 gap-2">
                    {group.items.map((item) => {
                      const active = isNavActive(pathname, item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-3 text-center transition-all active:scale-95 ${
                            active ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface"
                          }`}
                        >
                          <span className="material-symbols-outlined text-2xl" style={ICON_STYLE(active)}>
                            {item.icon}
                          </span>
                          <span className="text-[11px] leading-tight font-bold">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}
              <div className="border-outline-variant/30 flex items-center justify-between border-t pt-4">
                <Link href="/" className="text-on-surface-variant flex items-center gap-1.5 text-sm font-bold">
                  <span className="material-symbols-outlined text-lg" style={ICON_STYLE(false)}>
                    storefront
                  </span>
                  Ver sitio
                </Link>
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
