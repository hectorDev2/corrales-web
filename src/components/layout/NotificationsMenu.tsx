"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useRef, useState } from "react";

const ITEMS = [
  { href: "/promociones", icon: "sell", title: "Promociones vigentes", text: "Descubre las ofertas del momento." },
  { href: "/menu", icon: "restaurant_menu", title: "Hacer un pedido", text: "Mira la carta y pide online." },
  { href: "/reservas", icon: "event_seat", title: "Reservar una mesa", text: "Asegura tu lugar en Corrales." },
  { href: "/institucional/formularios/encuesta", icon: "rate_review", title: "Cuéntanos tu experiencia", text: "Tu opinión nos ayuda a mejorar." },
] as const;

/**
 * Campana de avisos: abre un panel con accesos rápidos.
 * En escritorio es un menú bajo la campana; en móvil, una hoja desde abajo.
 */
export function NotificationsMenu({
  children,
  buttonClassName,
  label = "Avisos",
  "data-tour": dataTour,
}: {
  children: ReactNode;
  buttonClassName: string;
  label?: string;
  "data-tour"?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="dialog"
        data-tour={dataTour}
        onClick={() => setOpen((v) => !v)}
        className={buttonClassName}
      >
        {children}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[110] bg-black/30 md:hidden" aria-hidden="true" onClick={() => setOpen(false)} />
          <div
            role="dialog"
            aria-label="Avisos"
            className="fixed inset-x-0 bottom-0 z-[120] max-h-[80dvh] overflow-y-auto rounded-t-3xl bg-white p-4 pb-6 text-[#1b1b1b] shadow-2xl md:absolute md:inset-x-auto md:top-full md:right-0 md:bottom-auto md:mt-3 md:w-80 md:rounded-2xl md:pb-4"
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-base font-black">Avisos</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar avisos"
                className="flex size-9 items-center justify-center rounded-full bg-black/5 md:hidden"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <ul className="space-y-1">
              {ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-14 items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-black/5 active:bg-black/10"
                  >
                    <span className="material-symbols-outlined bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full text-xl">
                      {item.icon}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold">{item.title}</span>
                      <span className="block text-xs text-black/60">{item.text}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
