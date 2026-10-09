"use client";

import { useCallback, useEffect, useState } from "react";

const STAGES = [
  { short: "Vacío", label: "Estructura vacía" },
  { short: "Navbar", label: "Navbar" },
  { short: "Hero", label: "Hero" },
  { short: "Contenido", label: "Contenido" },
  { short: "Productos", label: "Productos" },
  { short: "Funciones", label: "Funcionalidades" },
  { short: "Completa", label: "Página completa" },
] as const;

const PRODUCTS = [
  { name: "Clásico Corrales", price: "S/ 34.90", icon: "🍗", tone: "from-amber-50 to-orange-100" },
  { name: "Parrilla especial", price: "S/ 42.90", icon: "🔥", tone: "from-red-50 to-rose-100" },
  { name: "Combo familiar", price: "S/ 69.90", icon: "🍟", tone: "from-yellow-50 to-amber-100" },
] as const;

function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className="flex items-center gap-2" aria-label="Corrales Fast Food">
      <span className="bg-primary flex size-8 items-center justify-center rounded-full text-base text-white shadow-sm">
        C
      </span>
      <span
        className={`leading-none font-black tracking-[-0.04em] ${inverse ? "text-white" : "text-[#111]"}`}
      >
        CORRALES
        <span className="text-primary block text-[7px] tracking-[0.32em]">FAST FOOD</span>
      </span>
    </div>
  );
}

function ProductPreview({ product }: { product: (typeof PRODUCTS)[number] }) {
  return (
    <article className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
      <div
        className={`flex aspect-square items-center justify-center bg-linear-to-br ${product.tone}`}
      >
        <span className="text-4xl drop-shadow-sm" aria-hidden="true">
          {product.icon}
        </span>
      </div>
      <div className="p-2">
        <p className="truncate text-[10px] font-black text-[#111]">{product.name}</p>
        <div className="mt-1 flex items-center justify-between gap-1">
          <span className="text-[10px] font-black text-[#111]">{product.price}</span>
          <span className="bg-primary flex size-5 items-center justify-center rounded-md text-sm text-white">
            +
          </span>
        </div>
      </div>
    </article>
  );
}

