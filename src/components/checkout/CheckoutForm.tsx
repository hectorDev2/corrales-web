"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { type StoredLocation, useGeolocation } from "@/hooks/useGeolocation";
import { createOrder } from "@/lib/api/orders";
import { useCartStore } from "@/store/cart";

import { type CheckoutFormData, checkoutSchema } from "./checkoutSchema";
import { MapboxAutocomplete, reverseGeocode } from "./MapboxAutocomplete";
import { OrderSummary } from "./OrderSummary";
import { UpsellSection } from "./UpsellSection";

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

  const publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY;
  if (!publicKey) {
    toast.error(
      "⚠️ La llave pública de Culqi no está configurada. Agregá NEXT_PUBLIC_CULQI_PUBLIC_KEY en las variables de entorno.",
      { duration: 8000 },
    );
    return;
  }

  let instance: ReturnType<typeof CulqiCheckout>;
  try {
    instance = new CulqiCheckout(publicKey, {
      title: "Pollería Corrales",
      currency: "PEN",
      amount: amountInCents,
    });
  } catch {
    toast.error(
      "⚠️ La llave pública de Culqi no es válida. Verificá el valor de NEXT_PUBLIC_CULQI_PUBLIC_KEY.",
      { duration: 8000 },
    );
    return;
  }

  instance.culqi = function () {
    if (instance.token) {
      onToken(instance.token.id, instance.token.email);
    } else if (instance.error) {
      const msg: string = instance.error.user_message ?? "";
      if (
        msg.toLowerCase().includes("llave") ||
        msg.toLowerCase().includes("pública") ||
        msg.toLowerCase().includes("válida")
      ) {
        toast.error(`⚠️ Culqi: ${msg} — Verificá la llave pública en las variables de entorno.`, {
          duration: 8000,
        });
      } else {
        onError(msg || "Error en el pago.");
      }
    }
  };

  instance.open();
}

function isStoreOpen() {
  const now = new Date();
  const min = now.getHours() * 60 + now.getMinutes();
  return min >= 660 && min < 1320; // 11:00 - 22:00
}

type CheckoutStep = 1 | 2 | 3;

const CHECKOUT_STEPS: Array<{ number: CheckoutStep; label: string }> = [
  { number: 1, label: "Cliente" },
  { number: 2, label: "Entrega" },
  { number: 3, label: "Pago" },
];

