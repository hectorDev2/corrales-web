"use client";

import Image from "next/image";

import { useCartStore } from "@/store/cart";

export function OrderSummary() {
  const { items, subtotal, total, deliveryCost } = useCartStore();

  return (
    <div className="bg-surface-container-lowest p-8 rounded-[2rem] shadow-[0_12px_40px_rgba(89,65,61,0.08)]">
      <h2 className="text-2xl font-black tracking-tighter mb-6 flex items-center justify-between">
        Tu Pedido
        <span className="text-sm font-bold bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full">
          {items.reduce((sum, i) => sum + i.quantity, 0)} items
        </span>
      </h2>

      {/* Item list */}
      <div className="space-y-4 mb-8">
        {items.map(({ product, quantity }) => (
          <div key={product.id} className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 relative">
              <Image
                src={product.image.src}
                alt={product.image.alt}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-on-surface truncate">
                {quantity}x {product.name}
              </p>
              <p className="text-xs text-on-surface-variant truncate">
                {product.description}
              </p>
            </div>
            <p className="font-bold text-primary shrink-0">
              S/ {(product.price * quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-3 py-6 border-t border-dashed border-outline-variant">
        <div className="flex justify-between text-on-surface-variant">
          <span>Subtotal</span>
          <span>S/ {subtotal().toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-on-surface-variant">
          <span>Delivery</span>
          <span>S/ {deliveryCost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xl font-black text-on-surface pt-2">
          <span>Total</span>
          <span className="text-primary">S/ {total().toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
