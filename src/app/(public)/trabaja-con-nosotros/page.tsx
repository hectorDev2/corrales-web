import { Metadata } from "next";

import { CareersForm } from "@/components/careers/CareersForm";

export const metadata: Metadata = {
  title: "Trabaja con nosotros | Corrales",
  description: "Unete a nuestro equipo y forma parte de la familia Corrales.",
};

export default function CareersPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-80px)] flex-col overflow-hidden bg-[#f5f5f5]">
      {/* Background Decorative Elements */}
      <div className="from-primary/10 pointer-events-none absolute top-0 left-0 h-[500px] w-full bg-gradient-to-b to-transparent" />
      <div className="bg-primary/5 pointer-events-none absolute top-[-100px] right-[-100px] h-[400px] w-[400px] rounded-full blur-[100px]" />
      <div className="bg-primary-container/10 pointer-events-none absolute bottom-[-100px] left-[-100px] h-[400px] w-[400px] rounded-full blur-[100px]" />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-16 md:py-24">
        {/* Header Section */}
        <div className="mb-16 space-y-6 text-center">
          <div className="bg-primary-container/20 text-primary mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm">
            <span
              className="material-symbols-outlined text-4xl"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              work
            </span>
          </div>
          <h1 className="text-on-surface text-4xl leading-tight font-black tracking-tight md:text-6xl">
            Unete a la <span className="text-primary">Familia Corrales</span>
          </h1>
          <p className="text-on-surface-variant mx-auto max-w-2xl text-lg font-medium md:text-xl">
            Estamos buscando personas apasionadas que quieran crecer con nosotros. Déjanos tu
            currículum y descubre tu próximo gran desafío.
          </p>
        </div>

        <CareersForm />

        {/* Features/Values */}
        <div className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              icon: "trending_up",
              title: "Crecimiento",
              desc: "Oportunidades reales de hacer línea de carrera y crecer profesionalmente con nosotros.",
            },
            {
              icon: "favorite",
              title: "Buen Clima",
              desc: "Fomentamos un ambiente de trabajo respetuoso, divertido y de apoyo mutuo.",
            },
            {
              icon: "restaurant",
              title: "Beneficios",
              desc: "Descuentos en todos nuestros productos y beneficios corporativos exclusivos.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-3 rounded-2xl border border-white/60 bg-white/50 p-6 text-center shadow-sm backdrop-blur-sm"
            >
              <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl">
                <span className="material-symbols-outlined">{feature.icon}</span>
              </div>
              <h3 className="text-on-surface text-lg font-bold">{feature.title}</h3>
              <p className="text-on-surface-variant text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
