import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="via-surface relative flex min-h-[700px] items-center overflow-hidden bg-gradient-to-br from-[#FDF6F0] to-white">
      {/* Decorative accent — skewed panel */}
      <div className="bg-surface-container-low absolute top-0 right-0 -z-10 h-full w-1/3 translate-x-24 skew-x-12 opacity-40" />

      <div className="mx-auto w-full max-w-7xl px-6 py-12 md:py-24">
        <div className="flex flex-col items-center gap-12 lg:flex-row">
          {/* ── Text column ─────────────────────────────────── */}
          <div className="z-10 flex w-full flex-col items-start lg:w-1/2">
            {/* Badge */}
            <div className="bg-tertiary-fixed text-on-tertiary-fixed mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold tracking-widest uppercase">
              <span
                className="material-symbols-outlined text-sm"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                local_fire_department
              </span>
              Sabor Tradicional
            </div>

            {/* Headline */}
            <h1 className="text-on-surface mb-6 text-5xl leading-[0.9] font-black tracking-tighter md:text-7xl md:leading-[0.85]">
              EL CORAZÓN <br />
              <span className="text-primary">DE LA BRASA.</span>
            </h1>

            {/* Subhead */}
            <p className="text-secondary mb-10 max-w-xl text-lg leading-relaxed font-medium md:text-xl">
              Recetas familiares que han pasado de generación en generación, servidas con el calor
              de nuestro hogar en cada bocado.
            </p>

            {/* CTAs */}
            <div className="mb-12 flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
              <Link
                href="/menu"
                className="from-primary to-primary-container text-on-primary shadow-primary/20 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br px-10 py-5 text-lg font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-95"
              >
                Ver la Carta
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                >
                  restaurant_menu
                </span>
              </Link>
              <Link
                href="/reservas"
                className="bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest flex items-center justify-center rounded-xl px-10 py-5 text-lg font-bold transition-all active:scale-95"
              >
                Reservar Mesa
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-8 opacity-70">
              <div className="flex flex-col">
                <span className="text-on-surface text-2xl font-bold">4.8/5</span>
                <span className="text-on-surface-variant text-xs font-bold tracking-widest uppercase">
                  Calificación
                </span>
              </div>
              <div className="bg-outline-variant h-8 w-px" />
              <div className="flex flex-col">
                <span className="text-on-surface text-2xl font-bold">30min</span>
                <span className="text-on-surface-variant text-xs font-bold tracking-widest uppercase">
                  Entrega Promedio
                </span>
              </div>
              <div className="bg-outline-variant h-8 w-px" />
              <div className="flex flex-col">
                <span className="text-on-surface text-2xl font-bold">15+</span>
                <span className="text-on-surface-variant text-xs font-bold tracking-widest uppercase">
                  Años de sabor
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
