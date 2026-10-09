"use client";

import Link from "next/link";
import { useEffect } from "react";
import { createPortal } from "react-dom";

import { useCartStore } from "@/store/cart";

import { CartItemRow } from "./CartItemRow";

export function CartDrawer() {
  const { isOpen, closeDrawer, clearCart, items, subtotal, total, deliveryCost } = useCartStore();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && closeDrawer();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeDrawer]);

  if (!isOpen || typeof document === "undefined") return null;

  const isEmpty = items.length === 0;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-sm"
        onClick={closeDrawer}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Tu pedido"
        className="fixed top-0 right-0 z-[130] flex h-full w-full max-w-none flex-col overflow-hidden bg-[#f4f4f4] shadow-2xl sm:max-w-[390px]"
      >
        <header className="bg-primary relative grid min-h-16 shrink-0 grid-cols-[3rem_1fr_3rem] items-center px-3 text-white sm:min-h-18">
          <button
            onClick={closeDrawer}
            aria-label="Cerrar carrito"
            className="flex size-11 items-center justify-center rounded-full transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <span className="material-symbols-outlined text-[30px]" aria-hidden="true">
              arrow_back
            </span>
          </button>
          <h2 className="text-center text-xl font-black tracking-tight">Carrito</h2>
          <span aria-hidden="true" />
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-5">
          {isEmpty ? (
            <div className="flex min-h-full flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex size-24 items-center justify-center rounded-full bg-white">
                <span
                  className="material-symbols-outlined text-5xl text-[#d1d5db]"
                  aria-hidden="true"
                >
                  shopping_basket
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#111111]">Tu carrito está vacío</h3>
              <p className="text-on-surface-variant mt-2 max-w-[230px] text-sm">
                ¡Parece que aún no has elegido tu banquete de hoy!
              </p>
              <Link
                href="/menu"
                onClick={closeDrawer}
                className="bg-primary mt-6 rounded-xl px-6 py-3 font-bold text-white transition-transform active:scale-95"
              >
                Explorar la carta
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              <button
                type="button"
                onClick={clearCart}
                aria-label="Vaciar carrito"
                className="text-primary focus-visible:outline-primary flex min-h-11 items-center gap-2 px-2 font-bold transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
                  delete
                </span>
                Vaciar carrito
              </button>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <CartItemRow key={`${item.key}:${index}`} item={item} />
                ))}
              </div>

              <section
                aria-label="Resumen de pedido"
                className="rounded-xl bg-white px-4 py-5 shadow-sm"
              >
                <h3 className="border-b border-[#e5e5e5] pb-3 text-base font-black text-[#111111]">
                  Resumen de Pedido
                </h3>
                <div className="space-y-3 pt-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Subtotal</span>
                    <span className="font-medium text-[#111111]">S/ {subtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Delivery</span>
                    <span className="font-medium text-[#111111]">S/ {deliveryCost.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#e5e5e5] pt-4">
                    <span className="text-lg font-black text-[#111111]">Total</span>
                    <span className="text-xl font-black text-[#111111]">
                      S/ {total().toFixed(2)}
                    </span>
                  </div>
                </div>
              </section>

              <Link
                href="/menu"
                onClick={closeDrawer}
                className="text-primary flex min-h-14 w-full items-center justify-center font-bold underline-offset-4 transition-opacity hover:underline hover:opacity-80"
              >
                Seguir comprando
              </Link>
            </div>
          )}
        </div>

        {!isEmpty && (
          <footer className="shrink-0 border-t border-[#e5e5e5] bg-white px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-6px_18px_rgba(0,0,0,0.06)]">
            <Link
              href="/checkout"
              onClick={closeDrawer}
              className="bg-primary shadow-primary/20 flex h-14 w-full items-center justify-center rounded-xl text-lg font-bold text-white shadow-lg transition-transform active:scale-[0.98]"
            >
              Ir a pagar
            </Link>
          </footer>
        )}
      </aside>
    </>,
    document.body,
  );
}
