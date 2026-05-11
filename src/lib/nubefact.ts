import type { NubefactItem } from "@/types/invoice";

export interface NubefactResult {
  accepted: boolean;
  sunatCode: string;
  sunatDescription: string;
  pdfUrl: string | null;
  xmlUrl: string | null;
  cdrUrl: string | null;
  serie: string;
  numero: number;
  raw: Record<string, unknown>;
}

const API_URL = process.env.NUBEFACT_API_URL;
const API_KEY = process.env.NUBEFACT_API_KEY;

const DOC_TYPE_MAP = { dni: "1", ruc: "6" } as const;
const COMPROBANTE_MAP = { boleta: 2, factura: 1 } as const;

function getDateStr(): string {
  const d = new Date();
  const day = d.toLocaleDateString("es-PE", { day: "2-digit", timeZone: "America/Lima" });
  const month = d.toLocaleDateString("es-PE", { month: "2-digit", timeZone: "America/Lima" });
  const year = d.toLocaleDateString("es-PE", { year: "numeric", timeZone: "America/Lima" });
  return `${day}-${month}-${year}`;
}

function getTimeStr(): string {
  const d = new Date();
  return d.toLocaleTimeString("es-PE", { hour12: false, timeZone: "America/Lima" });
}

interface BuildPayloadParams {
  invoiceType: "boleta" | "factura";
  series: string;
  number: number;
  docType: "dni" | "ruc";
  docNumber: string;
  businessName: string;
  address: string;
  items: { name: string; quantity: number; unitPrice: number }[];
}

function buildPayload(params: BuildPayloadParams) {
  const igvRate = 0.18;

  let sumSubtotal = 0;
  let sumIgv = 0;
  let sumTotal = 0;

  const nubefactItems: NubefactItem[] = params.items.map((item, i) => {
    const valorUnitario = Math.round((item.unitPrice / (1 + igvRate)) * 100) / 100;
    const subtotal = Math.round((valorUnitario * item.quantity) * 100) / 100;
    const igv = Math.round((subtotal * igvRate) * 100) / 100;
    const total = Math.round((subtotal + igv) * 100) / 100;

    sumSubtotal += subtotal;
    sumIgv += igv;
    sumTotal += total;

    return {
      unidad_de_medida: "NIU",
      codigo: String(i + 1).padStart(3, "0"),
      descripcion: item.name,
      cantidad: item.quantity,
      valor_unitario: valorUnitario,
      precio_unitario: item.unitPrice,
      subtotal,
      tipo_de_igv: 1,
      igv,
      total,
    };
  });

  return {
    operacion: "generar_comprobante",
    tipo_de_comprobante: COMPROBANTE_MAP[params.invoiceType],
    serie: params.series,
    numero: params.number,
    sunat_transaction: 1,
    cliente_tipo_de_documento: DOC_TYPE_MAP[params.docType],
    cliente_numero_de_documento: params.docNumber,
    cliente_denominacion: params.businessName,
    cliente_direccion: params.address,
    cliente_email: "",
    fecha_de_emision: getDateStr(),
    hora_de_emision: getTimeStr(),
    moneda: 1,
    porcentaje_de_igv: 18,
    total_gravada: Math.round(sumSubtotal * 100) / 100,
    total_igv: Math.round(sumIgv * 100) / 100,
    total: Math.round(sumTotal * 100) / 100,
    enviar_automaticamente_a_la_sunat: false,
    items: nubefactItems,
  };
}

export async function sendToNubefact(
  params: BuildPayloadParams,
): Promise<NubefactResult> {
  if (!API_KEY) throw new Error("NUBEFACT_API_KEY no está configurado");
  if (!API_URL) throw new Error("NUBEFACT_API_URL no está configurado. Obtené tu URL desde www.nubefact.com → Api-Integración");

  const payload = buildPayload(params);

  console.log("[Nubefact] URL:", API_URL);
  console.log("[Nubefact] Payload:", JSON.stringify(payload, null, 2));

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Token token="${API_KEY}"`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  console.log("[Nubefact] Status:", res.status);
  console.log("[Nubefact] Response:", text);

  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error(`Respuesta inválida de Nubefact (status ${res.status}): ${text.slice(0, 500)}`);
  }

  const codigo = raw.codigo;

  if (!res.ok || (codigo !== undefined && codigo !== 0 && codigo !== "0")) {
    const msg
      = (Array.isArray(raw.errors) ? (raw.errors as string[]).join(", ") : undefined)
      ?? raw.errors
      ?? raw.mensaje
      ?? raw.error
      ?? `Nubefact respondió: ${JSON.stringify(raw).slice(0, 500)}`;
    throw new Error(String(msg));
  }

  const accepted = raw.aceptada_por_sunat === true || raw.sunat_responsecode === "0";

  return {
    accepted,
    sunatCode: String(raw.sunat_responsecode ?? raw.codigo ?? ""),
    sunatDescription: String(raw.sunat_description ?? raw.mensaje ?? ""),
    pdfUrl: (raw.enlace_del_pdf ?? raw.pdf_url ?? null) as string | null,
    xmlUrl: (raw.enlace_del_xml ?? raw.xml_url ?? null) as string | null,
    cdrUrl: (raw.enlace_del_cdr ?? raw.cdr_url ?? null) as string | null,
    serie: String(raw.serie ?? params.series),
    numero: Number(raw.numero ?? params.number),
    raw,
  };
}
