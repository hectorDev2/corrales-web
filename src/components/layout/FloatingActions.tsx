"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useCartStore } from "@/store/cart";

const WHATSAPP_NUMBER = "51999999999";

function isStoreOpen() {
  const now = new Date();
  const min = now.getHours() * 60 + now.getMinutes();
  return min >= 660 && min < 1320; // 11:00 - 22:00
}

export function FloatingActions() {
  const pathname = usePathname();
  const { openDrawer, totalItems } = useCartStore();
  const [storeOpen, setStoreOpen] = useState(false);
  const count = totalItems();
  const prevCount = useRef(count);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setStoreOpen(isStoreOpen());
  }, []);

  useEffect(() => {
    if (count > prevCount.current && btnRef.current) {
      const btn = btnRef.current;
      btn.style.animation = "none";
      void btn.offsetWidth;
      btn.style.animation = "cart-pop 0.6s cubic-bezier(0.36,0.07,0.19,0.97) both";
    }
    prevCount.current = count;
  }, [count]);

  // Ocultar fuera del horario de atención
  if (!storeOpen) return null;

  // Ocultar en la página de detalle de producto
  if (pathname === "/" || pathname.startsWith("/producto/")) return null;

  return (
    <div className="fixed right-4 bottom-6 max-md:bottom-[88px] z-50 flex flex-col items-end gap-3">
      {/* WhatsApp */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/40 transition-transform hover:scale-105 active:scale-90"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-8 w-8"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>

      {/* Carrito */}
      <button
        ref={btnRef}
        aria-label="Carrito de compras"
        onClick={openDrawer}
        className="bg-primary text-white shadow-primary/40 relative flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-90"
      >
        <span
          className="material-symbols-outlined text-[30px]"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          aria-hidden="true"
        >
          shopping_cart
        </span>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-primary shadow-md ring-2 ring-primary/20">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>
      {/* Proceder con la compra */}
      {count > 0 && (
        <Link
          href="/checkout"
          className="bg-primary text-white shadow-primary/40 flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          Proceder con la compra
          <span
            className="material-symbols-outlined text-base"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 600, 'GRAD' 0, 'opsz' 24" }}
            aria-hidden="true"
          >
            arrow_forward
          </span>
        </Link>
      )}
    </div>
  );
}
