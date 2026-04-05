"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { createOrder } from "@/lib/api/orders";
import { useCartStore } from "@/store/cart";

import { type CheckoutFormData, checkoutSchema } from "./checkoutSchema";
import { OrderSummary } from "./OrderSummary";

function openCulqiModal(
  amountInCents: number,
  onToken: (tokenId: string, email: string) => void,
  onError: (msg: string) => void,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CulqiCheckout = (window as any).CulqiCheckout;
  if (!CulqiCheckout) {
    toast.error("Cargando pasarela de pago, intentá en un momento.");
    return;
  }

  const instance = new CulqiCheckout(
    process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY!,
    {
      title: "Pollería Corrales",
      currency: "PEN",
      amount: amountInCents,
    },
  );

  instance.culqi = function () {
    if (instance.token) {
      onToken(instance.token.id, instance.token.email);
    } else if (instance.error) {
      onError(instance.error.user_message ?? "Error en el pago.");
    }
  };

  instance.open();
}

export function CheckoutForm() {
  const { items, total, clearCart } = useCartStore();
  const router = useRouter();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  function handleLocation() {
    if (!navigator.geolocation) {
      toast.error("Tu dispositivo no soporta geolocalización.");
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocLoading(false);
        toast.success("Ubicación capturada correctamente.");
      },
      () => {
        setLocLoading(false);
        toast.error("No se pudo obtener la ubicación. Verificá los permisos.");
      },
      { timeout: 8000 },
    );
  }

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { deliveryType: "delivery" },
  });

  const deliveryType = useWatch({ control, name: "deliveryType" });

  async function onSubmit(data: CheckoutFormData) {
    const amountInCents = Math.round(total() * 100);

    const locationUrl = location
      ? `https://maps.google.com/?q=${location.lat},${location.lng}`
      : undefined;

    openCulqiModal(
      amountInCents,
      async (tokenId, email) => {
        setIsPaying(true);
        try {
          const res = await fetch("/api/payment/charge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: tokenId, amount: amountInCents, email }),
          });

          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error ?? "Pago rechazado.");
          }

          const orderNumber = await createOrder({
            customerName: data.name,
            customerPhone: data.phone,
            deliveryType: data.deliveryType,
            customerAddress: data.address,
            customerNotes: data.notes,
            customerLocationUrl: locationUrl,
            paymentMethod: "culqi",
            items,
            total: total(),
          });

          toast.success(`¡Pedido #${orderNumber} confirmado! Te contactaremos pronto.`);
          clearCart();
          router.push("/");
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "No pudimos procesar el pago.");
        } finally {
          setIsPaying(false);
        }
      },
      (errMsg) => toast.error(errMsg),
    );
  }

  const isLoading = isSubmitting || isPaying;

  return (
    <>
      <Script src="https://js.culqi.com/checkout-js" strategy="lazyOnload" />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-black tracking-tighter text-on-surface mb-2">
            Finalizar Pedido
          </h1>
          <p className="text-on-surface-variant leading-relaxed">
            Completa tus datos para disfrutar del mejor sabor a la brasa.
          </p>
        </header>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start"
        >
          {/* ── Left: Customer data ──────────────────────── */}
          <section className="space-y-6">
            <div className="bg-surface-container-low p-6 rounded-3xl space-y-6">
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                >
                  person
                </span>
                Datos del Cliente
              </h2>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                  Nombre Completo
                </label>
                <input
                  {...register("name")}
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  className="w-full bg-surface-container-high border-none rounded-xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline text-on-surface"
                />
                {errors.name && (
                  <p className="text-xs text-error ml-1">{errors.name.message}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                  Teléfono / WhatsApp
                </label>
                <input
                  {...register("phone")}
                  type="tel"
                  placeholder="999 999 999"
                  className="w-full bg-surface-container-high border-none rounded-xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline text-on-surface"
                />
                {errors.phone && (
                  <p className="text-xs text-error ml-1">{errors.phone.message}</p>
                )}
              </div>

              {/* Delivery type toggle */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                  Tipo de Entrega
                </label>
                <div className="flex p-1 bg-surface-container-highest rounded-2xl">
                  {(["delivery", "pickup"] as const).map((type) => (
                    <label key={type} className="flex-1 cursor-pointer">
                      <input
                        {...register("deliveryType")}
                        type="radio"
                        value={type}
                        className="sr-only"
                      />
                      <span
                        className={`block py-3 px-4 rounded-xl text-sm font-bold text-center transition-all ${
                          deliveryType === type
                            ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                            : "text-on-surface-variant hover:bg-surface-container-high"
                        }`}
                      >
                        {type === "delivery" ? "Delivery" : "Recojo en tienda"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Address (conditional) */}
              {deliveryType === "delivery" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                    Dirección de entrega
                  </label>
                  <div className="relative">
                    <span
                      className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline"
                      style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                    >
                      location_on
                    </span>
                    <input
                      {...register("address")}
                      type="text"
                      placeholder="Calle, número y urbanización"
                      className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline text-on-surface"
                    />
                  </div>
                  {errors.address && (
                    <p className="text-xs text-error ml-1">{errors.address.message}</p>
                  )}
                </div>
              )}

              {/* Location (solo para delivery) */}
              {deliveryType === "delivery" && (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1 mb-0.5">
                      Tu Ubicación{" "}
                      <span className="font-normal normal-case tracking-normal text-outline">(opcional)</span>
                    </p>
                    <p className="text-[11px] text-on-surface-variant ml-1 leading-relaxed">
                      Compartí tu ubicación para que podamos orientarte o coordinar el acceso.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleLocation}
                    disabled={locLoading}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-dashed border-outline-variant bg-surface-container transition-all hover:border-primary hover:bg-primary/5 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <span
                      className={`material-symbols-outlined text-primary transition-all ${locLoading ? "animate-spin" : ""}`}
                      style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                    >
                      {locLoading ? "progress_activity" : location ? "my_location" : "location_on"}
                    </span>
                    <span className="font-bold text-sm text-on-surface">
                      {locLoading
                        ? "Obteniendo ubicación..."
                        : location
                          ? "Ubicación capturada"
                          : "Usar mi ubicación actual"}
                    </span>
                  </button>

                  {location && (
                    <a
                      href={`https://maps.google.com/?q=${location.lat},${location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[11px] text-primary font-bold hover:underline ml-1"
                    >
                      <span
                        className="material-symbols-outlined text-sm"
                        style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                      >
                        open_in_new
                      </span>
                      Ver en Google Maps · {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                    </a>
                  )}
                </div>
              )}

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                  Notas del pedido
                </label>
                <textarea
                  {...register("notes")}
                  rows={3}
                  placeholder="Ej. Sin cremas, la puerta es roja, etc."
                  className="w-full bg-surface-container-high border-none rounded-xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline resize-none text-on-surface"
                />
              </div>
            </div>
          </section>

          {/* ── Right: Order summary + payment ───────────── */}
          <aside className="space-y-6 md:sticky md:top-24">
            <OrderSummary />

            <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-[0_12px_40px_rgba(89,65,61,0.08)] space-y-4">
              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-linear-to-br from-primary to-primary-container text-on-primary font-black py-5 rounded-2xl shadow-[0_8px_30px_rgba(158,32,22,0.3)] hover:scale-[1.02] active:scale-95 transition-all text-lg tracking-tight disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <span
                      className="material-symbols-outlined text-xl animate-spin"
                      style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                    >
                      progress_activity
                    </span>
                    Procesando pago...
                  </>
                ) : (
                  <>
                    <span
                      className="material-symbols-outlined text-xl"
                      style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                    >
                      credit_card
                    </span>
                    Pagar con Culqi
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-outline flex items-center justify-center gap-1 uppercase font-bold tracking-widest">
                <span
                  className="material-symbols-outlined text-xs"
                  style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                >
                  shield
                </span>
                Pago 100% Seguro · Powered by Culqi
              </p>
            </div>
          </aside>
        </form>
      </div>
    </>
  );
}
