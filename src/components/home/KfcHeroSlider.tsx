"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { SliderSlide } from "@/lib/api/slider";

interface KfcHeroSliderProps {
  slides: SliderSlide[];
}

export function KfcHeroSlider({ slides }: KfcHeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const goTo = useCallback(
    (index: number) => {
      setCurrent(((index % slides.length) + slides.length) % slides.length);
    },
    [slides.length],
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    intervalRef.current = setInterval(next, 5000);
    return () => clearInterval(intervalRef.current);
  }, [next]);

  if (slides.length === 0) return null;

  return (
    <section className="relative -mx-4 md:-mx-margin-desktop overflow-hidden mt-4">
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="min-w-full">
            {slide.image_url && (
              <picture>
                {slide.image_url_mobile && (
                  <source
                    media="(max-width: 767px)"
                    srcSet={slide.image_url_mobile}
                  />
                )}
                <img
                  src={slide.image_url}
                  alt={slide.title ?? "Promoción"}
                  className="w-full aspect-[4.56] object-cover"
                />
              </picture>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={prev}
        className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 p-2 text-white transition-all"
        aria-label="Anterior"
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>
      <button
        onClick={next}
        className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 p-2 text-white transition-all"
        aria-label="Siguiente"
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-2 h-2 transition-all ${
              i === current ? "bg-primary" : "bg-white/50"
            }`}
            aria-label={`Ir a slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
