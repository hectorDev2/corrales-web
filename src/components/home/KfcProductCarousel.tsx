"use client";

import { useRef } from "react";

import { QuickAddButton } from "./QuickAddButton";
import type { Product } from "@/types/product";

interface KfcProductCarouselProps {
  title: string;
  products: Product[];
  href?: string;
}

export function KfcProductCarousel({ title, products, href }: KfcProductCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    const el = carouselRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.8;
    el.scrollBy({ left: direction === "right" ? scrollAmount : -scrollAmount, behavior: "smooth" });
  }

  if (products.length === 0) return null;

  return (
    <section className="relative py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold uppercase tracking-tight">{title}</h2>
        {href && (
          <a
            href={href}
            className="flex items-center gap-2 text-primary font-bold text-sm hover:underline underline-offset-4 shrink-0"
          >
            Ver todos
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </a>
        )}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-14 bg-primary text-white flex items-center justify-center hover:brightness-110 transition-all hidden md:flex"
        aria-label="Anterior"
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-14 bg-primary text-white flex items-center justify-center hover:brightness-110 transition-all hidden md:flex"
        aria-label="Siguiente"
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </button>

      {/* Carousel */}
      <div
        ref={carouselRef}
        className="flex overflow-x-auto gap-3 md:gap-6 pb-4 hide-scrollbar snap-x snap-mandatory"
      >
        {products.map((product) => {
          const variant = product.variants[0];
          const lastVariant = product.variants[product.variants.length - 1];
          const hasRange = lastVariant && lastVariant.price > (variant?.price ?? 0);

          return (
            <div
              key={product.id}
              className="flex-[0_0_calc(50%-6px)] md:flex-[0_0_calc(33.333%-16px)] lg:flex-[0_0_calc(20%-1.2rem)] snap-start bg-white border border-[#F2F2F2] relative group"
              style={{ transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <a href={`/producto/${product.id}`} className="block">
                <img
                  src={product.image.src}
                  alt={product.image.alt}
                  className="w-full h-auto"
                />
              </a>

              <div className="p-2 md:p-5 flex flex-col h-auto md:min-h-[200px]">
                <h3 className="text-[14px] md:text-[18px] font-bold mb-1 md:mb-2 leading-tight">
                  <a href={`/producto/${product.id}`} className="hover:text-primary transition-colors">
                    {product.name}
                  </a>
                </h3>
                <p className="text-secondary text-[12px] md:text-[14px] leading-relaxed line-clamp-3 mb-auto">
                  {product.description}
                </p>

                <div className="mt-1 md:mt-4 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    {(hasRange || product.tag) && (
                      <div className="flex items-center gap-2 mb-1">
                        {product.tag && (
                          <span className="bg-[#e6f4ea] text-[#1e8e3e] text-[12px] font-bold px-2 py-0.5">
                            {product.tag}
                          </span>
                        )}
                        {hasRange && (
                          <span className="text-secondary line-through text-[14px]">
                            S/ {lastVariant.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    )}
                    <span className="font-bold text-[16px] md:text-[20px]">
                      S/ {(variant?.price ?? 0).toFixed(2)}
                    </span>
                  </div>
                  <QuickAddButton
                    product={product}
                    className="shrink-0 w-7 h-7 md:w-10 md:h-10 bg-primary text-white flex items-center justify-center transition-transform active:scale-90 hover:brightness-110"
                  >
                    <span className="material-symbols-outlined text-[16px] md:text-[24px]">add</span>
                  </QuickAddButton>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
