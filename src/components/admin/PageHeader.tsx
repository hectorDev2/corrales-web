import type { ReactNode } from "react";

/** Contenedor estándar de cada pantalla del panel. */
export const PAGE_CONTAINER = "mx-auto w-full max-w-7xl space-y-6 px-4 py-5 md:px-8 md:py-8";

interface PageHeaderProps {
  title: string;
  /** Texto pequeño sobre el título (sección). */
  eyebrow?: string;
  description?: string;
  /** Dato destacado a la derecha, p. ej. { label: "Pendientes", value: 3 }. */
  stat?: { label: string; value: ReactNode };
  /** Botones u otros controles a la derecha. */
  actions?: ReactNode;
}

export function PageHeader({ title, eyebrow = "Administración", description, stat, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <p className="text-secondary text-xs font-bold tracking-widest uppercase">{eyebrow}</p>
        <h1 className="text-on-surface text-2xl font-black tracking-tighter md:text-3xl">{title}</h1>
        {description && <p className="text-on-surface-variant mt-1 text-sm">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        {stat && (
          <div className="bg-surface-container-high rounded-xl px-3 py-2 text-right">
            <p className="text-secondary text-xs font-bold uppercase">{stat.label}</p>
            <p className="text-primary text-sm font-black">{stat.value}</p>
          </div>
        )}
      </div>
    </header>
  );
}
