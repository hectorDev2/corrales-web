"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { createOrder } from "@/lib/api/orders";
import { useCartStore } from "@/store/cart";

import { type CheckoutFormData, checkoutSchema } from "./checkoutSchema";
import { OrderSummary } from "./OrderSummary";

const PAYMENT_OPTIONS = [
  { value: "yape", label: "Yape / Plin", icon: "qr_code_2" },
  { value: "cash", label: "Efectivo", icon: "payments" },
] as const;

export function CheckoutForm() {
  const { items, total, clearCart } = useCartStore();
  const router = useRouter();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locLoading, setLocLoading] = useState(false);

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
    defaultValues: {
      deliveryType: "delivery",
      paymentMethod: "yape",
    },
  });

  const deliveryType = useWatch({ control, name: "deliveryType" });
  const paymentMethod = useWatch({ control, name: "paymentMethod" });

  async function onSubmit(data: CheckoutFormData) {
    try {
      const locationUrl = location
        ? `https://maps.google.com/?q=${location.lat},${location.lng}`
        : undefined;

      const orderNumber = await createOrder({
        customerName: data.name,
        customerPhone: data.phone,
        deliveryType: data.deliveryType,
        customerAddress: data.address,
        customerNotes: data.notes,
        customerLocationUrl: locationUrl,
        paymentMethod: data.paymentMethod,
        items,
        total: total(),
      });

      toast.success(`¡Pedido #${orderNumber} confirmado! Te contactaremos pronto.`);
      clearCart();
      router.push("/");
    } catch {
      toast.error("No pudimos registrar tu pedido. Intentá de nuevo.");
    }
  }

  return (
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

          {/* Payment methods */}
          <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-[0_12px_40px_rgba(89,65,61,0.08)] space-y-4">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Método de Pago
            </label>

            <div className="grid grid-cols-2 gap-3">
              {PAYMENT_OPTIONS.map(({ value, label, icon }) => (
                <label key={value} className="cursor-pointer">
                  <input
                    {...register("paymentMethod")}
                    type="radio"
                    value={value}
                    className="sr-only"
                  />
                  <div
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                      paymentMethod === value
                        ? "border-primary bg-primary-fixed"
                        : "border-transparent bg-surface-container-low"
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-primary mb-1"
                      style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                    >
                      {icon}
                    </span>
                    <span className="font-bold text-sm text-on-surface">{label}</span>
                  </div>
                </label>
              ))}
            </div>

            {/* Yape QR placeholder */}
            {paymentMethod === "yape" && (
              <div className="p-4 bg-surface-container-high rounded-3xl flex flex-col items-center text-center">
                <div className="w-32 h-32 bg-white rounded-2xl p-2 mb-3 shadow-inner flex items-center justify-center">
                  <div className="w-full h-full bg-linear-to-br from-purple-600 to-indigo-800 rounded-lg opacity-20 flex items-center justify-center">
                    <span
                      className="material-symbols-outlined text-4xl"
                      style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                    >
                      qr_code_scanner
                    </span>
                  </div>
                </div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter mb-1">
                  Escanea para pagar
                </p>
                <p className="text-[10px] text-outline px-4">
                  Recuerda enviar la captura del pago por WhatsApp al finalizar.
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-linear-to-br from-primary to-primary-container text-on-primary font-black py-5 rounded-2xl shadow-[0_8px_30px_rgba(158,32,22,0.3)] hover:scale-[1.02] active:scale-95 transition-all text-lg tracking-tight disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isSubmitting ? "Confirmando..." : "Confirmar Pedido"}
            </button>

            <p className="text-center text-[10px] text-outline flex items-center justify-center gap-1 uppercase font-bold tracking-widest">
              <span
                className="material-symbols-outlined text-xs"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                shield
              </span>
              Pago 100% Seguro
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
