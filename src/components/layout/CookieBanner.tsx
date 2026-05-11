"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already accepted or declined
    const hasConsent = localStorage.getItem("corrales_cookie_consent");
    if (!hasConsent) {
      // Small delay to let the page load before sliding in
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isVisible) return null;

  const handleAccept = () => {
    localStorage.setItem("corrales_cookie_consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("corrales_cookie_consent", "declined");
    setIsVisible(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 pointer-events-none">
      <div className="max-w-4xl mx-auto bg-[#fff8f2]/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_rgba(89,65,61,0.15)] border border-primary/10 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pointer-events-auto animate-in slide-in-from-bottom-10 fade-in duration-700">
        
        <div className="flex-1 space-y-2">
          <h3 className="text-lg font-black text-on-surface flex items-center gap-2 tracking-tight">
            <span
              className="material-symbols-outlined text-primary text-2xl"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              cookie
            </span>
            Aviso de Privacidad y Cookies
          </h3>
          <p className="text-on-surface-variant text-sm leading-relaxed font-medium">
            Utilizamos cookies propias y de terceros para entender cómo interactúas con nuestra web y ofrecerte una experiencia más dulce y personalizada. Al continuar navegando, aceptas nuestra{" "}
            <Link href="/privacidad" className="text-primary hover:underline font-bold">
              Política de Privacidad
            </Link>{" "}
            y el uso de tus datos.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 shrink-0">
          <button 
            onClick={handleDecline}
            className="px-6 py-3 rounded-xl border border-outline-variant/30 text-on-surface font-bold text-sm hover:bg-surface-container-high active:scale-95 transition-all"
          >
            Solo necesarias
          </button>
          <button 
            onClick={handleAccept}
            className="px-6 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
          >
            <span
              className="material-symbols-outlined text-lg"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              check_circle
            </span>
            Aceptar todo
          </button>
        </div>

      </div>
    </div>
  );
}
