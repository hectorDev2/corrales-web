"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { FooterSettings } from "@/lib/api/settings";

const DEFAULT_FOOTER: FooterSettings = {
  aboutText: "Pollería & Fastfood. Recetas familiares que han pasado de generación en generación.",
  whatsapp: "51999999999",
  email: "corrales@contacto.pe",
  address: "Av. La Marina 1234, Lima",
  sections: [
    {
      title: "Contacto",
      links: [
        { label: "Contáctanos", href: "/institucional/formularios/contactanos" },
        { label: "Encuesta", href: "/institucional/formularios/encuesta" },
        { label: "505-0505", href: "tel:5050505" },
        { label: "Servicio al cliente", href: `https://wa.me/51999999999` },
      ],
    },
    {
      title: "Sobre Nosotros",
      links: [
        { label: "Historia", href: "/nosotros" },
        { label: "Trabaja con nosotros", href: "/trabaja-con-nosotros" },
        { label: "Ventas corporativas", href: "/ventas-corporativas" },
        { label: "Libro de Reclamaciones", href: "/libro-de-reclamaciones" },
      ],
    },
    {
      title: "Políticas",
      links: [
        {
          label: "Términos y condiciones",
          href: "/institucional/paginas-informativas/terminos-condiciones-web",
        },
        {
          label: "Políticas de privacidad",
          href: "/institucional/paginas-informativas/politicas-privacidad",
        },
        {
          label: "Control de cookies",
          href: "/institucional/paginas-informativas/politicas-cookies",
        },
      ],
    },
  ],
  social: { facebook: "#", instagram: "#", tiktok: "#" },
};

const FOOTER_LINK_CLASS =
  "flex items-center gap-2 text-white/60 hover:text-primary transition-colors";

