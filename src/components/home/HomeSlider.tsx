"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import type { SliderSlide } from "@/lib/api/slider";

interface HomeSliderProps {
  slides: SliderSlide[];
}

export function HomeSlider({ slides }: HomeSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: true }),
  ]);
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  if (slides.length === 0) return null;

  return (
    <section className="w-full overflow-hidden" aria-label="Promociones">
      <div ref={emblaRef} className="w-full overflow-hidden">
        <div className="flex w-full touch-pan-y items-start">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className={`relative min-w-0 flex-[0_0_100%] overflow-hidden bg-black aspect-square md:aspect-[25/6]`}
            >
              {slide.type === "image" && slide.image_url ? (
                /* ── Modo imagen — desktop / mobile ──────────────── */
                <picture className="absolute inset-0">
                  {slide.image_url_mobile && (
                    <source media="(max-width: 767px)" srcSet={slide.image_url_mobile} />
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.image_url}
                    alt="Promoción"
                    className="w-full h-full object-cover"
                  />
                </picture>
              ) : (
                /* ── Modo custom (gradiente + texto) ─────────────── */
                <>
                  <div className={`absolute inset-0 bg-gradient-to-br ${slide.bg_gradient ?? "from-[#1a0a00] via-[#3d1500] to-[#f25600]"}`} />

                  {/* Noise texture */}
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjY1IiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')] opacity-[0.04]" />

                  {/* Decorative circles */}
                  <div className="absolute -top-16 -right-16 h-72 w-72 rounded-full opacity-10" style={{ background: slide.accent_color ?? "#f25600" }} />
                  <div className="absolute -right-8 bottom-0 h-48 w-48 rounded-full opacity-[0.07]" style={{ background: slide.accent_color ?? "#f25600" }} />

                  {/* Content */}
                  <div className="relative flex h-full flex-col justify-end px-6 pb-8 md:px-12 md:pb-12">
                    {slide.eyebrow && (
                      <div className="mb-3 flex items-center gap-2">
                        {slide.icon && (
                          <span
                            className="material-symbols-outlined text-base"
                            style={{ color: slide.accent_color ?? "#f25600", fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                            aria-hidden="true"
                          >
                            {slide.icon}
                          </span>
                        )}
                        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: slide.accent_color ?? "#f25600" }}>
                          {slide.eyebrow}
                        </span>
                      </div>
                    )}

                    {slide.title && (
                      <h2 className="mb-3 whitespace-pre-line text-4xl font-black leading-[0.9] tracking-tight text-white md:text-6xl">
                        {slide.title}
                      </h2>
                    )}

                    {slide.subtitle && (
                      <p className="mb-6 max-w-xs whitespace-pre-line text-sm leading-snug text-white/70 md:text-base">
                        {slide.subtitle}
                      </p>
                    )}

                    {slide.cta_label && slide.cta_href && (
                      <Link
                        href={slide.cta_href}
                        className="flex items-center gap-2 self-start rounded-xl px-6 py-3 text-sm font-bold text-white transition-transform active:scale-95"
                        style={{ background: slide.accent_color ?? "#f25600" }}
                      >
                        {slide.cta_label}
                        <span
                          className="material-symbols-outlined text-base"
                          style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                          aria-hidden="true"
                        >
                          arrow_forward
                        </span>
                      </Link>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div className="flex justify-center gap-2 pb-1 pt-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Ir a slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === selected ? "h-2 w-6 bg-primary" : "h-2 w-2 bg-outline-variant"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
