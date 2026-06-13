"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Product } from "@/types/product";

interface Props {
  product: Product;
}

export function ProductDetailPage(_props: Props) {
  const router = useRouter();
  const [recipeQtys, setRecipeQtys] = useState<Record<string, number>>({
    Original: 6,
    Crispy: 0,
    Picante: 0,
  });

  function updateRecipe(name: string, delta: number) {
    setRecipeQtys((prev) => {
      const current = prev[name] ?? 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [name]: next };
    });
  }

  const [selectedComplement, setSelectedComplement] = useState<string | null>(null);
  const [upsellQtys, setUpsellQtys] = useState<Record<string, number>>({
    "2 Piezas de Pollo en Receta Original": 0,
    "3 Pie de Manzana": 0,
    "Inca Kola Zero Azúcar 1.5 L": 0,
  });

  function updateUpsell(name: string, delta: number) {
    setUpsellQtys((prev) => {
      const current = prev[name] ?? 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [name]: next };
    });
  }

  function totalRecipes(): number {
    return Object.values(recipeQtys).reduce((s, q) => s + q, 0);
  }

  return (
    <div className="pb-24" style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", backgroundColor: "#ffffff" }}>
      <style>{`
        .option-card { transition: background-color 0.2s; }
        .option-card:hover { background-color: #fafafa; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
      `}</style>

      <main className="mx-auto max-w-7xl px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* ── Product Preview (Left) ─────────────────────────── */}
        <section>
          <h1 className="text-3xl font-black mb-6" style={{ color: "#111" }}>Mega Delivery - 6 Piezas</h1>
          <div className="mb-6 rounded-lg overflow-hidden" style={{ backgroundColor: "#e4002b", aspectRatio: "16/10" }}>
            <img
              alt="Mega Delivery 6 Piezas"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida/AP1WRLvxkVWr-NCD3vRzMbAa1ziRw48n-UJt4IzL9VLwamtDBJDPMObVyVpY-yLKVsZSKPp6IwXJzpYmagu7x9DFEVZ5wCjxwxH3Wu1pER3DR3A2IXjKCkqws4enhtPKk3bOAjm6nbdIJJsJE8ab7WebjULP2lXDGHWegoBRh3Y3irpR1AHUgoD1T7sLlQdI0b3wDY4bhC3MCztDNW7jwwYgmbny3DdC86LiRT0Vgwdbt20QCjCbC5JVdlfdu2Gp"
            />
          </div>
          <div className="mb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black leading-none" style={{ color: "#111" }}>S/ 39.90</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm line-through" style={{ color: "#9ca3af" }}>Precio Regular S/ 65.90</span>
              <span className="text-sm font-bold" style={{ color: "#16a34a" }}>39%</span>
            </div>
          </div>
          <p className="pb-6 border-b font-medium" style={{ color: "#4b5563", borderColor: "#f0f0f0" }}>
            6 Piezas de Pollo + 1 Complemento Familiar
          </p>

          {/* Summary Checklist */}
          <div className="mt-8 space-y-4">
            <h3 className="font-black text-lg" style={{ color: "#111" }}>Personaliza tu pedido</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg border" style={{ backgroundColor: "#f8f8f8", borderColor: "#e0e0e0" }}>
                <div>
                  <p className="text-sm font-black" style={{ color: "#111" }}>Elige la Receta</p>
                  <p className="text-xs" style={{ color: "#6b7280" }}>Receta Original x 6 un</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase" style={{ backgroundColor: "#dcfce7", color: "#15803d" }}>Completado</span>
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg border" style={{ backgroundColor: selectedComplement ? "#f8f8f8" : "#ffffff", borderColor: "#e0e0e0" }}>
                <div>
                  <p className="text-sm font-black" style={{ color: "#111" }}>Elige tu complemento</p>
                  <p className="text-xs" style={{ color: "#6b7280" }}>{selectedComplement ?? "Elige 1 opción"}</p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedComplement ? (
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase" style={{ backgroundColor: "#dcfce7", color: "#15803d" }}>Completado</span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase" style={{ backgroundColor: "#f3f4f6", color: "#374151" }}>Requerido</span>
                  )}
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Product Options (Right) ───────────────────────── */}
        <section className="space-y-6">
          {/* Elige la Receta */}
          <div className="border rounded-xl overflow-hidden shadow-sm" style={{ borderColor: "#e0e0e0" }}>
            <div className="p-4 flex justify-between items-center cursor-pointer">
              <h2 className="font-black text-lg" style={{ color: "#111" }}>Elige la Receta</h2>
              <svg className="w-5 h-5" style={{ color: "#9ca3af" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
            </div>
            <div className="px-4 pb-2 flex items-center justify-between">
              <span className="text-xs italic" style={{ color: "#9ca3af" }}>{totalRecipes()} piezas seleccionadas</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase" style={{ backgroundColor: "#dcfce7", color: "#15803d" }}>Completado</span>
            </div>
            <div className="divide-y" style={{ borderColor: "#e0e0e0" }}>
              {[
                { name: "Original", img: "https://lh3.googleusercontent.com/aida/AP1WRLvhfGZx_aJxeHpLB825_bA58-Symx6Rdu3efPIOvH0prIa8uqbcy_fHQJSysULhs_8IXds-P8wpVhIQrdBBck-RFnKuFqA9cZGrkaO2tCGKQM9ZoU0VqbPl4mukl8GcMSebiyMm-nhIDjGP2Ro762nCAW0SkxdYjn36SogQIAGDH7GmcmjT2efYxPab_cSBm2HcE-duC-qnQZp-m1Q5QySifZ84VLYcrw7Swd8rScyt-Wtu_Zi1s7nS8v0" },
                { name: "Crispy", img: "https://lh3.googleusercontent.com/aida/AP1WRLunUc3FMjodsQ1AXu_kd0_zRXp9mrl7yWSN2dVEa_1PT7TE9SRTFP3VWN-CNYF87Bmn_zVtll2hIHwQutWe1CpszpPPA57C4uR9te3s6_3vpdHkjDbhPl7Je6tqQfYYs3yi803CGhhJZIHTlACLq75Z5uOGtveMx8oCVxrL3phAC5eyUjpGDChUbfVt4RO5Y5AIsYIxVN54z6H9E1Kk-x48steswkfbi3FU1u3wH4RqWVTNRLSgB9tdhsHF" },
                { name: "Picante", img: "https://lh3.googleusercontent.com/aida/AP1WRLskBnB9FHAlxEp1APrVxglvCWnynMx-9R0bhtNt8TqINNMciG1VKa3jce-UgsWHh4GymnJE-k5lajaNIiS-ViZnylNKxhC49KCarn6YoNTTOSA6ZsMitsweScYWuYCwG5K2GzsK_azZi1WBs5k-ztQmGwlHQr8Xy1r83pyyK_sFhuTkdRf-E9i62lnqAUhng5f5mbaH6y7babaPNpjMoChMNTdZ2au7Die5kQvYKnIrOP1AN3CN0WlFcL6X" },
              ].map((recipe) => {
                const qty = recipeQtys[recipe.name] ?? 0;
                const isActive = qty > 0;
                return (
                  <div key={recipe.name} className="flex items-center justify-between p-4 option-card">
                    <div className="flex items-center gap-4" style={{ color: isActive ? "#111" : "#9ca3af" }}>
                      <img alt={recipe.name} className={`w-12 h-12 rounded shadow-sm border ${isActive ? "" : "grayscale opacity-50"}`} style={{ borderColor: "#e0e0e0" }} src={recipe.img} />
                      <span className="font-bold">{recipe.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      {isActive ? (
                        <div className="flex items-center border rounded-lg p-1 bg-white" style={{ borderColor: "#d1d5db" }}>
                          <button
                            onClick={() => updateRecipe(recipe.name, -1)}
                            className="w-7 h-7 flex items-center justify-center font-bold hover:bg-gray-50 rounded-md transition-colors"
                            style={{ color: "#e4002b" }}
                          >
                            {qty === 1 ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                            ) : (
                              "-"
                            )}
                          </button>
                          <span className="w-8 text-center font-bold text-sm">{qty}</span>
                          <button
                            onClick={() => updateRecipe(recipe.name, 1)}
                            className="w-7 h-7 flex items-center justify-center font-bold hover:bg-gray-50 rounded-md transition-colors"
                            style={{ color: "#e4002b" }}
                          >+</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => updateRecipe(recipe.name, 1)}
                          className="w-8 h-8 border rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                          style={{ borderColor: "#d1d5db", color: "#9ca3af" }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Elige tu complemento */}
          <div className="border rounded-xl overflow-hidden shadow-sm" style={{ borderColor: "#e0e0e0" }}>
            <div className="p-4 flex justify-between items-center cursor-pointer">
              <h2 className="font-black text-lg" style={{ color: "#111" }}>Elige tu complemento</h2>
              <svg className="w-5 h-5" style={{ color: "#9ca3af" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
            </div>
            <div className="px-4 pb-2 flex items-center justify-between">
              <span className="text-xs italic" style={{ color: "#9ca3af" }}>Elige 1 opción</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase" style={{ backgroundColor: "#f3f4f6", color: "#374151" }}>Requerido</span>
            </div>
            <div className="divide-y" style={{ borderColor: "#e0e0e0" }}>
              {[
                { name: "Papa Familiar", price: null, img: "https://lh3.googleusercontent.com/aida/AP1WRLtcTzTrLnfjfvTXGGyYc-StFotCvX9xFq6AsaSToBHY0RadXrqwxWDjuwok2lPyPYSw7WM0MsgwLSc1eH1o0YrdZxk-__ULqS77RFB6JZXDkz4i-Zo_vv-o7yFWdk-JxAzr0YIr2ytPd3_t7smMhUapaV7qLpBmhKrjD1iGo9eegcIh4tnch41q2snTQx2ywfPju_HmvlKfFGzSERoVinoIS4An_PvEmWD8i1PE8942LvFWFN1IKa5DI7o" },
                { name: "Papa Super Familiar", price: "+ S/ 7.00", img: "https://lh3.googleusercontent.com/aida/AP1WRLsGgtnYTjayjkJvS7QDcS98Y9Z4ky0y_XYgtJvmkDO0r02oUNHwhXlaiL4x8CvkfIW5EwpAP0rN84ZqJYNA0LCOKGDzsNHXqWUgg-x1Zcgw7pqGe8GMUcjDGC66aj79g9nxFwQeUE7-o0F021Q0sCcGHbH9fDAhe_6ccbNABs8NavGN7PMfnCEXxXnN4nig6i8A_db3NcK4GmlbqzR6uK-zNGqevQNHKwxYdEdZNq4NPA7kwgMoj7k-TF_v" },
                { name: "Ensalada Familiar", price: null, img: "https://lh3.googleusercontent.com/aida/AP1WRLsYVD1MiFPyUptNYhFTr1q6pR8pw8Q76UgvpTIVFkfYcLafNszVert07skOslT5Fbi5rdzzwDSnETyST40BXskn-FHv1_ZvyOvR0rXMX_oTsujC0Q6sSCmQVXfX_ielOHi6hktVTlKMSZiRgyeSRQX9VsZ1Ydg--OZRV1o4Tu5_MSAAvxcs26ZyglHlBfklVSrf_Jv_EnUUSu3pn67DgOdqd1RKqGlQComtwrn-g8_GIZBji2q566R-hiBp" },
                { name: "Puré Familiar", price: null, img: "https://lh3.googleusercontent.com/aida/AP1WRLtedjF-JUaYgx3VUTG9f4lwXzyPKx0Io_oXxGWL76F-LRFTcefD8GVX56ufPE6tFcS3z3Hijdq2oqpJeqka0zH7g3LSYSPmXbM8qUacLR6N2gfPMM5OpiYU4JJhTcWqwzbx8QG9yUvS6RQdoQJm9-IKXKx6-p1ScDMcoqo-TAbgjp3SzPFjCe6mijPWczcbY5pBO969ez8wdbzvs9OrMyWcxcfyfHCUYmrrh_krEcYRPGL5UxY0uKCr6HON" },
              ].map((item) => (
                <label key={item.name} className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 group">
                  <div className="flex items-center gap-4">
                    <img alt={item.name} className="w-12 h-12 rounded shadow-sm border" style={{ borderColor: "#e0e0e0" }} src={item.img} />
                    <span className="font-bold" style={{ color: "#111" }}>{item.name}{item.price ? <span className="font-medium ml-1 text-sm" style={{ color: "#9ca3af" }}>{item.price}</span> : null}</span>
                  </div>
                  <input
                    className="w-5 h-5 border-gray-300"
                    style={{ accentColor: "#e4002b" }}
                    name="complemento"
                    type="radio"
                    checked={selectedComplement === item.name}
                    onChange={() => setSelectedComplement(item.name)}
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Agranda tu Mega */}
          <div className="border rounded-xl overflow-hidden shadow-sm" style={{ borderColor: "#e0e0e0" }}>
            <div className="p-4 flex justify-between items-center cursor-pointer">
              <h2 className="font-black text-lg" style={{ color: "#111" }}>Agranda tu Mega</h2>
              <svg className="w-5 h-5" style={{ color: "#9ca3af" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
            </div>
            <div className="px-4 pb-2 flex items-center justify-between">
              <span className="text-xs italic" style={{ color: "#9ca3af" }}>Opcional</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase" style={{ backgroundColor: "#f3f4f6", color: "#374151" }}>Opcional</span>
            </div>
            <div className="divide-y" style={{ borderColor: "#e0e0e0" }}>
              {[
                { name: "2 Piezas de Pollo en Receta Original", price: "+ S/ 8.00", img: "https://lh3.googleusercontent.com/aida/AP1WRLuiEQ47pnwGFY2y2IM9fFRYrTJxMAQuKa4nE_l3z--vlSbvZM86OUCqu4u3ZHGBGhbUB4ihdqqT4_qKyF0C9zwAezJrbRSje_kHf7ELPbw9fCt7hVMIgVV65p1vQjUvEGXI6u_IQWALLKqlfBCWHnrGh0nWKasogkbAT9PRyR8C1t8BmEjzQpqwfQM46Z9F-nL9vBk1ikcgG1Oksv82oqH0gWGrrYVbnIoWKJMBH5jEHTjdZd61Z5T881kV" },
                { name: "3 Pie de Manzana", price: "+ S/ 14.90", img: "https://lh3.googleusercontent.com/aida/AP1WRLue-lJKKHghb7E8heXLKELr8D5J_mhanBAJBrPgLpZcm1FbXGDPxKamTA7QRkX12w_WyG93xROWuOVGWyLbSE1nFFGVSdUhMmZ7KiMQdM-uCP6CESrBcMq3RmROu_rgDqFbHjEYu9oTm7UXf6u6yBPKloKa4ekLgtLBMrrUUaqhj2oxiMQ-VEnh_Zwx7kPrtMHWCptMl2jFiLDx3_G3av7nusLA-E54fE4lSgWaRJc3DT80a1eP2S5Nbuap" },
                { name: "Inca Kola Zero Azúcar 1.5 L", price: "+ S/ 7.90", img: "https://lh3.googleusercontent.com/aida/AP1WRLsdZD95oUUjykX28QY--zryFQ3sBqi-6G_tBpFISJ6hkgRln3F9jzSIQTBzBuJwQnKpxbdcnFoYwIyGNWyOww5g1y00WTfDyyUZsmS3p5MR2J6Kwvid2r4H3uagMtaFa5T9WpC2tsu-UI5QaWdCnaw1F98cgnnxhYtVlZKkPEGxbxXPuIDGeVAi2qUBjlqetpmJP7fYwgWf_gxEgPTZFjEi4QrcSkW3ddW9-0uR-tXBFrvHbOGcvDM7fYUX" },
              ].map((item) => {
                const qty = upsellQtys[item.name] ?? 0;
                return (
                  <div key={item.name} className="flex items-center justify-between p-4 option-card">
                    <div className="flex items-center gap-4">
                      <img alt={item.name} className="w-12 h-12 rounded shadow-sm border" style={{ borderColor: "#e0e0e0" }} src={item.img} />
                      <div className="flex flex-col">
                        <span className="font-bold text-sm" style={{ color: "#111" }}>{item.name}</span>
                        <span className="text-xs font-bold" style={{ color: "#6b7280" }}>{item.price}</span>
                      </div>
                    </div>
                    {qty > 0 ? (
                      <div className="flex items-center border rounded-lg p-1 bg-white" style={{ borderColor: "#d1d5db" }}>
                        <button
                          onClick={() => updateUpsell(item.name, -1)}
                          className="w-7 h-7 flex items-center justify-center font-bold hover:bg-gray-50 rounded-md transition-colors"
                          style={{ color: "#e4002b" }}
                        >
                          {qty === 1 ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                          ) : "-"}
                        </button>
                        <span className="w-8 text-center font-bold text-sm">{qty}</span>
                        <button
                          onClick={() => updateUpsell(item.name, 1)}
                          className="w-7 h-7 flex items-center justify-center font-bold hover:bg-gray-50 rounded-md transition-colors"
                          style={{ color: "#e4002b" }}
                        >+</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => updateUpsell(item.name, 1)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md hover:opacity-90 active:scale-95 transition-all"
                        style={{ backgroundColor: "#e4002b" }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* ── Sticky Bottom Bar ────────────────────────────────── */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 md:p-4 z-50" style={{ borderColor: "#e0e0e0", boxShadow: "0 -4px 10px rgba(0, 0, 0, 0.05)" }}>
        <div className="mx-auto max-w-7xl flex items-center gap-2 md:gap-4">
          <div className="flex items-center p-1 rounded-lg shrink-0" style={{ backgroundColor: "#f8f8f8", border: "1px solid #d1d5db" }}>
            <button className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center font-bold cursor-not-allowed" style={{ color: "#9ca3af" }}>-</button>
            <span className="w-8 md:w-10 text-center font-black text-base md:text-lg">{totalRecipes()}</span>
            <button className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center font-bold hover:bg-white rounded-md transition-colors" style={{ color: "#e4002b" }}>+</button>
          </div>
          <button
            onClick={() => router.push("/checkout")}
            className="flex-1 text-white font-black py-3 md:py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all text-sm md:text-lg tracking-wide uppercase whitespace-nowrap" style={{ backgroundColor: "#e4002b", boxShadow: "0 10px 15px -3px rgba(228, 0, 43, 0.3)" }}>
            Agregar <span className="hidden md:inline">(S/ 39.90)</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
