import Link from "next/link";

const INSTITUTIONAL_LINKS = [
  { label: "Historia", href: "/nosotros" },
  { label: "Contáctanos", href: "/institucional/formularios/contactanos" },
  { label: "Encuesta", href: "/institucional/formularios/encuesta" },
  { label: "Ventas corporativas", href: "/ventas-corporativas" },
  { label: "Libro de Reclamaciones", href: "/libro-de-reclamaciones" },
  {
    label: "Términos y condiciones de la web",
    href: "/institucional/paginas-informativas/terminos-condiciones-web",
  },
  {
    label: "Políticas de privacidad",
    href: "/institucional/paginas-informativas/politicas-privacidad",
  },
  {
    label: "Política de cookies",
    href: "/institucional/paginas-informativas/politicas-cookies",
  },
] as const;

interface InstitutionalPageProps {
  title: string;
  currentPath: string;
  children: React.ReactNode;
}

export function InstitutionalPage({ title, currentPath, children }: InstitutionalPageProps) {
  return (
    <div className="bg-surface-container-low">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm">
          <ol className="text-on-surface-variant flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-primary font-semibold transition-colors">
                Inicio
              </Link>
            </li>
            <li aria-hidden="true">&gt;</li>
            <li aria-current="page" className="text-on-surface font-bold">
              {title}
            </li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
          <aside
            className="shadow-card rounded-2xl bg-white p-3"
            aria-label="Sección institucional"
          >
            <nav>
              <ul className="space-y-1">
                {INSTITUTIONAL_LINKS.map((item) => {
                  const isCurrent = item.href === currentPath;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={isCurrent ? "page" : undefined}
                        className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
                          isCurrent
                            ? "bg-primary text-on-primary"
                            : "text-on-surface-variant hover:bg-primary/10 hover:text-primary"
                        }`}
                      >
                        {item.label}
                        <span aria-hidden="true">›</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          <main className="shadow-card min-w-0 rounded-2xl bg-white p-6 md:p-10">
            <h1 className="text-on-surface mb-8 text-3xl leading-tight font-black tracking-tight md:text-5xl">
              {title}
            </h1>
            <article className="text-on-surface-variant space-y-6 text-sm leading-7 md:text-base">
              {children}
            </article>
          </main>
        </div>
      </div>
    </div>
  );
}
