"use client";

import { useRef } from "react";

import type { Product } from "@/types/product";

import { QuickAddButton } from "./QuickAddButton";

interface KfcProductCarouselProps {
  title: string;
  products: Product[];
  href?: string;
}

function getClosestCardIndex(cards: HTMLElement[], scrollLeft: number) {
  return cards.reduce(
    (closestIndex, card, index) =>
      Math.abs(card.offsetLeft - scrollLeft) < Math.abs(cards[closestIndex].offsetLeft - scrollLeft)
        ? index
        : closestIndex,
    0,
  );
}

export function KfcProductCarousel({ title, products, href }: KfcProductCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    const el = carouselRef.current;
    if (!el) return;

    const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-product-carousel-card]"));
    if (cards.length < 2) return;

    const currentIndex = getClosestCardIndex(cards, el.scrollLeft);
    const nextIndex = Math.min(
      Math.max(currentIndex + (direction === "right" ? 1 : -1), 0),
      cards.length - 1,
    );

    if (nextIndex === currentIndex) return;

    el.scrollTo({ left: cards[nextIndex].offsetLeft, behavior: "smooth" });
  }

  if (products.length === 0) return null;

  return (
    <section className="relative py-7 md:py-10">
      <div className="mb-4 flex items-center justify-between md:mb-6">
        <h2 className="text-base font-extrabold tracking-tight md:text-xl">{title}</h2>
        {href && (
          <a
            href={href}
            className="text-primary hover:text-primary-container flex shrink-0 items-center gap-1 text-xs font-bold underline-offset-4 hover:underline md:text-sm"
          >
            Ver todos
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </a>
        )}
      </div>

      <div className="relative">
        {/* The viewport owns clipping; the track is only moved through the arrows. */}
        <div data-product-carousel-viewport className="min-w-0 overflow-hidden py-4">
          <div
            ref={carouselRef}
            data-product-carousel
            className="hide-scrollbar flex min-w-0 touch-pan-y snap-x snap-mandatory items-stretch gap-3 overflow-x-hidden md:gap-4"
          >
            {products.map((product) => {
              const variant = product.variants[0];
              const lastVariant = product.variants[product.variants.length - 1];
              const hasRange = lastVariant && lastVariant.price > (variant?.price ?? 0);

              return (
                <div
                  key={product.id}
                  data-product-carousel-card
                  className="group relative flex min-w-0 flex-[0_0_calc((100%_-_0.75rem)_/_2)] snap-start flex-col self-stretch overflow-hidden rounded-lg border border-[#ededed] bg-white shadow-[0_1px_2px_rgb(0_0_0_/_0.03)] md:flex-[0_0_calc((100%_-_3rem)_/_4)] lg:flex-[0_0_calc((100%_-_4rem)_/_5)]"
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
                  <a
                    href={`/producto/${product.id}`}
                    className="block aspect-square shrink-0 bg-[#fafafa] p-1"
                  >
                    <img
                      src={product.image.src}
                      alt={product.image.alt}
                      className="aspect-square h-full w-full object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  </a>

                  <div
                    data-product-carousel-card-content
                    className="flex h-[152px] shrink-0 flex-col p-2.5 md:h-[168px] md:p-3"
                  >
                    <h3 className="mb-1 line-clamp-2 h-9 text-sm leading-tight font-extrabold md:h-10 md:text-base">
                      <a
                        href={`/producto/${product.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {product.name}
                      </a>
                    </h3>
                    <p className="text-secondary line-clamp-2 h-8 text-[11px] leading-[1.2] md:h-10 md:text-xs">
                      {product.description}
                    </p>

                    <div className="mt-2 flex items-end justify-between gap-2">
                      <div className="min-w-0">
                        <div
                          data-product-carousel-price-meta
                          className="mb-1 flex h-5 items-center gap-2 overflow-hidden"
                        >
                          {(hasRange || product.tag) && (
                            <>
                              {product.tag && (
                                <span className="max-w-[7rem] truncate bg-[#e6f4ea] px-1.5 py-0.5 text-[10px] font-bold text-[#1e8e3e]">
                                  {product.tag}
                                </span>
                              )}
                              {hasRange && (
                                <span className="text-secondary shrink-0 text-[11px] line-through">
                                  S/ {lastVariant.price.toFixed(2)}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        <span className="text-base font-extrabold md:text-lg">
                          S/ {(variant?.price ?? 0).toFixed(2)}
                        </span>
                      </div>
                      <QuickAddButton
                        product={product}
                        className="text-primary hover:bg-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#e5e5e5] bg-white transition-all hover:text-white active:scale-90 md:h-8 md:w-8"
                      >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                      </QuickAddButton>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => scroll("left")}
          className="bg-primary hover:bg-primary-container absolute top-1/2 left-0 z-10 flex h-11 w-7 -translate-y-1/2 items-center justify-center rounded-r-lg text-white shadow-md transition-colors md:h-12 md:w-8"
          aria-label="Anterior"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <button
          onClick={() => scroll("right")}
          className="bg-primary hover:bg-primary-container absolute top-1/2 right-0 z-10 flex h-11 w-7 -translate-y-1/2 items-center justify-center rounded-l-lg text-white shadow-md transition-colors md:h-12 md:w-8"
          aria-label="Siguiente"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </section>
  );
}
