"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useState } from "react";
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
        toast.error(
          `⚠️ Culqi: ${msg} — Verificá la llave pública en las variables de entorno.`,
          { duration: 8000 },
        );
      } else {
        onError(msg || "Error en el pago.");
      }
    }
  };

  instance.open();
}

export function CheckoutForm() {
  const { items, total, clearCart } = useCartStore();
  const router = useRouter();
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
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { deliveryType: "delivery" },
  });

  const deliveryType = useWatch({ control, name: "deliveryType" });
  const addressValue = useWatch({ control, name: "address" });

  async function onSubmit(data: CheckoutFormData) {
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

  async function onDemoSubmit(data: CheckoutFormData) {
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
            <div className="bg-white p-6 rounded-3xl space-y-6 shadow-card">
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
                  <MapboxAutocomplete
                    value={addressValue}
                    onChange={(val) => setValue("address", val, { shouldValidate: true })}
                    onCoordinates={(lat, lng) => setMapboxCoords({ lat, lng })}
                  />
                  {needsHouseNumber && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant shrink-0">
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
                        className="w-16 bg-surface-container-high rounded-lg py-1.5 px-2 text-sm text-center font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <span className="text-[11px] text-outline">Sin número → dejalo vacío</span>
                    </div>
                  )}
                  {errors.address && (
                    <p className="text-xs text-error ml-1">{errors.address.message}</p>
                  )}
                </div>
              )}

              {/* Ubicación (solo para delivery) */}
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
                    <p className="text-xs text-on-surface-variant ml-1 flex items-center gap-1">
                      <span
                        className="material-symbols-outlined text-sm"
                        style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
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
            <UpsellSection />

            <div className="bg-white p-6 rounded-3xl shadow-card space-y-4">
              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-on-primary font-black py-5 rounded-2xl shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all text-lg tracking-tight disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-3"
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

              {/* Demo button */}
              <button
                type="button"
                disabled={isLoading}
                onClick={handleSubmit(onDemoSubmit)}
                className="w-full border-2 border-dashed border-outline-variant text-on-surface-variant font-bold py-4 rounded-2xl hover:border-outline hover:text-on-surface active:scale-95 transition-all text-sm tracking-tight disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span
                  className="material-symbols-outlined text-base"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                >
                  play_circle
                </span>
                Simular compra (demo)
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
