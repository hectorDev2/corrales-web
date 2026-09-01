"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { reverseGeocode } from "@/components/checkout/MapboxAutocomplete";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useLocationStore } from "@/store/location";

export function LocationBanner() {
  const { getStored, requestLocation, isDismissed, dismiss } = useGeolocation();
  const setAddress = useLocationStore((state) => state.setAddress);
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
      const address = await reverseGeocode(loc.lat, loc.lng);
      // Conservamos las coordenadas aunque Mapbox no pueda describirlas. Así el selector
      // sigue centrado en el punto elegido y el Header mantiene su fallback legible.
      setAddress(address ?? "", loc.lat, loc.lng);
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
    <div className="pointer-events-none fixed inset-0 z-[45] flex items-center justify-center px-4">
      <div className="pointer-events-auto w-full max-w-sm">
        <div className="overflow-hidden rounded-3xl border border-[#e5e5e5] bg-white shadow-[0_8px_40px_rgba(0,0,0,0.12)]">
          <div className="flex gap-3 p-4">
            <div className="bg-primary/10 mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl">
              <span
                className="material-symbols-outlined text-primary text-xl"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                location_on
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-tight font-black text-[#111111]">
                ¿Compartís tu ubicación?
              </p>
              <p className="text-on-surface-variant mt-0.5 text-[11px] leading-snug">
                La usamos para coordinar tu delivery más rápido.
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-on-surface-variant flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition hover:bg-[#f5f5f5]"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>

          <div className="flex gap-2 px-4 pb-4">
            <button
              onClick={handleDismiss}
              className="text-on-surface-variant flex-1 rounded-xl bg-[#f5f5f5] py-2.5 text-[11px] font-bold tracking-wider uppercase transition active:scale-95"
            >
              Ahora no
            </button>
            <button
              onClick={handleAllow}
              disabled={loading}
              className="bg-primary shadow-primary/25 flex flex-1 items-center justify-center gap-1 rounded-xl py-2.5 text-[11px] font-bold tracking-wider text-white uppercase shadow-lg transition active:scale-95 disabled:opacity-60"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-sm">
                  progress_activity
                </span>
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
