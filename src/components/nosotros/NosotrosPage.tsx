import Image from "next/image";
import Link from "next/link";

const VALUES = [
  {
    icon: "local_fire_department",
    title: "Tradición",
    description: "Recetas transmitidas de generación en generación, con el mismo sabor de siempre.",
    bg: "bg-tertiary-fixed",
    text: "text-on-tertiary-fixed",
  },
  {
    icon: "verified",
    title: "Calidad",
    description: "Solo ingredientes frescos. Nuestros pollos se preparan cada día desde cero.",
    bg: "bg-primary-fixed",
    text: "text-on-primary-fixed",
  },
  {
    icon: "favorite",
    title: "Familia",
    description: "Cada mesa es una extensión de nuestra familia. Tratamos a cada cliente como en casa.",
    bg: "bg-secondary-fixed",
    text: "text-on-secondary-fixed",
  },
  {
    icon: "emoji_food_beverage",
    title: "Sabor",
    description: "El secreto está en el marinado. 24 horas de preparación para el pollo perfecto.",
    bg: "bg-surface-container-highest",
    text: "text-on-surface",
  },
] as const;

const HISTORY = [
  {
    year: "1987",
    title: "El primer horno",
    body: "Don Aurelio Corrales encendió su primer horno en Chorrillos con una receta propia y la promesa de darle a Lima el mejor pollo a la brasa.",
  },
  {
    year: "2001",
    title: "Segunda generación",
    body: "Sus hijos Miguel y Rosa tomaron las riendas y abrieron el segundo local, llevando la tradición Corrales a Barranco.",
  },
  {
    year: "2015",
    title: "La parrilla entra al menú",
    body: "Incorporamos cortes de res y cerdo a la parrilla sin abandonar nuestra especialidad. La carta creció, el sabor se mantuvo.",
  },
  {
    year: "2024",
    title: "Corrales digital",
    body: "Lanzamos nuestra plataforma online para que podés pedir desde donde estés, sin perder el trato cercano de siempre.",
  },
] as const;

export function NosotrosPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-16">

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">
            Nuestra historia
          </p>
          <h1 className="text-4xl font-black tracking-tighter text-on-surface leading-tight">
            Tres generaciones.
            <br />
            <span className="text-primary">Un solo sabor.</span>
          </h1>
          <p className="text-on-surface-variant leading-relaxed text-base">
            Desde 1987, la familia Corrales ha puesto el corazón en cada pollo que sale del horno.
            Lo que empezó como un pequeño local en Chorrillos hoy es una tradición limeña que
            miles de familias comparten cada semana.
          </p>
        </div>

        {/* Hero image */}
        <div className="relative w-full h-64 md:h-80 rounded-3xl overflow-hidden shadow-[0_12px_40px_rgba(89,65,61,0.15)]">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKPaHQQaFBKZRRekE3sA0MJt_s6EIRvl3dB0p4mL_6bPBr-4-ZITYdkHdXaTZr_vU0bVTXoB1NL5pJj5yR72EaTsEkA8N1z2Nrn3lBKSjh7C6bxTmfXFYUSBrS8Y7OOQVnbQOF6sMFT3Vhc1y-EEDqj3PEVzRBHXKnFmA8igH8AxkGfNlD1VrSgJJmPm6mNxhqL9d5Sp-3TkzL1hgKaH9YBCN6SIjwn3NkHgVnIhekVJwnFoHGBmpAJSSqrXByKxcA65Pu19M27"
            alt="El equipo Corrales frente al restaurante"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
          />
          <div className="absolute inset-0 bg-linear-to-t from-on-surface/60 to-transparent" />
          <div className="absolute bottom-4 left-5">
            <p className="text-white font-black text-lg tracking-tight drop-shadow">
              Pollería & Fastfood Corrales
            </p>
            <p className="text-white/80 text-xs font-bold">Chorrillos, Lima · Desde 1987</p>
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────── */}
      <section className="space-y-5">
        <h2 className="text-2xl font-black tracking-tighter text-on-surface">
          Lo que nos mueve
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {VALUES.map(({ icon, title, description, bg, text }) => (
            <div
              key={title}
              className={`${bg} rounded-3xl p-5 flex flex-col gap-3 relative overflow-hidden`}
            >
              <span
                className={`material-symbols-outlined ${text} opacity-15 absolute -right-3 -bottom-3 text-7xl`}
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48" }}
              >
                {icon}
              </span>
              <span
                className={`material-symbols-outlined ${text} text-2xl`}
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                {icon}
              </span>
              <div>
                <p className={`font-black text-sm ${text} mb-1`}>{title}</p>
                <p className={`text-[11px] leading-relaxed ${text} opacity-75`}>{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── History timeline ─────────────────────────── */}
      <section className="space-y-5">
        <h2 className="text-2xl font-black tracking-tighter text-on-surface">
          Nuestra trayectoria
        </h2>
        <div className="relative space-y-0">
          {/* Vertical line */}
          <div className="absolute left-[27px] top-3 bottom-3 w-px bg-outline-variant" />

          {HISTORY.map(({ year, title, body }, i) => (
            <div key={year} className="flex gap-5 pb-8 last:pb-0">
              {/* Dot */}
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center z-10 font-black text-xs ${
                    i === HISTORY.length - 1
                      ? "bg-primary text-on-primary shadow-lg shadow-primary/30"
                      : "bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  {year}
                </div>
              </div>
              {/* Content */}
              <div className="pt-3 flex-1">
                <p className="font-black text-on-surface mb-1">{title}</p>
                <p className="text-sm text-on-surface-variant leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section className="bg-surface-container-low rounded-3xl p-8 text-center space-y-4">
        <span
          className="material-symbols-outlined text-primary text-4xl"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48" }}
        >
          restaurant
        </span>
        <div>
          <h3 className="text-xl font-black tracking-tighter text-on-surface mb-2">
            ¿Listo para probar el sabor Corrales?
          </h3>
          <p className="text-sm text-on-surface-variant">
            Pedí online o hacé una reserva. Siempre hay un lugar para vos.
          </p>
        </div>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/menu"
            className="bg-linear-to-br from-primary to-primary-container text-on-primary font-black px-6 py-3 rounded-2xl shadow-[0_8px_30px_rgba(158,32,22,0.25)] hover:scale-[1.02] active:scale-95 transition-all text-sm"
          >
            Ver Carta
          </Link>
          <Link
            href="/reservas"
            className="bg-surface-container-high text-on-surface font-bold px-6 py-3 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all text-sm"
          >
            Hacer Reserva
          </Link>
        </div>
      </section>

    </div>
  );
}
