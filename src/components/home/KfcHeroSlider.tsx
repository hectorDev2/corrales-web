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

  const next = useCallback(
    () => setCurrent((index) => (index + 1) % slides.length),
    [slides.length],
  );
  const prev = useCallback(
    () => setCurrent((index) => (index - 1 + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    intervalRef.current = setInterval(next, 5000);
    return () => clearInterval(intervalRef.current);
  }, [next]);

  if (slides.length === 0) return null;

  return (
    <section className="bg-surface relative overflow-hidden rounded-xl border border-black/5 shadow-sm">
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={slide.id} className="min-w-full">
            {slide.image_url && (
              <picture>
                {slide.image_url_mobile && (
                  <source media="(max-width: 767px)" srcSet={slide.image_url_mobile} />
                )}
                <img
                  src={slide.image_url}
                  alt={slide.title ?? "Promoción"}
                  className="aspect-[4.56] w-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  decoding="async"
                />
              </picture>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={prev}
        className="bg-primary hover:bg-primary-container absolute top-1/2 left-0 z-10 flex h-12 w-8 -translate-y-1/2 items-center justify-center rounded-r-lg text-white shadow-sm transition-colors md:h-14 md:w-10"
        aria-label="Anterior"
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>
      <button
        onClick={next}
        className="bg-primary hover:bg-primary-container absolute top-1/2 right-0 z-10 flex h-12 w-8 -translate-y-1/2 items-center justify-center rounded-l-lg text-white shadow-sm transition-colors md:h-14 md:w-10"
        aria-label="Siguiente"
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
      <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 gap-1.5 md:bottom-4">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`flex h-5 w-5 items-center justify-center rounded-full transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
              i === current ? "scale-110" : "hover:scale-110"
            }`}
            aria-label={`Ir a slide ${i + 1}`}
          >
            <span
              aria-hidden="true"
              className={`h-1.5 rounded-full shadow-sm transition-all ${
                i === current ? "bg-primary w-4" : "w-1.5 bg-white/90"
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
