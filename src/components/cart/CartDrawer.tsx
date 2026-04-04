"use client";

import Link from "next/link";
import { useEffect } from "react";

import { useCartStore } from "@/store/cart";

import { CartItemRow } from "./CartItemRow";

export function CartDrawer() {
  const { isOpen, closeDrawer, items, subtotal, total, deliveryCost } = useCartStore();

  // Bloquear scroll del body cuando el drawer está abierto
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeDrawer();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeDrawer]);

  if (!isOpen) return null;

  const isEmpty = items.length === 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[70]"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Tu pedido"
        className="fixed top-0 right-0 h-full w-full max-w-[390px] bg-surface-container-lowest shadow-2xl z-[80] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/15">
          <h2 className="text-xl font-bold tracking-tight text-on-surface">Tu pedido</h2>
          <button
            onClick={closeDrawer}
            aria-label="Cerrar carrito"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors"
          >
            <span
              className="material-symbols-outlined text-on-surface-variant"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              close
            </span>
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isEmpty ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center mb-4">
                <span
                  className="material-symbols-outlined text-5xl text-outline"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                >
                  shopping_basket
                </span>
              </div>
              <h3 className="text-lg font-bold text-on-surface">Tu carrito está vacío</h3>
              <p className="text-sm text-on-surface-variant mt-2 max-w-[200px]">
                ¡Parece que aún no has elegido tu banquete de hoy!
              </p>
              <button
                onClick={closeDrawer}
                className="mt-6 px-6 py-3 bg-secondary-container text-on-secondary-container font-bold rounded-xl active:scale-95 transition-all"
              >
                Explorar la Carta
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <CartItemRow key={item.product.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isEmpty && (
          <footer className="bg-surface-container-low p-6 space-y-4 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Subtotal</span>
                <span className="text-on-surface font-medium">
                  S/ {subtotal().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Envío</span>
                <span className="text-on-surface font-medium">
                  S/ {deliveryCost.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-bold text-on-surface">Total</span>
                <span className="text-xl font-black text-primary">
                  S/ {total().toFixed(2)}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={closeDrawer}
              className="w-full h-14 bg-linear-to-r from-primary to-primary-container text-on-primary font-bold text-lg rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
            >
              Ir al Checkout
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                arrow_forward
              </span>
            </Link>

            <p className="text-[10px] text-center text-on-surface-variant uppercase tracking-widest font-bold">
              Tiempo estimado: 35–45 min
            </p>
          </footer>
        )}
      </aside>
    </>
  );
}
