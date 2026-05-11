"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useGeolocation } from "@/hooks/useGeolocation";

export function LocationBanner() {
  const { getStored, requestLocation, isDismissed, dismiss } = useGeolocation();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isDismissed() || getStored() || !("geolocation" in navigator)) return;
    const t = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(t);
  }, [isDismissed, getStored]);

  if (!visible) return null;

  async function handleAllow() {
    setLoading(true);
    const loc = await requestLocation();
    setLoading(false);
    setVisible(false);
    if (loc) {
      toast.success("¡Ubicación guardada! Se usará en tu próximo pedido.");
    } else {
      toast.error("No se pudo obtener la ubicación. Verificá los permisos del navegador.");
      dismiss();
    }
  }

  function handleDismiss() {
    dismiss();
    setVisible(false);
  }

  return (
    <div className="fixed inset-0 z-[45] flex items-center justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-sm">
      <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-[#e5e5e5] overflow-hidden">
        <div className="p-4 flex gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <span
              className="material-symbols-outlined text-primary text-xl"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              location_on
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-[#111111] leading-tight">
              ¿Compartís tu ubicación?
            </p>
            <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">
              La usamos para coordinar tu delivery más rápido.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="w-7 h-7 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-[#f5f5f5] transition shrink-0"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        <div className="px-4 pb-4 flex gap-2">
          <button
            onClick={handleDismiss}
            className="flex-1 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider text-on-surface-variant bg-[#f5f5f5] transition active:scale-95"
          >
            Ahora no
          </button>
          <button
            onClick={handleAllow}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider bg-primary text-white shadow-lg shadow-primary/25 transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-1"
          >
            {loading ? (
              <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-sm">my_location</span>
            )}
            {loading ? "Obteniendo..." : "Sí, compartir"}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
