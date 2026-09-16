import type { Metadata } from "next";

import { InstitutionalPage } from "@/components/institutional";

export const metadata: Metadata = {
  title: "Política de cookies — Corrales",
  description: "Conocé cómo usamos cookies en el sitio web de Corrales.",
};

export default function Page() {
  return (
    <InstitutionalPage
      title="Política de cookies"
      currentPath="/institucional/paginas-informativas/politicas-cookies"
    >
      <p>
        Usamos cookies y tecnologías similares para mantener el sitio funcionando, recordar algunas
        preferencias y entender cómo se utiliza nuestra web.
      </p>
      <section className="space-y-3">
        <h2 className="text-on-surface text-xl font-black">Cookies necesarias</h2>
        <p>
          Son esenciales para funciones como la navegación, el carrito de compras y la seguridad.
          Sin ellas, algunas partes del sitio no pueden funcionar correctamente.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-on-surface text-xl font-black">Cookies analíticas</h2>
        <p>
          Nos ayudan a conocer qué secciones son más útiles y a detectar oportunidades de mejora.
          Podés gestionar tus preferencias desde el aviso de cookies cuando esté disponible.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-on-surface text-xl font-black">Control de cookies</h2>
        <p>
          También podés configurar o eliminar cookies desde las opciones de tu navegador. Tené en
          cuenta que bloquear algunas cookies puede afectar el funcionamiento del sitio.
        </p>
      </section>
    </InstitutionalPage>
  );
}
