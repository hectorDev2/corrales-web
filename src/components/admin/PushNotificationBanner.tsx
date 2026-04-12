"use client";

import { usePushNotifications } from "@/lib/hooks/usePushNotifications";

export function PushNotificationBanner() {
  const { state, loading, subscribe, unsubscribe } = usePushNotifications();

  if (state === "unsupported") return null;

  if (state === "denied") {
    return (
      <div className="rounded-2xl bg-surface-container-high px-4 py-3 flex items-center gap-3">
        <span
          className="material-symbols-outlined text-outline text-xl shrink-0"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
        >
          notifications_off
        </span>
        <p className="text-xs text-on-surface-variant">
          Notificaciones bloqueadas. Habilitá desde la configuración del navegador.
        </p>
      </div>
    );
  }

  if (state === "subscribed") {
    return (
      <div className="rounded-2xl bg-surface-container-high px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="material-symbols-outlined text-primary text-xl shrink-0"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            notifications_active
          </span>
          <p className="text-xs font-bold text-on-surface">Alertas activadas</p>
        </div>
        <button
          onClick={unsubscribe}
          disabled={loading}
          className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant hover:text-error transition-colors disabled:opacity-50"
        >
          Desactivar
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={subscribe}
      disabled={loading}
      className="w-full rounded-2xl bg-primary-container text-on-primary-container px-4 py-3 flex items-center gap-3 transition-all active:scale-[0.98] disabled:opacity-60"
    >
      <span
        className="material-symbols-outlined text-xl shrink-0"
        style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
      >
        notifications
      </span>
      <div className="text-left flex-1">
        <p className="text-sm font-bold">Activar alertas de pedidos</p>
        <p className="text-[11px] opacity-70">Recibí notificaciones aunque el tab esté cerrado</p>
      </div>
      <span
        className={`material-symbols-outlined text-xl shrink-0 ${loading ? "animate-spin" : ""}`}
        style={{ fontVariationSettings: `'FILL' 0, 'wght' ${loading ? 300 : 400}, 'GRAD' 0, 'opsz' 24` }}
      >
        {loading ? "progress_activity" : "arrow_forward"}
      </span>
    </button>
  );
}
