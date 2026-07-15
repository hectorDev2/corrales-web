"use client";

import { useEffect, useState } from "react";

function isStoreClosed() {
  const now = new Date();
  const min = now.getHours() * 60 + now.getMinutes();
  return min < 660 || min >= 1320;
}

export function AnnouncementBar() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setShow(isStoreClosed());
  }, []);

  if (!show || dismissed) return null;

  return (
    <div className="bg-[#111] text-white text-center text-xs md:text-sm py-2.5 px-4 flex items-center justify-center gap-2">
      <span>
        ¡Pronto empezará el sabor! Pedidos disponibles{" "}
        <strong>a partir de las 11:00 am.</strong>
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="ml-2 shrink-0 text-white/70 hover:text-white"
        aria-label="Cerrar anuncio"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          fill="currentColor"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path d="m12 4.7-.7-.7L8 7.3 4.7 4l-.7.7L7.3 8 4 11.3l.7.7L8 8.7l3.3 3.3.7-.7L8.7 8z" />
        </svg>
      </button>
    </div>
  );
}
