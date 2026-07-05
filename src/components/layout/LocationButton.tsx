"use client";

import { useLocationStore } from "@/store/location";

export function LocationButton() {
  const { address, openModal } = useLocationStore();
  const label = address || "Ingresa tu ubicación";

  return (
    <button
      type="button"
      onClick={openModal}
      className="hidden md:flex items-center gap-1 text-xs font-bold tracking-wide whitespace-nowrap text-white/80 hover:text-white transition-colors shrink-0"
    >
      <span className="hidden lg:inline truncate max-w-[140px]">{label}</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 16.5 4.5 9l1.05-1.05L12 14.4l6.45-6.45L19.5 9z" />
      </svg>
    </button>
  );
}
