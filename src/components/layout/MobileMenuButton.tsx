"use client";

interface MobileMenuButtonProps {
  onClick?: () => void;
}

export function MobileMenuButton({ onClick }: MobileMenuButtonProps) {
  return (
    <button
      aria-label="Abrir menú"
      onClick={onClick}
      className="flex md:hidden items-center p-2 text-primary transition-transform active:scale-90"
    >
      <span
        className="material-symbols-outlined text-3xl"
        style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
      >
        menu
      </span>
    </button>
  );
}
