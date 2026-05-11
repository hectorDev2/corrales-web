"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Swiper from "swiper/bundle";
import "swiper/css/bundle";

import type { SliderSlide } from "@/lib/api/slider";

interface HomeSliderProps {
  slides: SliderSlide[];
}

export function HomeSlider({ slides }: HomeSliderProps) {
  const swiperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = swiperRef.current;
    if (!el || slides.length === 0) return;

    const swiper = new Swiper(el, {
      loop: true,
      slidesPerView: 1,
      spaceBetween: 12,
      autoplay: { delay: 4000, disableOnInteraction: true },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
        bulletClass: "swiper-pagination-bullet",
        bulletActiveClass: "swiper-pagination-bullet-active",
      },
    });

    return () => swiper.destroy();
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <section className="relative w-full" aria-label="Promociones">
      <div
        ref={swiperRef}
        id="home-hero"
        className="swiper w-full"
      >
        <div className="swiper-wrapper">
          {slides.map((slide) => (
            <div key={slide.id} className="swiper-slide">
              {slide.type === "image" && slide.image_url ? (
                <a
                  href={slide.cta_href ?? "#"}
                  className="relative block h-[200px] md:h-[400px] w-full overflow-hidden bg-black"
                  aria-label={slide.title ?? "Promoción"}
                >
                  <picture className="absolute inset-0">
                    {slide.image_url_mobile && (
                      <source
                        media="(max-width: 767px)"
                        srcSet={slide.image_url_mobile}
                      />
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slide.image_url}
                      alt={slide.title ?? "Promoción"}
                      className="h-full w-full object-cover"
                      loading={slide.sort_order === 0 ? "eager" : "lazy"}
                      fetchPriority={slide.sort_order === 0 ? "high" : "auto"}
                    />
                  </picture>

                  {slide.cta_label && slide.cta_href && (
                    <div className="absolute bottom-4 left-4 md:bottom-6 md:left-8">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-primary shadow-lg transition-transform hover:scale-105 active:scale-95">
                        <span
                          className="material-symbols-outlined text-base"
                          style={{ fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" }}
                          aria-hidden="true"
                        >
                          arrow_circle_right
                        </span>
                        {slide.cta_label}
                      </span>
                    </div>
                  )}
                </a>
              ) : (
                <div className="relative h-[200px] md:h-[400px] overflow-hidden">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${slide.bg_gradient ?? "from-[#e4002b] via-[#b30022] to-[#800018]"}`}
                  />

                  {/* Noise texture */}
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjY1IiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')] opacity-[0.04]" />

                  {/* Decorative circles */}
                  <div
                    className="absolute -top-16 -right-16 h-72 w-72 rounded-full opacity-10"
                    style={{ background: slide.accent_color ?? "#e4002b" }}
                  />
                  <div
                    className="absolute -right-8 bottom-0 h-48 w-48 rounded-full opacity-[0.07]"
                    style={{ background: slide.accent_color ?? "#e4002b" }}
                  />

                  {/* Content */}
                  <div className="relative flex h-full flex-col justify-end px-6 pb-6 md:px-12 md:pb-8">
                    {slide.eyebrow && (
                      <div className="mb-2 flex items-center gap-2">
                        {slide.icon && (
                          <span
                            className="material-symbols-outlined text-base"
                            style={{
                              color: slide.accent_color ?? "#e4002b",
                              fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                            }}
                            aria-hidden="true"
                          >
                            {slide.icon}
                          </span>
                        )}
                        <span
                          className="text-xs font-bold uppercase tracking-widest"
                          style={{ color: slide.accent_color ?? "#e4002b" }}
                        >
                          {slide.eyebrow}
                        </span>
                      </div>
                    )}

                    {slide.title && (
                      <h2 className="mb-2 whitespace-pre-line text-3xl font-black leading-[0.9] tracking-tight text-white md:text-5xl">
                        {slide.title}
                      </h2>
                    )}

                    {slide.subtitle && (
                      <p className="mb-4 max-w-xs whitespace-pre-line text-sm leading-snug text-white/70 md:text-base">
                        {slide.subtitle}
                      </p>
                    )}

                    {slide.cta_label && slide.cta_href && (
                      <Link
                        href={slide.cta_href}
                        className="flex items-center gap-2 self-start rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-primary transition-transform active:scale-95"
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
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        <button
          className="swiper-button-prev absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-2xl !bg-primary px-2 py-4 !h-auto !w-auto !text-white transition-all active:scale-90 md:flex"
          aria-label="Anterior"
        >
          <svg
            className="swiper-navigation-icon !h-auto !w-auto"
            width="11"
            height="20"
            viewBox="0 0 11 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0.38296 20.0762C0.111788 19.805 0.111788 19.3654 0.38296 19.0942L9.19758 10.2796L0.38296 1.46497C0.111788 1.19379 0.111788 0.754138 0.38296 0.482966C0.654131 0.211794 1.09379 0.211794 1.36496 0.482966L10.4341 9.55214C10.8359 9.9539 10.8359 10.6053 10.4341 11.007L1.36496 20.0762C1.09379 20.3474 0.654131 20.3474 0.38296 20.0762Z"
              fill="currentColor"
            />
          </svg>
        </button>
        <button
          className="swiper-button-next absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-2xl !bg-primary px-2 py-4 !h-auto !w-auto !text-white transition-all active:scale-90 md:flex"
          aria-label="Siguiente"
        >
          <svg
            className="swiper-navigation-icon !h-auto !w-auto"
            width="11"
            height="20"
            viewBox="0 0 11 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0.38296 20.0762C0.111788 19.805 0.111788 19.3654 0.38296 19.0942L9.19758 10.2796L0.38296 1.46497C0.111788 1.19379 0.111788 0.754138 0.38296 0.482966C0.654131 0.211794 1.09379 0.211794 1.36496 0.482966L10.4341 9.55214C10.8359 9.9539 10.8359 10.6053 10.4341 11.007L1.36496 20.0762C1.09379 20.3474 0.654131 20.3474 0.38296 20.0762Z"
              fill="currentColor"
            />
          </svg>
        </button>

        {/* Pagination */}
        <div className="swiper-pagination !relative !bottom-0 mt-4 flex justify-center gap-2 pb-1" />
      </div>
    </section>
  );
}
