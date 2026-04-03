import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative min-h-[700px] flex items-center overflow-hidden bg-gradient-to-br from-[#FDF6F0] via-surface to-white">
      {/* Decorative accent — skewed panel */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-surface-container-low opacity-40 skew-x-12 translate-x-24 -z-10" />

      <div className="max-w-7xl mx-auto w-full px-6 py-12 md:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-12">

          {/* ── Text column ─────────────────────────────────── */}
          <div className="w-full lg:w-1/2 flex flex-col items-start z-10">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-xs font-bold tracking-widest uppercase mb-6">
              <span
                className="material-symbols-outlined text-sm"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                local_fire_department
              </span>
              Sabor Tradicional
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-black text-on-surface tracking-tighter leading-[0.9] md:leading-[0.85] mb-6">
              EL CORAZÓN <br />
              <span className="text-primary">DE LA BRASA.</span>
            </h1>

            {/* Subhead */}
            <p className="text-lg md:text-xl text-secondary leading-relaxed max-w-xl mb-10 font-medium">
              Recetas familiares que han pasado de generación en generación,
              servidas con el calor de nuestro hogar en cada bocado.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-12">
              <Link
                href="/menu"
                className="px-10 py-5 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-lg rounded-xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
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
                className="px-10 py-5 bg-surface-container-high text-on-surface-variant font-bold text-lg rounded-xl hover:bg-surface-container-highest active:scale-95 transition-all flex items-center justify-center"
              >
                Reservar Mesa
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-8 opacity-70">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-on-surface">4.8/5</span>
                <span className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">
                  Calificación
                </span>
              </div>
              <div className="h-8 w-px bg-outline-variant" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-on-surface">30min</span>
                <span className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">
                  Entrega Promedio
                </span>
              </div>
              <div className="h-8 w-px bg-outline-variant" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-on-surface">15+</span>
                <span className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">
                  Años de sabor
                </span>
              </div>
            </div>
          </div>

          {/* ── Image column ────────────────────────────────── */}
          <div className="w-full lg:w-1/2 relative">
            <div className="relative z-10 group">

              {/* Glow background */}
              <div className="absolute inset-0 bg-tertiary/20 blur-[100px] rounded-full scale-75 -z-10 group-hover:bg-primary/20 transition-colors duration-700" />

              {/* Hero image — rotated, hover to straighten */}
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgP4H1MzvfYBSQjjWjDLmT-OPOaxb3nTpLzmQPigivfac9U3CtPmoeTJF-cpwSGoajAx7Otl8Zxlrow9xACm-npzdW3Np27EepIg8OK-UAomOcs7T0W_N-fORBF5qE9tKgjYl-XJ6vDfsAFJSRuCb4StLZf7D6kXY-TIt9V_sIS-Xe1SeO-wN2EPnKG3LqC1wozhpp9j1lwGoL1PlJduXCswAXgHzh-iPpo5eWOBxYNHflQViHEeHiDbefsASta0pmjrDCF_IdELVw"
                  alt="Pollo a la Brasa Corrales — dorado y crujiente"
                  width={600}
                  height={500}
                  className="w-full h-[400px] md:h-[500px] object-cover"
                  priority
                />
              </div>

              {/* Floating badge — "Especial de la Casa" */}
              <div className="absolute -bottom-6 -left-6 bg-surface-container-lowest p-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-outline-variant/10 z-20">
                <div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed flex-shrink-0">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                  >
                    star
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Especial de la Casa</p>
                  <p className="text-xs text-on-surface-variant">Receta Secreta Corrales</p>
                </div>
              </div>

              {/* Floating ají image — desktop only */}
              <div className="absolute -top-10 -right-10 hidden md:block">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAS1Xe1HbNYrEelZxHbWOPMzsuv9IKIELt2Y_AZTFX0V4SvcS7-HcONnQvTi448EODDl_agGUf6uBcLrBBsWzAVg_xsLl5OOxayWMRmlxCpLRqf8O6GrBxuS4ECjwz66NvVpWeV66Umgaw-HGTqWCLHzRbTg78EsCgNZ8OlCJ2fNfjtERI89sAauveOUHjiUZ__Rw1t79q_em0XsrnNzuLJkZaeNNMPxi028D0kGqlQc"
                  alt="Salsa de Ají — Corrales"
                  width={160}
                  height={160}
                  className="w-40 h-40 object-cover rounded-full border-8 border-surface shadow-xl"
                />
              </div>
            </div>

            {/* Decorative shapes */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-tertiary-fixed rounded-3xl -z-10 animate-pulse opacity-60" />
            <div className="absolute -top-6 -left-6 w-48 h-48 border-[12px] border-surface-container-low rounded-full -z-10" />
          </div>

        </div>
      </div>
    </section>
  );
}
