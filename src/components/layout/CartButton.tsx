"use client";

interface CartButtonProps {
  itemCount?: number;
}

export function CartButton({ itemCount = 0 }: CartButtonProps) {
  return (
    <button
      aria-label="Carrito de compras"
      className="relative p-2 text-primary transition-transform active:scale-90"
    >
      <span
        className="material-symbols-outlined text-2xl md:text-3xl"
        style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
      >
        shopping_cart
      </span>
      {itemCount > 0 && (
        <span className="absolute top-1 right-1 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary shadow-md">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </button>
  );
}
