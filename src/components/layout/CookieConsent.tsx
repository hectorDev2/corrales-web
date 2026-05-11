"use client";

import { useEffect, useState } from "react";

const COOKIE_CONSENT_KEY = "corrales-cookies-accepted";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!accepted) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    setVisible(false);
  }

  function reject() {
    localStorage.setItem(COOKIE_CONSENT_KEY, "false");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 pointer-events-none md:items-center">
      <div className="pointer-events-auto w-full max-w-lg bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-[#e5e5e5] overflow-hidden">
        <div className="p-6 space-y-4">
          {/* Text content */}
          <div className="space-y-2">
            <span className="text-sm font-black uppercase tracking-widest text-[#111111]">
              Política de cookies
            </span>
            <p className="text-sm text-[#666666] leading-relaxed">
              Nos preocupamos por mejorar tu experiencia de compra, por ello usamos cookies
              funcionales y analíticas. Si sigues navegando las cookies analíticas se aplicarán
              de forma automática. Conoce más en nuestra política de cookies{" "}
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:text-primary/80 transition-colors"
              >
                haciendo click aquí
              </a>
            </p>
          </div>

          {/* Confirm section */}
          <div className="space-y-3 pt-2">
            <h2 className="text-sm font-black text-[#111111]">
              ¿Aceptas el uso de cookies?
            </h2>
            <div className="flex gap-3">
              <button
                onClick={accept}
                className="flex-1 h-12 rounded-xl bg-primary text-white text-sm font-bold uppercase tracking-wider hover:bg-primary/90 active:scale-95 transition-all"
              >
                Aceptar
              </button>
              <button
                onClick={reject}
                className="flex-1 h-12 rounded-xl border-2 border-[#e5e5e5] text-[#666666] text-sm font-bold uppercase tracking-wider hover:bg-[#f5f5f5] active:scale-95 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