export function ReelBuilder() {
  const [stage, setStage] = useState(0);

  const changeStage = useCallback((nextStage: number) => {
    setStage(Math.min(Math.max(nextStage, 0), STAGES.length - 1));
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        setStage((current) => Math.min(current + 1, STAGES.length - 1));
      }
      if (event.key === "ArrowLeft") {
        setStage((current) => Math.max(current - 1, 0));
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <main className="min-h-screen bg-[#090909] px-4 py-6 text-white lg:px-8">
      <div className="mx-auto grid max-w-6xl items-start gap-6 lg:grid-cols-[minmax(280px,1fr)_430px] lg:gap-10">
        <section className="order-2 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur lg:sticky lg:top-8 lg:order-1 lg:p-7">
          <p className="text-primary text-xs font-black tracking-[0.28em] uppercase">
            Corrales · Recording mode
          </p>
          <h1 className="mt-3 text-4xl leading-none font-black tracking-tight">
            {STAGES[stage].label}
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/55">
            Construcción progresiva aislada. Usá los controles o las flechas del teclado para
            avanzar sin depender de APIs ni datos reales.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {STAGES.map((item, index) => (
              <button
                key={item.label}
                type="button"
                onClick={() => changeStage(index)}
                aria-label={item.label}
                aria-pressed={stage === index}
                className={`rounded-xl border px-3 py-3 text-left text-xs font-bold transition-all ${
                  stage === index
                    ? "border-primary bg-primary text-white shadow-lg shadow-red-950/40"
                    : "border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:text-white"
                }`}
              >
                <span className="mb-1 block text-[10px] opacity-60">0{index + 1}</span>
                {item.short}
              </button>
            ))}
          </div>

          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={() => changeStage(stage - 1)}
              disabled={stage === 0}
              aria-label="Etapa anterior"
              className="flex-1 rounded-xl border border-white/15 px-4 py-3 text-sm font-bold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
            >
              ← Anterior
            </button>
            <button
              type="button"
              onClick={() => changeStage(stage + 1)}
              disabled={stage === STAGES.length - 1}
              aria-label="Siguiente etapa"
              className="bg-primary flex-1 rounded-xl px-4 py-3 text-sm font-black transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Siguiente →
            </button>
          </div>
          <button
            type="button"
            onClick={() => changeStage(0)}
            aria-label="Reiniciar demostración"
            className="mt-3 w-full py-2 text-xs font-bold text-white/40 transition hover:text-white"
          >
            Reiniciar demostración
          </button>

          <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-5 text-xs text-white/35">
            <span className="rounded-md border border-white/10 px-2 py-1">←</span>
            <span className="rounded-md border border-white/10 px-2 py-1">→</span>
            <span>Atajos para grabar sin mostrar el cursor</span>
          </div>
        </section>

        <section
          className="order-1 mx-auto w-full max-w-[430px] lg:order-2"
          aria-label="Vista previa vertical 9:16"
        >
          <div className="relative aspect-[9/16] overflow-hidden rounded-[2rem] border-[6px] border-[#242424] bg-[#f6f6f6] shadow-2xl shadow-black">
            <div className="absolute top-2 left-1/2 z-50 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
            <div className="h-full overflow-hidden pt-5 text-[#111]">
              {stage === 0 ? (
                <div className="flex h-full flex-col items-center justify-center px-10 text-center">
                  <div className="relative mb-8 size-28">
                    <div className="border-primary/20 absolute inset-0 rounded-full border-2 border-dashed" />
                    <div className="bg-primary/10 absolute inset-4 flex items-center justify-center rounded-3xl">
                      <span
                        className="material-symbols-outlined text-primary text-5xl"
                        aria-hidden="true"
                      >
                        architecture
                      </span>
                    </div>
                  </div>
                  <p className="text-primary text-[10px] font-black tracking-[0.28em] uppercase">
                    Stage 01
                  </p>
                  <p className="mt-2 text-3xl leading-none font-black tracking-tight">
                    Empezamos con la estructura
                  </p>
                  <div className="mt-8 grid w-full gap-2">
                    <span className="h-3 w-3/4 animate-pulse rounded-full bg-black/10" />
                    <span className="h-3 w-full animate-pulse rounded-full bg-black/10" />
                    <span className="h-3 w-2/3 animate-pulse rounded-full bg-black/10" />
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col overflow-hidden bg-[#f8f8f8]">
                  <header className="shrink-0 bg-white shadow-sm">
                    <div className="bg-[#111] py-1.5 text-center text-[8px] font-bold tracking-wide text-white">
                      DELIVERY GRATIS EN PEDIDOS SELECCIONADOS
                    </div>
                    <nav
                      aria-label="Navegación de demostración"
                      className="flex h-14 items-center justify-between px-4"
                    >
                      <BrandMark />
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-lg" aria-hidden="true">
                          search
                        </span>
                        <span className="bg-primary relative flex size-8 items-center justify-center rounded-full text-white">
                          <span className="material-symbols-outlined text-base" aria-hidden="true">
                            shopping_bag
                          </span>
                          {stage >= 5 && (
                            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-[#111] text-[8px] font-black">
                              1
                            </span>
                          )}
                        </span>
                      </div>
                    </nav>
                  </header>

                  {stage >= 2 && (
                    <section className="relative mx-3 mt-3 min-h-48 overflow-hidden rounded-2xl bg-[#111] px-5 py-5 text-white shadow-xl">
                      <div className="bg-primary absolute -right-8 -bottom-14 size-48 rounded-full opacity-90" />
                      <div className="absolute right-5 bottom-4 flex size-28 rotate-[-8deg] items-center justify-center rounded-full bg-linear-to-br from-amber-200 to-orange-500 text-6xl shadow-2xl">
                        🍗
                      </div>
                      <div className="relative z-10 max-w-[58%]">
                        <span className="text-primary text-[9px] font-black tracking-[0.2em] uppercase">
                          Sabor de casa
                        </span>
                        <p className="mt-2 text-[27px] leading-[0.88] font-black tracking-tight">
                          El sabor que reúne a todos
                        </p>
                        <button
                          type="button"
                          className="bg-primary mt-4 rounded-lg px-3 py-2 text-[9px] font-black tracking-wide uppercase"
                        >
                          Ver la carta
                        </button>
                      </div>
                    </section>
                  )}

                  {stage >= 3 && (
                    <section className="shrink-0 px-3 pt-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-primary text-[8px] font-black tracking-[0.2em] uppercase">
                            Para compartir
                          </p>
                          <h2 className="text-lg leading-none font-black">Promos grupales</h2>
                        </div>
                        <span className="text-primary text-[9px] font-bold">Ver todo →</span>
                      </div>
                      <div className="mt-2 flex gap-2 overflow-hidden">
                        {["Pollo a la brasa", "Parrillas", "Combos", "Bebidas"].map(
                          (category, index) => (
                            <span
                              key={category}
                              className={`shrink-0 rounded-full px-3 py-1.5 text-[8px] font-bold ${
                                index === 0
                                  ? "bg-primary text-white"
                                  : "border border-black/10 bg-white"
                              }`}
                            >
                              {category}
                            </span>
                          ),
                        )}
                      </div>
                    </section>
                  )}

                  {stage >= 4 && (
                    <section
                      className="grid shrink-0 grid-cols-3 gap-2 px-3 pt-3"
                      aria-label="Productos de demostración"
                    >
                      {PRODUCTS.map((product) => (
                        <ProductPreview key={product.name} product={product} />
                      ))}
                    </section>
                  )}

                  {stage >= 5 && (
                    <section className="mx-3 mt-3 grid shrink-0 grid-cols-[1.1fr_1fr] gap-2">
                      <div className="rounded-xl bg-[#111] p-3 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[8px] font-bold text-white/50 uppercase">
                              Tu pedido
                            </p>
                            <p className="text-[11px] font-black">1 × Clásico Corrales</p>
                          </div>
                          <span className="text-primary text-[11px] font-black">S/ 34.90</span>
                        </div>
                        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                          <div className="bg-primary h-full w-2/3 rounded-full" />
                        </div>
                      </div>
                      <div className="rounded-xl border border-black/5 bg-white p-3 shadow-sm">
                        <p className="text-[8px] font-black text-black/40 uppercase">Checkout</p>
                        <p className="mt-1 text-[10px] leading-tight font-black">
                          Cliente → Entrega → Pago
                        </p>
                        <div className="mt-2 flex gap-1">
                          {[1, 2, 3].map((step) => (
                            <span key={step} className="bg-primary h-1 flex-1 rounded-full" />
                          ))}
                        </div>
                      </div>
                    </section>
                  )}

                  {stage >= 6 && (
                    <footer className="mt-auto shrink-0 bg-[#111] px-4 py-4 text-white">
                      <div className="flex items-center justify-between">
                        <BrandMark inverse />
                        <span className="text-[8px] text-white/45">
                          Corrales. Todos los derechos reservados.
                        </span>
                      </div>
                    </footer>
                  )}

                  {stage < 6 && <div className="flex-1" />}
                </div>
              )}
            </div>
          </div>
          <p className="mt-3 text-center text-[10px] font-bold tracking-[0.22em] text-white/25 uppercase">
            9:16 · Static demo · No external requests
          </p>
        </section>
      </div>
    </main>
  );
}
