import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { sendToNubefact } from "@/lib/nubefact";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const authorization = await requireAdmin();
    if (authorization.response) return authorization.response;

    const body = await req.json();
    const { orderId, invoiceType, docType, docNumber, businessName, address } = body;

    if (!orderId || !invoiceType || !docType || !docNumber) {
      return NextResponse.json({ error: "Faltan parámetros requeridos" }, { status: 400 });
    }

    if (docType === "dni" && docNumber.length !== 8) {
      return NextResponse.json({ error: "DNI debe tener 8 dígitos" }, { status: 400 });
    }
    if (docType === "ruc" && docNumber.length !== 11) {
      return NextResponse.json({ error: "RUC debe tener 11 dígitos" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // Get the order with items
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select(`
        id, order_number, total,
        customer_name,
        order_items ( product_name, quantity, unit_price )
      `)
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }

    // Check if invoice already exists and was accepted
    const { data: existing } = await supabase
      .from("invoices")
      .select("id, series, number, sunat_status")
      .eq("order_id", orderId)
      .maybeSingle();

    if (existing?.sunat_status === "accepted") {
      return NextResponse.json(
        { error: `Ya existe un comprobante aceptado: ${existing.series}-${String(existing.number).padStart(8, "0")}` },
        { status: 409 },
      );
    }

    const seriesCode = invoiceType === "boleta" ? "BDEV" : "FDEV";

    // Get next number and increment counter (antes de enviar, para no reusar números)
    const { data: seriesRow, error: seriesErr } = await supabase
      .from("invoice_series")
      .select("id, current_number")
      .eq("series", seriesCode)
      .single();

    if (seriesErr || !seriesRow) {
      return NextResponse.json({ error: `Serie ${seriesCode} no encontrada. Creala en /admin/facturacion` }, { status: 500 });
    }

    const nextNumber = seriesRow.current_number + 1;

    await supabase
      .from("invoice_series")
      .update({ current_number: nextNumber })
      .eq("id", seriesRow.id);

    const items = (order.order_items as { product_name: string; quantity: number; unit_price: number }[]).map((i) => ({
      name: i.product_name,
      quantity: i.quantity,
      unitPrice: Number(i.unit_price),
    }));

    const denominacion = docType === "ruc" ? (businessName ?? order.customer_name) : order.customer_name;

    // Send to Nubefact
    const nubefactResult = await sendToNubefact({
      invoiceType,
      series: seriesCode,
      number: nextNumber,
      docType,
      docNumber,
      businessName: denominacion,
      address: address ?? "",
      items,
    });

    // Save or update invoice record
    if (existing?.sunat_status === "rejected") {
      await supabase
        .from("invoices")
        .update({
          series: seriesCode,
          number: nextNumber,
          sunat_status: nubefactResult.accepted ? "accepted" : "rejected",
          sunat_code: nubefactResult.sunatCode,
          sunat_message: nubefactResult.sunatDescription,
          sunat_response: nubefactResult.raw,
          pdf_url: nubefactResult.pdfUrl,
          xml_url: nubefactResult.xmlUrl,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("invoices").insert({
        order_id: orderId,
        invoice_type: invoiceType,
        series: seriesCode,
        number: nextNumber,
        customer_doc_type: docType,
        customer_doc_number: docNumber,
        customer_business_name: denominacion,
        customer_address: address ?? null,
        total: Number(order.total),
        sunat_status: nubefactResult.accepted ? "accepted" : "rejected",
        sunat_code: nubefactResult.sunatCode,
        sunat_message: nubefactResult.sunatDescription,
        sunat_response: nubefactResult.raw,
        pdf_url: nubefactResult.pdfUrl,
        xml_url: nubefactResult.xmlUrl,
      });
    }

    return NextResponse.json({
      success: true,
      invoice: {
        series: nubefactResult.serie,
        number: nubefactResult.numero,
        numero_completo: `${nubefactResult.serie}-${String(nubefactResult.numero).padStart(8, "0")}`,
        pdf_url: nubefactResult.pdfUrl,
        xml_url: nubefactResult.xmlUrl,
        sunat_status: nubefactResult.accepted ? "accepted" : "rejected",
        sunat_message: nubefactResult.sunatDescription,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno";
    console.error("Invoice send error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