function FooterLink({
  href,
  children,
  className = FOOTER_LINK_CLASS,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

export function Footer() {
  const [settings, setSettings] = useState<FooterSettings>(DEFAULT_FOOTER);

  useEffect(() => {
    import("@/lib/api/settings").then((mod) =>
      mod.getFooterSettings().then((data) => {
        if (data) setSettings(data);
      }),
    );
  }, []);

  const whatsappHref = `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`;

  return (
    <footer className="bg-[#111111] py-16 text-white">
      <div className="md:px-margin-desktop mx-auto max-w-7xl px-4">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-4">
          <div>
            <h4 className="mb-6 text-lg font-bold uppercase">Contacto</h4>
            <ul className="space-y-4">
              <li>
                <FooterLink href="/institucional/formularios/contactanos">
                  <span className="material-symbols-outlined">support_agent</span>
                  Contáctanos
                </FooterLink>
              </li>
              <li>
                <FooterLink href="/institucional/formularios/encuesta">
                  <span className="material-symbols-outlined">rate_review</span>
                  Encuesta
                </FooterLink>
              </li>
              <li>
                <FooterLink href="tel:5050505">
                  <span className="material-symbols-outlined">call</span>
                  505-0505
                </FooterLink>
              </li>
              <li>
                <FooterLink
                  href={whatsappHref}
                  className="flex items-center justify-center gap-2 border border-[#25D366] bg-[#25D366]/10 p-3 font-bold text-[#25D366] transition-all hover:bg-[#25D366] hover:text-[#111111]"
                >
                  <span className="material-symbols-outlined">chat</span>
                  Servicio al cliente
                </FooterLink>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-6 text-lg font-bold uppercase">Sobre Nosotros</h4>
            <ul className="space-y-4">
              <li>
                <FooterLink href="/nosotros">Historia</FooterLink>
              </li>
              <li>
                <FooterLink href="/trabaja-con-nosotros">Trabaja con nosotros</FooterLink>
              </li>
              <li>
                <FooterLink href="/ventas-corporativas">Ventas corporativas</FooterLink>
              </li>
              <li>
                <FooterLink href="/libro-de-reclamaciones">Libro de Reclamaciones</FooterLink>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-6 text-lg font-bold uppercase">Políticas</h4>
            <ul className="space-y-4">
              <li>
                <FooterLink href="/institucional/paginas-informativas/terminos-condiciones-web">
                  Términos y condiciones
                </FooterLink>
              </li>
              <li>
                <FooterLink href="/institucional/paginas-informativas/politicas-privacidad">
                  Políticas de privacidad
                </FooterLink>
              </li>
              <li>
                <FooterLink href="/institucional/paginas-informativas/politicas-cookies">
                  Control de cookies
                </FooterLink>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-6 text-lg font-bold uppercase">Únete al club</h4>
            <p className="mb-4 text-sm text-white/60">
              Recibe las mejores ofertas y promociones en tu correo.
            </p>
            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
              <input
                className="focus:border-primary w-full border-2 border-white/20 bg-transparent p-3 text-sm text-white outline-none focus:ring-0"
                placeholder="Nombre"
                type="text"
              />
              <input
                className="focus:border-primary w-full border-2 border-white/20 bg-transparent p-3 text-sm text-white outline-none focus:ring-0"
                placeholder="Correo electrónico"
                type="email"
              />
              <button
                type="submit"
                className="bg-primary hover:text-primary w-full py-4 text-xs font-bold tracking-widest text-white uppercase transition-all hover:bg-white"
              >
                Suscribirme
              </button>
            </form>
          </div>
        </div>
        <nav
          className="mb-8 border-t border-white/10 pt-8"
          aria-labelledby="footer-social-media-title"
        >
          <div className="text-center">
            <h3
              id="footer-social-media-title"
              className="mb-4 text-sm font-bold tracking-widest text-white/60 uppercase"
            >
              Síguenos en nuestras redes sociales
            </h3>
          </div>
          <div className="flex justify-center gap-6">
            <a
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:text-primary text-white/60 transition-colors"
              href={settings.social.instagram}
            >
              <svg
                width="1.5em"
                height="1.5em"
                fill="currentColor"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M10.425 3.116c-.633-.029-.823-.035-2.425-.035s-1.792.006-2.424.035a3.3 3.3 0 0 0-1.115.207A1.99 1.99 0 0 0 3.323 4.46a3.3 3.3 0 0 0-.207 1.115c-.029.632-.035.822-.035 2.424s.006 1.792.035 2.425c.005.38.074.757.207 1.114a1.99 1.99 0 0 0 1.138 1.138 3.3 3.3 0 0 0 1.114.207c.633.029.823.035 2.425.035s1.792-.006 2.425-.035a3.3 3.3 0 0 0 1.114-.207 1.99 1.99 0 0 0 1.138-1.138c.133-.357.202-.734.207-1.114.029-.633.035-.823.035-2.425s-.006-1.792-.035-2.424a3.3 3.3 0 0 0-.207-1.115 1.99 1.99 0 0 0-1.138-1.138 3.3 3.3 0 0 0-1.114-.207m-4.899-1.08C6.166 2.006 6.371 2 8 2s1.834.007 2.473.036c.498.01.99.105 1.457.28a3.07 3.07 0 0 1 1.755 1.754c.175.466.269.959.279 1.456.03.64.036.845.036 2.474s-.007 1.834-.036 2.473c-.01.498-.104.99-.279 1.457a3.07 3.07 0 0 1-1.755 1.755 4.4 4.4 0 0 1-1.456.279C9.834 13.994 9.63 14 8 14s-1.834-.007-2.474-.036a4.4 4.4 0 0 1-1.456-.279 3.07 3.07 0 0 1-1.755-1.755 4.4 4.4 0 0 1-.279-1.456C2.006 9.834 2 9.63 2 8s.007-1.834.036-2.474c.01-.497.104-.99.279-1.456A3.07 3.07 0 0 1 4.07 2.315a4.4 4.4 0 0 1 1.456-.279m5.677 3.481a.72.72 0 1 0 0-1.44.72.72 0 0 0 0 1.44M8 4.92a3.081 3.081 0 1 0 0 6.162A3.081 3.081 0 0 0 8 4.92M8 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="hover:text-primary text-white/60 transition-colors"
              href={settings.social.facebook}
            >
              <svg
                width="1.5em"
                height="1.5em"
                fill="currentColor"
                viewBox="0 0 11 20"
                aria-hidden="true"
              >
                <path d="m10.01 11.25.555-3.62H7.092V5.282c0-.99.485-1.956 2.04-1.956h1.58V.245S9.277 0 7.907 0c-2.86 0-4.73 1.734-4.73 4.872V7.63H0v3.62h3.18V20h3.913v-8.75z" />
              </svg>
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="hover:text-primary text-white/60 transition-colors"
              href="#"
            >
              <svg
                width="1.5em"
                height="1.5em"
                preserveAspectRatio="xMidYMid"
                viewBox="0 -4 32 32"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M30.722 20.579c-.585 1.315-2.094 2.506-3.511 2.769-.145.027-3.608.652-11.201.652h-.02c-7.592 0-11.058-.625-11.202-.651-1.417-.264-2.927-1.455-3.513-2.771C1.223 20.461.001 17.647.001 12s1.222-8.462 1.274-8.579C1.861 2.105 3.371.915 4.788.652 4.932.625 8.398 0 15.99 0c7.613 0 11.076.625 11.22.651 1.418.264 2.927 1.454 3.513 2.769C30.775 3.538 32 6.353 32 12s-1.225 8.461-1.278 8.579M28.893 4.23c-.312-.701-1.29-1.471-2.048-1.612C26.813 2.612 23.386 2 16.01 2c-7.395 0-10.825.612-10.858.618-.758.141-1.735.911-2.048 1.616-.01.021-1.102 2.595-1.102 7.766s1.092 7.744 1.104 7.77c.311.701 1.288 1.471 2.047 1.612.032.006 3.462.618 10.837.618h.02c7.376 0 10.803-.612 10.836-.618.758-.141 1.735-.911 2.048-1.616.01-.022 1.104-2.596 1.104-7.766s-1.094-7.745-1.105-7.77M13.541 17.846a1 1 0 0 1-1.016.029 1 1 0 0 1-.517-.875V7a.999.999 0 0 1 1.526-.851l8.019 4.956a1 1 0 0 1 .007 1.696zm.468-9.052v6.395l5.128-3.226z" />
              </svg>
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
              className="hover:text-primary text-white/60 transition-colors"
              href="#"
            >
              <svg
                width="1.5em"
                height="1.5em"
                viewBox="0 0 30 30"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="m26.37 26-8.795-12.822.015.012L25.52 4h-2.65l-6.46 7.48L11.28 4H4.33l8.211 11.971-.001-.001L3.88 26h2.65l7.182-8.322L19.42 26zM10.23 6l12.34 18h-2.1L8.12 6z" />
              </svg>
            </a>
          </div>
        </nav>
        <div className="flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Corrales. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
