"use client";

import Link from "next/link";
import { useEffect } from "react";

import { useCartStore } from "@/store/cart";
import { CartItemRow } from "./CartItemRow";

export function CartDrawer() {
  const { isOpen, closeDrawer, items, subtotal, total, deliveryCost } = useCartStore();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeDrawer();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeDrawer]);

  if (!isOpen) return null;

  const isEmpty = items.length === 0;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70]" onClick={closeDrawer} aria-hidden="true" />
      <aside role="dialog" aria-modal="true" aria-label="Tu pedido"
        className="fixed top-0 right-0 h-full w-full max-w-[390px] bg-white shadow-2xl z-[80] flex flex-col overflow-hidden"
      >
        <header className="flex items-center justify-between px-6 py-5 border-b border-[#e5e5e5]">
          <h2 className="text-xl font-bold tracking-tight text-[#111111]">Tu pedido</h2>
          <button onClick={closeDrawer} aria-label="Cerrar carrito"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#f5f5f5] transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isEmpty ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-24 h-24 bg-[#f5f5f5] rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-5xl text-[#d1d5db]">shopping_basket</span>
              </div>
              <h3 className="text-lg font-bold text-[#111111]">Tu carrito está vacío</h3>
              <p className="text-sm text-on-surface-variant mt-2 max-w-[200px]">¡Parece que aún no has elegido tu banquete de hoy!</p>
              <button onClick={closeDrawer}
                className="mt-6 px-6 py-3 bg-[#f5f5f5] text-[#374151] font-bold rounded-xl active:scale-95 transition-all"
              >Explorar la Carta</button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <CartItemRow key={item.product.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {!isEmpty && (
          <footer className="bg-[#f5f5f5] p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Subtotal</span>
                <span className="text-[#111111] font-medium">S/ {subtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Envío</span>
                <span className="text-[#111111] font-medium">S/ {deliveryCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-bold text-[#111111]">Total</span>
                <span className="text-xl font-black text-primary">S/ {total().toFixed(2)}</span>
              </div>
            </div>
            <Link href="/checkout" onClick={closeDrawer}
              className="w-full h-14 bg-primary text-white font-bold text-lg rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
            >
              Ir al Checkout
              <span className="material-symbols-outlined">arrow_forward</span>
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
