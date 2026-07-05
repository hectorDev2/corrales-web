"use client";

import { useEffect, useState } from "react";

export function LocationModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("location-dismissed");
    if (!dismissed) setOpen(true);
  }, []);

  function handleClose() {
    setOpen(false);
    sessionStorage.setItem("location-dismissed", "true");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md p-8 shadow-2xl relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-secondary hover:text-black"
          aria-label="Cerrar"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-primary/10 flex items-center justify-center rounded-full mb-6">
            <span className="material-symbols-outlined text-primary text-4xl">location_on</span>
          </div>
          <h3 className="text-2xl font-bold mb-2">Primero lo primero</h3>
          <p className="text-secondary text-sm mb-8">
            Elige dónde y cómo quieres recibir tus productos para mostrarte las ofertas de tu zona.
          </p>
          <button
            onClick={handleClose}
            className="w-full bg-primary text-white py-4 text-xs font-bold uppercase flex items-center justify-center gap-2 hover:gap-4 transition-all duration-300"
          >
            Elegir ubicación
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
          <div className="mt-6 flex gap-4 text-xs text-secondary">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">delivery_dining</span>
              Delivery
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">storefront</span>
              Recojo en tienda
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
