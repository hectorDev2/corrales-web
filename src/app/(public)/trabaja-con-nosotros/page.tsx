import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trabaja con nosotros | Corrales",
  description: "Unete a nuestro equipo y forma parte de la familia Corrales.",
};

export default function CareersPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f5f5f5] flex flex-col relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
      <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-primary-container/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full px-4 py-16 md:py-24 relative z-10 flex-1 flex flex-col">
        {/* Header Section */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-container/20 text-primary rounded-2xl mb-4 shadow-sm">
            <span
              className="material-symbols-outlined text-4xl"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              work
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-on-surface tracking-tight leading-tight">
            Únete a la <span className="text-primary">Familia Corrales</span>
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto font-medium">
            Estamos buscando personas apasionadas que quieran crecer con nosotros. 
            Déjanos tu currículum y descubre tu próximo gran desafío.
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-card border border-[#e5e5e5] w-full max-w-2xl mx-auto relative group overflow-hidden">
          {/* Subtle hover gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <form className="relative flex flex-col gap-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-on-surface flex items-center gap-2">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="firstName" className="text-sm font-bold text-on-surface">Nombre completo</label>
                <input 
                  type="text" 
                  id="firstName" 
                  placeholder="Ej. Juan Pérez"
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-bold text-on-surface">Correo electrónico</label>
                <input 
                  type="email" 
                  id="email" 
                  placeholder="juan@ejemplo.com"
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline"
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label htmlFor="phone" className="text-sm font-bold text-on-surface">Teléfono (opcional)</label>
                <input 
                  type="tel" 
                  id="phone" 
                  placeholder="Ej. +51 987 654 321"
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline"
                />
              </div>
            </div>

            {/* Drag & Drop Area */}
            <div className="relative">
              <input 
                type="file" 
                id="resume" 
                accept=".pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-full rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors duration-300 py-12 px-6 flex flex-col items-center justify-center text-center gap-4 group-hover:border-primary/50">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                  <span
                    className="material-symbols-outlined text-3xl"
                    style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}
                  >
                    cloud_upload
                  </span>
                </div>
                <div>
                  <p className="text-base font-bold text-on-surface">
                    Haz clic para subir o arrastra tu PDF aquí
                  </p>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Solo archivos PDF hasta 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Terms and conditions */}
            <div className="flex items-start gap-3 px-1">
              <div className="flex items-center h-5 mt-0.5">
                <input
                  id="terms"
                  type="checkbox"
                  className="w-5 h-5 rounded border-outline-variant/30 text-primary focus:ring-primary/20 accent-primary cursor-pointer"
                  required
                />
              </div>
              <label htmlFor="terms" className="text-sm text-on-surface-variant cursor-pointer select-none leading-relaxed">
                He leído y acepto la{" "}
                <a href="/privacidad" className="text-primary hover:underline font-semibold">Política de Privacidad</a>{" "}
                y los{" "}
                <a href="/terminos" className="text-primary hover:underline font-semibold">Términos y Condiciones</a>
                , y consiento el uso de mis datos personales con fines de reclutamiento y selección.
              </label>
            </div>

            {/* Submit Button */}
            <button 
              type="button"
              className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          {[
            {
              icon: "trending_up",
              title: "Crecimiento",
              desc: "Oportunidades reales de hacer línea de carrera y crecer profesionalmente con nosotros."
            },
            {
              icon: "favorite",
              title: "Buen Clima",
              desc: "Fomentamos un ambiente de trabajo respetuoso, divertido y de apoyo mutuo."
            },
            {
              icon: "restaurant",
              title: "Beneficios",
              desc: "Descuentos en todos nuestros productos y beneficios corporativos exclusivos."
            }
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60 shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-xl text-primary flex items-center justify-center">
                <span className="material-symbols-outlined">
                  {feature.icon}
                </span>
              </div>
              <h3 className="font-bold text-on-surface text-lg">{feature.title}</h3>
              <p className="text-on-surface-variant text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
