"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { useGeolocation } from "@/hooks/useGeolocation";
import { MapboxAutocomplete, reverseGeocode } from "@/components/checkout/MapboxAutocomplete";
import { useLocationStore } from "@/store/location";
import { MapView } from "./MapView";

export function LocationModal() {
  const {
    address,
    lat,
    lng,
    deliveryType,
    modalOpen,
    closeModal,
    setAddress,
    setDeliveryType,
  } = useLocationStore();

  const { requestLocation } = useGeolocation();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeModal]);

  useEffect(() => {
    document.body.style.overflow = modalOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modalOpen]);

  if (!modalOpen) return null;

  async function handleUseCurrentLocation() {
    const loc = await requestLocation();
    if (loc) {
      const addr = await reverseGeocode(loc.lat, loc.lng);
      setAddress(addr ?? `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`, loc.lat, loc.lng);
      toast.success("¡Ubicación guardada!");
      closeModal();
    } else {
      toast.error("No pudimos obtener tu ubicación. Verificá los permisos.");
    }
  }

  function handleMapChange(newLat: number, newLng: number) {
    setAddress(address, newLat, newLng);
    reverseGeocode(newLat, newLng).then((addr) => {
      if (addr) setAddress(addr, newLat, newLng);
    });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 backdrop-blur-sm pt-16 md:pt-24">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e5e5]">
          <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f5] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" aria-label="close" role="img">
              <path d="m12 4.7-.7-.7L8 7.3 4.7 4l-.7.7L7.3 8 4 11.3l.7.7L8 8.7l3.3 3.3.7-.7L8.7 8z" />
            </svg>
          </button>
          <p className="text-sm font-black tracking-tight">Dirección de entrega</p>
          <div className="w-8" />
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Delivery / Pickup toggle */}
          <div className="flex bg-[#f5f5f5] rounded-lg p-1">
            <button
              onClick={() => setDeliveryType("delivery")}
              className={`flex-1 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
                deliveryType === "delivery"
                  ? "bg-white text-primary shadow-sm"
                  : "text-on-surface-variant"
              }`}
            >
              Delivery
            </button>
            <button
              onClick={() => setDeliveryType("pickup")}
              className={`flex-1 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
                deliveryType === "pickup"
                  ? "bg-white text-primary shadow-sm"
                  : "text-on-surface-variant"
              }`}
            >
              Recojo en tienda
            </button>
          </div>

          {/* Address search */}
          <div>
            <div className="mapbox-autocomplete">
              <MapboxAutocomplete
                value={address}
                onChange={(val) => setAddress(val)}
                placeholder="Busca una dirección"
              />
            </div>
          </div>

          {/* Map */}
          <MapView lat={lat} lng={lng} onChange={handleMapChange} />

          {/* Current location button */}
          <button
            onClick={handleUseCurrentLocation}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-[#e5e5e5] text-xs font-bold uppercase tracking-wider text-on-surface transition-all hover:border-primary hover:text-primary active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2m0 18.5a8.5 8.5 0 1 1 8.5-8.5 8.51 8.51 0 0 1-8.5 8.5m5-9h-3.5V8a1.5 1.5 0 0 0-3 0v3.5H7a1.5 1.5 0 0 0 0 3h3.5V18a1.5 1.5 0 0 0 3 0v-3.5H17a1.5 1.5 0 0 0 0-3" />
            </svg>
            Usar mi ubicación actual
          </button>
        </div>
      </div>
    </div>
  );
}
