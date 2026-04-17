import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[600px] items-center overflow-hidden bg-gradient-to-br from-[#FDF6F0] via-white to-white">
      {/* Decorative blobs */}
      <div className="bg-primary/5 absolute -top-24 -right-24 h-96 w-96 rounded-full blur-3xl" />
      <div className="bg-tertiary-fixed/10 absolute -bottom-16 -left-16 h-72 w-72 rounded-full blur-2xl" />

      <div className="relative z-10 mx-auto w-full max-w-4xl px-6 py-16 text-center md:py-24">
        {/* Badge */}
        <div className="bg-tertiary-fixed text-on-tertiary-fixed mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold tracking-widest uppercase">
          <span
            className="material-symbols-outlined text-sm"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            local_fire_department
          </span>
          Sabor Tradicional
        </div>

        {/* Headline */}
        <h1 className="text-on-surface mb-6 text-6xl leading-[0.88] font-black tracking-tighter md:text-8xl lg:text-9xl">
          EL CORAZÓN <br />
          <span className="text-primary">DE LA BRASA.</span>
        </h1>

        {/* Subhead */}
        <p className="text-secondary mx-auto mb-10 max-w-xl text-lg leading-relaxed font-medium md:text-xl">
          Recetas familiares que han pasado de generación en generación, servidas con el calor de
          nuestro hogar en cada bocado.
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="#menu"
            className="from-primary to-primary-container text-on-primary shadow-primary/20 flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-br px-10 py-5 text-lg font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-95 sm:w-auto"
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
            className="bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest flex w-full items-center justify-center rounded-xl px-10 py-5 text-lg font-bold transition-all active:scale-95 sm:w-auto"
          >
            Reservar Mesa
          </Link>
        </div>
      </div>
    </section>
  );
}