export function CheckoutForm() {
  const { items, total, clearCart } = useCartStore();
  const router = useRouter();
  const [storeOpen, setStoreOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<CheckoutStep>(1);
  const [highestStepReached, setHighestStepReached] = useState<CheckoutStep>(1);

  useEffect(() => {
    setStoreOpen(isStoreOpen());
  }, []);

  const { getStored, requestLocation } = useGeolocation();
  const [location, setLocation] = useState<StoredLocation | null>(() => getStored());
  const [mapboxCoords, setMapboxCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [needsHouseNumber, setNeedsHouseNumber] = useState(false);
  const [baseAddress, setBaseAddress] = useState("");

  async function handleLocation() {
    if (!navigator.geolocation) {
      toast.error("Tu dispositivo no soporta geolocalización.");
      return;
    }
    setLocLoading(true);
    const loc = await requestLocation();
    setLocLoading(false);
    if (loc) {
      setLocation(loc);
      setMapboxCoords({ lat: loc.lat, lng: loc.lng });
      const address = await reverseGeocode(loc.lat, loc.lng);
      if (address) {
        setValue("address", address, { shouldValidate: true });
        setBaseAddress(address);
        setNeedsHouseNumber(!/\d/.test(address));
        toast.success("Dirección obtenida desde tu ubicación.");
      } else {
        toast.success("Ubicación capturada correctamente.");
      }
    } else {
      toast.error("No se pudo obtener la ubicación. Verificá los permisos.");
    }
  }

  const {
    control,
    register,
    handleSubmit,
    trigger,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { deliveryType: "delivery" },
  });

  const deliveryType = useWatch({ control, name: "deliveryType" });
  const addressValue = useWatch({ control, name: "address" });

  async function onSubmit(data: CheckoutFormData) {
    if (!storeOpen) {
      toast.error("La tienda está cerrada. El horario es desde 11:00 AM hasta 10:00 PM.");
      return;
    }
    const amountInCents = Math.round(total() * 100);

    const coords = mapboxCoords ?? location;
    const locationUrl = coords
      ? `https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}`
      : undefined;

    openCulqiModal(
      amountInCents,
      async (tokenId, email) => {
        setIsPaying(true);
        try {
          const res = await fetch("/api/payment/charge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token: tokenId,
              email,
              deliveryType: data.deliveryType,
              customerName: data.name,
              customerPhone: data.phone,
              customerAddress: data.address,
              customerNotes: data.notes,
              customerLocationUrl: locationUrl,
              items: items.map((item) => ({
                product_id: item.product.id,
                variant_id: item.variant.id,
                quantity: item.quantity,
                selected_options: Object.values(item.selectedOptions).flatMap((options) =>
                  options.map((option) => ({
                    option_id: option.optionId,
                    quantity: option.quantity,
                  })),
                ),
              })),
            }),
          });

          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error ?? "Pago rechazado.");
          }

          const { orderNumber } = (await res.json()) as { orderNumber: number };

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

  async function onDemoSubmit(data: CheckoutFormData) {
    if (!storeOpen) {
      toast.error("La tienda está cerrada. El horario es desde 11:00 AM hasta 10:00 PM.");
      return;
    }
    const coords = mapboxCoords ?? location;
    const locationUrl = coords
      ? `https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}`
      : undefined;
    setIsPaying(true);
    try {
      const orderNumber = await createOrder({
        customerName: data.name,
        customerPhone: data.phone,
        deliveryType: data.deliveryType,
        customerAddress: data.address,
        customerNotes: data.notes,
        customerLocationUrl: locationUrl,
        paymentMethod: "cash",
        items,
        total: total(),
      });
      toast.success(`¡Pedido #${orderNumber} confirmado! Te contactaremos pronto.`);
      clearCart();
      router.push("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No pudimos crear el pedido.");
    } finally {
      setIsPaying(false);
    }
  }

  const isLoading = isSubmitting || isPaying;

  async function goToNextStep() {
    if (activeStep === 3) return;

    const fieldsByStep: Record<1 | 2, Array<keyof CheckoutFormData>> = {
      1: ["name", "phone"],
      2: ["deliveryType", "address"],
    };
    const isValid = await trigger(fieldsByStep[activeStep]);
    if (!isValid) return;

    const nextStep = (activeStep + 1) as CheckoutStep;
    setActiveStep(nextStep);
    setHighestStepReached((current) => Math.max(current, nextStep) as CheckoutStep);
  }

  function goToStep(step: CheckoutStep) {
    if (step <= highestStepReached) setActiveStep(step);
  }

  return (
    <>
      <Script src="https://js.culqi.com/checkout-js" strategy="lazyOnload" />

      <div className="mx-auto max-w-6xl px-4 py-8">
        {!storeOpen && (
          <div className="bg-error/10 border-error/30 mb-8 flex items-start gap-3 rounded-3xl border-2 p-5">
            <span
              className="material-symbols-outlined text-error mt-0.5 shrink-0"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              schedule
            </span>
            <div>
              <p className="text-error text-sm font-black tracking-wider uppercase">
                Tienda cerrada
              </p>
              <p className="text-on-surface mt-0.5 text-sm">
                La tienda está cerrada, el horario es desde 11:00 AM hasta 10:00 PM.
              </p>
            </div>
          </div>
        )}

        <header className="mb-8">
          <h1 className="text-on-surface mb-2 text-3xl font-black tracking-tighter">
            Finalizar Pedido
          </h1>
          <p className="text-on-surface-variant leading-relaxed">
            Completa tus datos para disfrutar del mejor sabor a la brasa.
          </p>
        </header>

        <nav aria-label="Progreso del checkout" className="mb-8 flex items-center justify-center">
          {CHECKOUT_STEPS.map((step, index) => {
            const isActive = step.number === activeStep;
            const isAvailable = step.number <= highestStepReached;
            return (
              <div key={step.number} className="flex items-center">
                <button
                  type="button"
                  disabled={!isAvailable}
                  aria-current={isActive ? "step" : undefined}
                  onClick={() => goToStep(step.number)}
                  className="flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span
                    className={`flex size-9 items-center justify-center rounded-full text-sm font-black transition-colors ${
                      isActive
                        ? "bg-primary text-white"
                        : isAvailable
                          ? "bg-primary/15 text-primary"
                          : "bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    {step.number}
                  </span>
                  <span
                    className={`hidden text-sm font-bold sm:inline ${isActive ? "text-primary" : "text-on-surface-variant"}`}
                  >
                    {step.label}
                  </span>
                </button>
                {index < CHECKOUT_STEPS.length - 1 && (
                  <span className="bg-outline-variant mx-3 h-px w-8 sm:mx-5 sm:w-14" />
                )}
              </div>
            );
          })}
        </nav>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 items-start gap-8 md:grid-cols-2"
        >
          {/* ── Left: Customer data ──────────────────────── */}
          <section className="space-y-6">
            <div className="shadow-card space-y-6 rounded-3xl bg-white p-6">
              <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                >
                  person
                </span>
                {activeStep === 1
                  ? "Datos del Cliente"
                  : activeStep === 2
                    ? "Datos de Entrega"
                    : "Pago seguro"}
              </h2>

              {activeStep === 1 && (
                <>
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-on-surface-variant ml-1 text-xs font-bold tracking-widest uppercase">
                      Nombre Completo
                    </label>
                    <input
                      {...register("name")}
                      type="text"
                      placeholder="Ej. Juan Pérez"
                      className="bg-surface-container-high focus:ring-primary/20 placeholder:text-outline text-on-surface w-full rounded-xl border-none px-4 py-4 transition-all focus:ring-2 focus:outline-none"
                    />
                    {errors.name && (
                      <p className="text-error ml-1 text-xs">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-on-surface-variant ml-1 text-xs font-bold tracking-widest uppercase">
                      Teléfono / WhatsApp
                    </label>
                    <input
                      {...register("phone")}
                      type="tel"
                      placeholder="999 999 999"
                      className="bg-surface-container-high focus:ring-primary/20 placeholder:text-outline text-on-surface w-full rounded-xl border-none px-4 py-4 transition-all focus:ring-2 focus:outline-none"
                    />
                    {errors.phone && (
                      <p className="text-error ml-1 text-xs">{errors.phone.message}</p>
                    )}
                  </div>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    Usaremos estos datos para confirmar tu pedido y comunicarnos con vos.
                  </p>
                </>
              )}

              {activeStep === 2 && (
                <div className="space-y-6">
                  {/* Delivery type toggle */}
                  <div className="space-y-3">
                    <label className="text-on-surface-variant ml-1 text-xs font-bold tracking-widest uppercase">
                      Tipo de Entrega
                    </label>
                    <div className="bg-surface-container-highest flex rounded-2xl p-1">
                      {["delivery", "pickup"].map((type) => (
                        <label key={type} className="flex-1 cursor-pointer">
                          <input
                            {...register("deliveryType")}
                            type="radio"
                            value={type}
                            className="sr-only"
                          />
                          <span
                            className={`block rounded-xl px-4 py-3 text-center text-sm font-bold transition-all ${
                              deliveryType === type
                                ? "bg-primary text-on-primary shadow-primary/20 shadow-lg"
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
                      <label className="text-on-surface-variant ml-1 text-xs font-bold tracking-widest uppercase">
                        Dirección de entrega
                      </label>
                      <MapboxAutocomplete
                        value={addressValue}
                        onChange={(val) => setValue("address", val, { shouldValidate: true })}
                        onCoordinates={(lat, lng) => setMapboxCoords({ lat, lng })}
                      />
                      {needsHouseNumber && (
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-on-surface-variant shrink-0 text-[11px] font-bold tracking-widest uppercase">
                            Nro de casa
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="123"
                            autoFocus
                            onChange={(e) => {
                              const nro = e.target.value;
                              if (nro) {
                                setValue("address", `${baseAddress} ${nro}`, {
                                  shouldValidate: true,
                                });
                              } else {
                                setValue("address", baseAddress, { shouldValidate: true });
                              }
                            }}
                            className="bg-surface-container-high text-on-surface focus:ring-primary/20 w-16 rounded-lg px-2 py-1.5 text-center text-sm font-bold focus:ring-2 focus:outline-none"
                          />
                          <span className="text-outline text-[11px]">
                            Sin número → dejalo vacío
                          </span>
                        </div>
                      )}
                      {errors.address && (
                        <p className="text-error ml-1 text-xs">{errors.address.message}</p>
                      )}
                    </div>
                  )}

                  {/* Ubicación (solo para delivery) */}
                  {deliveryType === "delivery" && (
                    <div className="space-y-3">
                      <div>
                        <p className="text-on-surface-variant mb-0.5 ml-1 text-xs font-bold tracking-widest uppercase">
                          Tu Ubicación{" "}
                          <span className="text-outline font-normal tracking-normal normal-case">
                            (opcional)
                          </span>
                        </p>
                        <p className="text-on-surface-variant ml-1 text-[11px] leading-relaxed">
                          Compartí tu ubicación para que podamos orientarte o coordinar el acceso.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleLocation}
                        disabled={locLoading}
                        className="border-outline-variant bg-surface-container hover:border-primary hover:bg-primary/5 flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-4 transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span
                          className={`material-symbols-outlined text-primary transition-all ${locLoading ? "animate-spin" : ""}`}
                          style={{
                            fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                          }}
                        >
                          {locLoading
                            ? "progress_activity"
                            : location
                              ? "my_location"
                              : "location_on"}
                        </span>
                        <span className="text-on-surface text-sm font-bold">
                          {locLoading
                            ? "Obteniendo ubicación..."
                            : location
                              ? "Ubicación capturada"
                              : "Usar mi ubicación actual"}
                        </span>
                      </button>

                      {location && (
                        <p className="text-on-surface-variant ml-1 flex items-center gap-1 text-xs">
                          <span
                            className="material-symbols-outlined text-sm"
                            style={{
                              fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                            }}
                          >
                            pin_drop
                          </span>
                          Coordenadas: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  <div className="space-y-1.5">
                    <label className="text-on-surface-variant ml-1 text-xs font-bold tracking-widest uppercase">
                      Notas del pedido
                    </label>
                    <textarea
                      {...register("notes")}
                      rows={3}
                      placeholder="Ej. Sin cremas, la puerta es roja, etc."
                      className="bg-surface-container-high focus:ring-primary/20 placeholder:text-outline text-on-surface w-full resize-none rounded-xl border-none px-4 py-4 transition-all focus:ring-2 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <p className="text-on-surface-variant leading-relaxed">
                  Revisá el resumen de tu pedido y elegí una forma de pago segura para confirmar la
                  compra.
                </p>
              )}
            </div>
          </section>

          {/* ── Right: Order summary + payment ───────────── */}
          <aside className="space-y-6 md:sticky md:top-24">
            <OrderSummary />
            <UpsellSection />

            <div className="shadow-card space-y-4 rounded-3xl bg-white p-6">
              {activeStep < 3 && (
                <button
                  type="button"
                  onClick={() => void goToNextStep()}
                  className="bg-primary text-on-primary shadow-primary/30 flex w-full items-center justify-center gap-3 rounded-2xl py-5 text-lg font-black tracking-tight shadow-lg transition-all hover:scale-[1.02] active:scale-95"
                >
                  Continuar
                  <span className="material-symbols-outlined text-xl" aria-hidden="true">
                    arrow_forward
                  </span>
                </button>
              )}

              {activeStep === 3 && (
                <>
                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-primary text-on-primary shadow-primary/30 flex w-full items-center justify-center gap-3 rounded-2xl py-5 text-lg font-black tracking-tight shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="material-symbols-outlined animate-spin text-xl"
                          style={{
                            fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                          }}
                        >
                          progress_activity
                        </span>
                        Procesando pago...
                      </>
                    ) : (
                      <>
                        <span
                          className="material-symbols-outlined text-xl"
                          style={{
                            fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                          }}
                        >
                          credit_card
                        </span>
                        Pagar con Culqi
                      </>
                    )}
                  </button>

                  {/* Demo button */}
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleSubmit(onDemoSubmit)}
                    className="border-outline-variant text-on-surface-variant hover:border-outline hover:text-on-surface flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-4 text-sm font-bold tracking-tight transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span
                      className="material-symbols-outlined text-base"
                      style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                    >
                      play_circle
                    </span>
                    Simular compra (demo)
                  </button>

                  <p className="text-outline flex items-center justify-center gap-1 text-center text-[10px] font-bold tracking-widest uppercase">
                    <span
                      className="material-symbols-outlined text-xs"
                      style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                    >
                      shield
                    </span>
                    Pago 100% Seguro · Powered by Culqi
                  </p>
                </>
              )}
            </div>
          </aside>
        </form>
      </div>
    </>
  );
}
