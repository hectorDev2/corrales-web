"use client";

import { type ReactNode, useState } from "react";

/** Contenedor estándar de cada pantalla del panel. */
export const PAGE_CONTAINER = "mx-auto w-full max-w-7xl space-y-6 px-4 py-5 md:px-8 md:py-8";

interface PageHeaderProps {
  title: string;
  /** Texto pequeño sobre el título (sección). */
  eyebrow?: string;
  description?: string;
  /** Ayuda oculta tras un botón «?»; no ocupa espacio hasta que se toca. */
  help?: string;
  /** Dato destacado a la derecha, p. ej. { label: "Pendientes", value: 3 }. */
  stat?: { label: string; value: ReactNode };
  /** Botones u otros controles a la derecha. */
  actions?: ReactNode;
}

export function PageHeader({ title, eyebrow = "Administración", description, help, stat, actions }: PageHeaderProps) {
  const [showHelp, setShowHelp] = useState(false);
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <p className="text-secondary text-xs font-bold tracking-widest uppercase">{eyebrow}</p>
        <div className="flex items-center gap-2">
          <h1 className="text-on-surface text-2xl font-black tracking-tighter md:text-3xl">{title}</h1>
          {help && (
            <button
              type="button"
              onClick={() => setShowHelp((v) => !v)}
              aria-expanded={showHelp}
              aria-label={showHelp ? "Ocultar ayuda" : "¿Para qué sirve esta pantalla?"}
              className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-black transition ${
                showHelp ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              ?
            </button>
          )}
        </div>
        {help && showHelp && (
          <p className="bg-surface-container-low text-on-surface-variant mt-2 max-w-xl rounded-2xl px-4 py-3 text-sm">{help}</p>
        )}
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
