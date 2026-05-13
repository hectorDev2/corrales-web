import { Metadata } from "next";

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

        {/* Upload Card */}
        <div className="shadow-card group relative mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-[#e5e5e5] bg-white p-8 md:p-12">
          {/* Subtle hover gradient */}
          <div className="from-primary/5 pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          <form className="relative flex flex-col gap-8">
            <div className="space-y-2">
              <h2 className="text-on-surface flex items-center gap-2 text-2xl font-bold">
                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                >
                  upload_file
                </span>
                Sube tu CV
              </h2>
              <p className="text-on-surface-variant text-sm">
                Aceptamos documentos en formato PDF (máximo 5MB).
              </p>
            </div>

            {/* Input Fields */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="firstName" className="text-on-surface text-sm font-bold">
                  Nombre completo
                </label>
                <input
                  type="text"
                  id="firstName"
                  placeholder="Ej. Juan Pérez"
                  className="bg-surface-container-lowest border-outline-variant/30 focus:border-primary focus:ring-primary/20 placeholder:text-outline w-full rounded-xl border px-4 py-3 transition-all outline-none focus:ring-2"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-on-surface text-sm font-bold">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="juan@ejemplo.com"
                  className="bg-surface-container-lowest border-outline-variant/30 focus:border-primary focus:ring-primary/20 placeholder:text-outline w-full rounded-xl border px-4 py-3 transition-all outline-none focus:ring-2"
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label htmlFor="phone" className="text-on-surface text-sm font-bold">
                  Teléfono (opcional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  placeholder="Ej. +51 987 654 321"
                  className="bg-surface-container-lowest border-outline-variant/30 focus:border-primary focus:ring-primary/20 placeholder:text-outline w-full rounded-xl border px-4 py-3 transition-all outline-none focus:ring-2"
                />
              </div>
            </div>

            {/* Drag & Drop Area */}
            <div className="relative">
              <input
                type="file"
                id="resume"
                accept=".pdf"
                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              />
              <div className="border-primary/30 bg-primary/5 hover:bg-primary/10 group-hover:border-primary/50 flex w-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors duration-300">
                <div className="text-primary mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-300 group-hover:scale-110">
                  <span
                    className="material-symbols-outlined text-3xl"
                    style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}
                  >
                    cloud_upload
                  </span>
                </div>
                <div>
                  <p className="text-on-surface text-base font-bold">
                    Haz clic para subir o arrastra tu PDF aquí
                  </p>
                  <p className="text-on-surface-variant mt-1 text-sm">
                    Solo archivos PDF hasta 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Terms and conditions */}
            <div className="flex items-start gap-3 px-1">
              <div className="mt-0.5 flex h-5 items-center">
                <input
                  id="terms"
                  type="checkbox"
                  className="border-outline-variant/30 text-primary focus:ring-primary/20 accent-primary h-5 w-5 cursor-pointer rounded"
                  required
                />
              </div>
              <label
                htmlFor="terms"
                className="text-on-surface-variant cursor-pointer text-sm leading-relaxed select-none"
              >
                He leído y acepto la{" "}
                <a href="/privacidad" className="text-primary font-semibold hover:underline">
                  Política de Privacidad
                </a>{" "}
                y los{" "}
                <a href="/terminos" className="text-primary font-semibold hover:underline">
                  Términos y Condiciones
                </a>
                , y consiento el uso de mis datos personales con fines de reclutamiento y selección.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              className="bg-primary text-on-primary shadow-primary/25 hover:shadow-primary/40 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-lg font-bold shadow-lg transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                send
              </span>
              Enviar postulación
            </button>
          </form>
        </div>

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
