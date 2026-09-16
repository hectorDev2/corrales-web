import type { Metadata } from "next";

import { InstitutionalPage } from "@/components/institutional";

export const metadata: Metadata = {
  title: "Términos y condiciones de la web — Corrales",
  description: "Conocé los términos y condiciones de uso del sitio web de Corrales.",
};

export default function Page() {
  return (
    <InstitutionalPage
      title="Términos y condiciones de la web"
      currentPath="/institucional/paginas-informativas/terminos-condiciones-web"
    >
      <p>
        Al navegar por este sitio y realizar una compra, aceptás los presentes términos y
        condiciones. Si no estás de acuerdo, te pedimos que no utilices nuestros canales digitales.
      </p>
      <section className="space-y-3">
        <h2 className="text-on-surface text-xl font-black">1. Uso del sitio</h2>
        <p>
          El sitio web de Corrales permite consultar nuestra carta, conocer promociones y realizar
          pedidos, de acuerdo con la disponibilidad del canal y de cada local. La información que
          ingreses debe ser verdadera, completa y mantenerse actualizada.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-on-surface text-xl font-black">2. Pedidos y pagos</h2>
        <p>
          Los productos, precios, promociones y zonas de reparto pueden variar según el local y la
          disponibilidad. Un pedido queda confirmado cuando el sistema muestra la confirmación
          correspondiente. Antes de finalizar, revisá el detalle, la dirección y el medio de pago.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-on-surface text-xl font-black">3. Entrega</h2>
        <p>
          Los tiempos de entrega son referenciales y pueden verse afectados por la demanda, el
          clima, el tráfico o circunstancias ajenas a Corrales. Es responsabilidad del cliente
          brindar una dirección válida y estar disponible para recibir el pedido.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-on-surface text-xl font-black">4. Cambios</h2>
        <p>
          Podemos actualizar estos términos para reflejar cambios en nuestros servicios o en la
          normativa aplicable. La versión vigente estará siempre publicada en esta página.
        </p>
      </section>
    </InstitutionalPage>
  );
}
