"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";
import type { InvoiceSeries } from "@/types/invoice";

export function FacturacionPage() {
  const [series, setSeries] = useState<InvoiceSeries[]>([]);
  const [invoices, setInvoices] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [seriesRes, countRes] = await Promise.all([
      supabase.from("invoice_series").select("*").order("type"),
      supabase.from("invoices").select("id", { count: "exact", head: true }),
    ]);

    if (seriesRes.error) toast.error("Error cargando series");
    else setSeries(seriesRes.data as InvoiceSeries[]);

    if (countRes.count !== null) setInvoices(countRes.count);
    setLoading(false);
  }

  return (
    <div className="max-w-2xl md:max-w-5xl lg:max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
      <header>
        <h1 className="text-3xl font-black tracking-tighter text-on-surface">
          Facturación Electrónica
        </h1>
        <p className="text-on-surface-variant mt-1">
          RUC: <strong>20604262322</strong> &middot; Nubefact
        </p>
      </header>

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
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
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
