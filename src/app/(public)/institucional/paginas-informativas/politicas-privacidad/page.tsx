import type { Metadata } from "next";

import { InstitutionalPage } from "@/components/institutional";

export const metadata: Metadata = {
  title: "Políticas de privacidad — Corrales",
  description: "Conoce cómo Corrales trata la información que compartes en sus canales digitales.",
};

export default function Page() {
  return (
    <InstitutionalPage
      title="Políticas de privacidad"
      currentPath="/institucional/paginas-informativas/politicas-privacidad"
    >
      <p>
        En Corrales respetamos tu privacidad. Esta política explica, de manera clara, qué
        información podemos recibir cuando usas nuestros canales digitales y para qué la utilizamos.
      </p>
      <section className="space-y-3">
        <h2 className="text-on-surface text-xl font-black">Información que nos compartes</h2>
        <p>
          Podemos recibir datos que ingresas al realizar un pedido, solicitar información,
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
          Si quieres consultar, actualizar o solicitar información sobre tus datos personales,
          escríbenos a{" "}
          <a href="mailto:corrales@contacto.pe" className="text-primary font-bold hover:underline">
            corrales@contacto.pe
          </a>
          .
        </p>
      </section>
    </InstitutionalPage>
  );
}
