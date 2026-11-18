"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" pinta el botón principal en rojo de advertencia. */
  tone?: "default" | "danger";
}

type Pending = ConfirmOptions & { resolve: (ok: boolean) => void };

/**
 * Reemplazo de window.confirm con una ventana propia, grande y clara.
 * Uso: const [confirm, confirmDialog] = useConfirm();
 *      if (!(await confirm({ title: "¿Eliminar?" }))) return;
 *      ... y renderizar {confirmDialog} en el JSX.
 */
export function useConfirm() {
  const [pending, setPending] = useState<Pending | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const confirm = useCallback(
    (options: ConfirmOptions) => new Promise<boolean>((resolve) => setPending({ ...options, resolve })),
    [],
  );

  function close(ok: boolean) {
    pending?.resolve(ok);
    setPending(null);
  }

  useEffect(() => {
    if (!pending) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        pending.resolve(false);
        setPending(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pending]);

  const danger = pending?.tone === "danger";
  const dialog = pending ? (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center">
      <div className="bg-scrim/50 absolute inset-0" onClick={() => close(false)} aria-hidden="true" />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="bg-surface relative w-full max-w-md space-y-4 rounded-3xl p-6 shadow-2xl"
      >
        <div className="flex items-start gap-3">
          <span
            className={`material-symbols-outlined flex size-12 shrink-0 items-center justify-center rounded-full text-2xl ${
              danger ? "bg-error-container text-error" : "bg-primary/10 text-primary"
            }`}
            aria-hidden="true"
          >
            {danger ? "warning" : "help"}
          </span>
          <div className="min-w-0">
            <h2 id="confirm-title" className="text-on-surface text-lg font-black">
              {pending.title}
            </h2>
            {pending.message && <p className="text-on-surface-variant mt-1 text-sm">{pending.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={() => close(false)}
            className="bg-surface-container-high text-on-surface min-h-12 rounded-2xl px-4 text-sm font-bold active:scale-95"
          >
            {pending.cancelLabel ?? "Cancelar"}
          </button>
          <button
            type="button"
            onClick={() => close(true)}
            className={`min-h-12 rounded-2xl px-4 text-sm font-bold active:scale-95 ${
              danger ? "bg-error text-on-error" : "bg-primary text-on-primary"
            }`}
          >
            {pending.confirmLabel ?? "Aceptar"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return [confirm, dialog] as const;
}
