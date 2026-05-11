import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[400px] items-center overflow-hidden bg-gradient-to-br from-primary to-[#b30022]">
      {/* Decorative blobs */}
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-white/5 blur-2xl" />
      <div className="absolute top-1/2 left-1/3 h-48 w-48 rounded-full bg-[#ff4d6a]/10 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-4xl px-6 py-16 text-center md:py-24">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-bold tracking-widest uppercase text-white/90">
          <span
            className="material-symbols-outlined text-sm"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            local_fire_department
          </span>
          Sabor Tradicional
        </div>

        {/* Headline */}
        <h1 className="mb-6 text-5xl leading-[0.88] font-black tracking-tighter text-white md:text-7xl lg:text-8xl">
          EL CORAZÓN <br />
          <span className="text-[#ffcc00]">DE LA BRASA.</span>
        </h1>

        {/* Subhead */}
        <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed font-medium text-white/80 md:text-xl">
          Recetas familiares que han pasado de generación en generación, servidas con el calor de
          nuestro hogar en cada bocado.
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="#menu"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-10 py-5 text-lg font-bold text-primary shadow-xl transition-all hover:scale-[1.02] active:scale-95 sm:w-auto"
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
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-white/30 px-10 py-5 text-lg font-bold text-white transition-all hover:bg-white/10 active:scale-95 sm:w-auto"
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
    </section>
  );
}
