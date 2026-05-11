"use client";

import { useState } from "react";
import { toast } from "sonner";

interface InvoiceModalProps {
  orderId: string;
  orderNumber: number;
  total: number;
  invoice: { id: string; series: string; number: number; sunat_status: string; pdf_url: string | null } | null;
  onClose: () => void;
}

export function InvoiceModal({ orderId, orderNumber, total, invoice, onClose }: InvoiceModalProps) {
  const [invoiceType, setInvoiceType] = useState<"boleta" | "factura">("boleta");
  const [docNumber, setDocNumber] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ numero_completo: string; pdf_url: string | null } | null>(null);
  const [error, setError] = useState("");
  const [retrying, setRetrying] = useState(false);

  const showInvoiceInfo = !retrying && invoice && result === null;
  const isAccepted = invoice?.sunat_status === "accepted";
  const isRejected = invoice?.sunat_status === "rejected";

  const isRuc = invoiceType === "factura";
  const docValid = isRuc ? docNumber.length === 11 : docNumber.length === 8;

  async function handleSend() {
    if (!docValid) {
      toast.error(isRuc ? "RUC debe tener 11 dígitos" : "DNI debe tener 8 dígitos");
      return;
    }
    if (isRuc && !businessName.trim()) {
      toast.error("Razón Social es requerida para Factura");
      return;
    }

    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/invoice/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          invoiceType,
          docType: isRuc ? "ruc" : "dni",
          docNumber,
          businessName: businessName.trim() || undefined,
          address: address.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Error al emitir comprobante");
      }

      setResult(data.invoice);
      toast.success(`Comprobante ${data.invoice.numero_completo} emitido con éxito`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error inesperado";
      setError(msg);
      toast.error(msg);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[#111111]">Emitir Comprobante</h2>
            <button onClick={onClose} className="text-on-surface-variant hover:text-[#111111] transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {result || showInvoiceInfo ? (
            /* ── Invoice result ─────────────────── */
            <div className="space-y-4 text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                result ? "bg-success/10" : isAccepted ? "bg-success/10" : "bg-red-50"
              }`}>
                <span className={`material-symbols-outlined text-3xl ${
                  result ? "text-success" : isAccepted ? "text-success" : "text-red-500"
                }`} style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
                  {result ? "check_circle" : isAccepted ? "check_circle" : "error"}
                </span>
              </div>
              <div>
                <p className="font-bold text-[#111111]">
                  {result ? "Comprobante Emitido" : isAccepted ? "Comprobante Aceptado" : "Comprobante Rechazado"}
                </p>
                <p className="text-2xl font-black text-primary mt-1">
                  {result?.numero_completo ?? `${invoice?.series}-${String(invoice?.number).padStart(8, "0")}`}
                </p>
              </div>
              {(result?.pdf_url ?? invoice?.pdf_url) && (
                <a
                  href={result?.pdf_url ?? invoice?.pdf_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                  Ver PDF
                </a>
              )}
              {!result && isRejected && (
                <button
                  onClick={() => setRetrying(true)}
                  className="w-full py-3 rounded-xl bg-primary text-white text-sm font-bold uppercase tracking-wider shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">refresh</span>
                  Reintentar con nuevo número
                </button>
              )}
              <button onClick={onClose} className="block w-full py-3 rounded-xl bg-[#f5f5f5] text-[#666666] text-sm font-bold active:scale-95 transition-all">
                Cerrar
              </button>
            </div>
          ) : (
            /* ── Form ────────────────────────── */
            <>
              <p className="text-sm text-on-surface-variant">
                Orden <strong>#{orderNumber}</strong> &middot; Total S/ {total.toFixed(2)}
              </p>

              {/* Invoice type toggle */}
              <div className="flex p-1 bg-[#f5f5f5] rounded-xl">
                {(["boleta", "factura"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setInvoiceType(t)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                      invoiceType === t ? "bg-primary text-white shadow-sm" : "text-[#666666]"
                    }`}
                  >
                    {t === "boleta" ? "Boleta" : "Factura"}
                  </button>
                ))}
              </div>

              {/* Document number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                  {isRuc ? "RUC" : "DNI"}
                </label>
                <input
                  type="text"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value.replace(/\D/g, "").slice(0, isRuc ? 11 : 8))}
                  placeholder={isRuc ? "20123456789" : "12345678"}
                  className="w-full h-12 rounded-xl border border-[#e5e5e5] px-4 text-sm text-[#111111] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Business name (only for factura) */}
              {isRuc && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                    Razón Social
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Nombre o razón social"
                    className="w-full h-12 rounded-xl border border-[#e5e5e5] px-4 text-sm text-[#111111] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              )}

              {/* Address (optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                  Dirección <span className="font-normal normal-case tracking-normal text-[#999]">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Av. Ejemplo 123"
                  className="w-full h-12 rounded-xl border border-[#e5e5e5] px-4 text-sm text-[#111111] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSend}
                disabled={sending}
                className="w-full h-12 rounded-xl bg-primary text-white text-sm font-bold uppercase tracking-wider shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                    Enviando a SUNAT...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">receipt_long</span>
                    Emitir {invoiceType === "boleta" ? "Boleta" : "Factura"}
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
