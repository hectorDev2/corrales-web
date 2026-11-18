"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";
import type { Invoice, InvoiceSeries, SunatStatus } from "@/types/invoice";

import { PAGE_CONTAINER, PageHeader } from "./PageHeader";

type InvoiceRow = Invoice & { orders: { order_number: number } | null };

const SUNAT_BADGE: Record<SunatStatus, { label: string; cls: string }> = {
  accepted: { label: "Aceptado", cls: "bg-green-100 text-green-700" },
  pending: { label: "Pendiente", cls: "bg-yellow-100 text-yellow-800" },
  rejected: { label: "Rechazado", cls: "bg-red-100 text-red-600" },
};

/** Solo enlaces http(s): el PDF/XML viene de un proveedor externo. */
function safeUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:" ? u.href : null;
  } catch {
    return null;
  }
}

export function FacturacionPage() {
  const [series, setSeries] = useState<InvoiceSeries[]>([]);
  const [invoices, setInvoices] = useState<number>(0);
  const [invoiceRows, setInvoiceRows] = useState<InvoiceRow[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    const [seriesRes, countRes, listRes] = await Promise.all([
      supabase.from("invoice_series").select("*").order("type"),
      supabase.from("invoices").select("id", { count: "exact", head: true }),
      supabase
        .from("invoices")
        .select("*, orders ( order_number )")
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

    if (listRes.error) toast.error("Error cargando comprobantes");
    else setInvoiceRows(listRes.data as unknown as InvoiceRow[]);

    if (seriesRes.error) toast.error("Error cargando series");
    else setSeries(seriesRes.data as InvoiceSeries[]);

    if (countRes.count !== null) setInvoices(countRes.count);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const q = query.trim().toLowerCase();
  const filteredInvoices = q
    ? invoiceRows.filter((i) =>
        [`${i.series}-${i.number}`, i.customer_business_name ?? "", i.customer_doc_number]
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
    : invoiceRows;

  return (
    <div className={PAGE_CONTAINER}>
      <PageHeader
        eyebrow="Operación"
        title="Facturación electrónica"
        description="RUC 20604262322 · Nubefact"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <p className="text-3xl font-black text-primary">{invoices}</p>
          <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest mt-1">
            Comprobantes emitidos
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <p className="text-3xl font-black text-primary">{series.length}</p>
          <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest mt-1">
            Series activas
          </p>
        </div>
      </div>

      {/* Series */}
      <section className="space-y-4">
        <h2 className="text-lg font-black tracking-tighter text-on-surface">Series</h2>
        {loading ? (
          <p className="text-on-surface-variant text-sm">Cargando...</p>
        ) : series.length === 0 ? (
          <p className="text-on-surface-variant text-sm">No hay series configuradas</p>
        ) : (
          <div className="space-y-3">
            {series.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl p-5 shadow-card flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg text-on-surface">{s.series}</span>
                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      s.type === "boleta" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                    }`}>
                      {s.type === "boleta" ? "Boleta" : "Factura"}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Siguiente número: <strong className="text-primary">{s.current_number + 1}</strong>
                  </p>
                </div>
                <span className={`w-3 h-3 rounded-full ${s.is_active ? "bg-success" : "bg-outline"}`} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Comprobantes emitidos */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-black tracking-tighter text-on-surface">
            Comprobantes emitidos
          </h2>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por número, cliente o documento"
            aria-label="Buscar comprobantes"
            className="bg-surface-container-high w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none sm:w-72"
          />
        </div>

        {loading ? (
          <p className="text-on-surface-variant text-sm">Cargando...</p>
        ) : filteredInvoices.length === 0 ? (
          <p className="text-on-surface-variant text-sm">
            {invoiceRows.length === 0 ? "Aún no se emitieron comprobantes." : "Sin resultados."}
          </p>
        ) : (
          <div className="space-y-3">
            {filteredInvoices.map((inv) => {
              const badge = SUNAT_BADGE[inv.sunat_status];
              const pdf = safeUrl(inv.pdf_url);
              const xml = safeUrl(inv.xml_url);
              return (
                <div
                  key={inv.id}
                  className="bg-white rounded-2xl p-5 shadow-card flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-on-surface">
                        {inv.series}-{String(inv.number).padStart(8, "0")}
                      </span>
                      <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        inv.invoice_type === "boleta" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                      }`}>
                        {inv.invoice_type === "boleta" ? "Boleta" : "Factura"}
                      </span>
                      <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface truncate">
                      {inv.customer_business_name ?? "Cliente varios"}{" "}
                      <span className="text-on-surface-variant">
                        · {inv.customer_doc_type.toUpperCase()} {inv.customer_doc_number}
                      </span>
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {new Date(inv.created_at).toLocaleString("es-PE", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                      {inv.orders && ` · Orden #${inv.orders.order_number}`}
                    </p>
                    {inv.sunat_status === "rejected" && inv.sunat_message && (
                      <p className="text-xs text-error">{inv.sunat_message}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-black text-primary">S/ {inv.total.toFixed(2)}</span>
                    {pdf ? (
                      <a
                        href={pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-primary text-on-primary flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider"
                      >
                        <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                        Ver PDF
                      </a>
                    ) : (
                      <span className="text-outline text-xs font-bold uppercase">Sin PDF</span>
                    )}
                    {xml && (
                      <a
                        href={xml}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-surface-container-high text-on-surface-variant rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider"
                      >
                        XML
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Info */}
      <div className="bg-white rounded-2xl p-5 shadow-card space-y-2">
        <h3 className="text-sm font-bold text-on-surface">Configuración</h3>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Las series se configuran desde la migración de base de datos. Por defecto:
          <br />- <strong>BDEV</strong> para Boletas (delivery)
          <br />- <strong>FDEV</strong> para Facturas (delivery)
        </p>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Para emitir un comprobante, andá a la orden correspondiente y hacé clic en
          &quot;Emitir comprobante&quot;.
        </p>
      </div>
    </div>
  );
}
