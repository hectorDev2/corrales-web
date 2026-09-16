import type { Metadata } from "next";

import { InstitutionalPage } from "@/components/institutional";

export const metadata: Metadata = {
  title: "Políticas de privacidad — Corrales",
  description: "Conocé cómo Corrales trata la información que compartís en sus canales digitales.",
};

export default function Page() {
  return (
    <InstitutionalPage
      title="Políticas de privacidad"
      currentPath="/institucional/paginas-informativas/politicas-privacidad"
    >
      <p>
        En Corrales respetamos tu privacidad. Esta política explica, de manera clara, qué
        información podemos recibir cuando usás nuestros canales digitales y para qué la utilizamos.
      </p>
      <section className="space-y-3">
        <h2 className="text-on-surface text-xl font-black">Información que nos compartís</h2>
        <p>
          Podemos recibir datos que ingresás al realizar un pedido, solicitar información,
          participar en una encuesta o contactarnos. También podemos recibir datos técnicos
          necesarios para que el sitio funcione correctamente.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-on-surface text-xl font-black">Cómo usamos la información</h2>
        <p>
          Usamos la información para atender tus solicitudes, procesar pedidos, mejorar la
          experiencia del sitio y enviarte comunicaciones comerciales cuando corresponda y contemos
          con tu autorización.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-on-surface text-xl font-black">Tus consultas</h2>
        <p>
          Si querés consultar, actualizar o solicitar información sobre tus datos personales,
          escribinos a{" "}
          <a href="mailto:corrales@contacto.pe" className="text-primary font-bold hover:underline">
            corrales@contacto.pe
          </a>
          .
        </p>
      </section>
    </InstitutionalPage>
  );
}
