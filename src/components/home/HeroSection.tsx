import Link from "next/link";

export function HeroSection() {
  return (
    <div className="flex justify-center px-4 py-3">
      <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="#menu"
            className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-primary shadow-xl transition-all hover:scale-[1.02] active:scale-95"
          >
            Pedir delivery
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              restaurant_menu
            </span>
          </Link>
          <Link
            href="/reservas"
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-outline-variant px-6 py-3 text-sm font-bold text-on-surface-variant transition-all hover:border-outline hover:text-on-surface active:scale-95"
          >
            Reservar Mesa
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              event_seat
            </span>
          </Link>
      </div>
    </div>
  );
}
