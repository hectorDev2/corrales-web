export type InvoiceType = "boleta" | "factura";
export type DocType = "dni" | "ruc";
export type SunatStatus = "pending" | "accepted" | "rejected";

export interface InvoiceSeries {
  id: string;
  type: InvoiceType;
  series: string;
  current_number: number;
  is_active: boolean;
}

export interface Invoice {
  id: string;
  order_id: string;
  invoice_type: InvoiceType;
  series: string;
  number: number;
  customer_doc_type: DocType;
  customer_doc_number: string;
  customer_business_name: string | null;
  customer_address: string | null;
  total: number;
  sunat_status: SunatStatus;
  sunat_code: string | null;
  sunat_message: string | null;
  sunat_response: unknown | null;
  pdf_url: string | null;
  xml_url: string | null;
  created_at: string;
}

export interface SendInvoiceInput {
  orderId: string;
  invoiceType: InvoiceType;
  docType: DocType;
  docNumber: string;
  businessName?: string;
  address?: string;
}

export interface NubefactItem {
  unidad_de_medida: string;
  codigo: string;
  descripcion: string;
  cantidad: number;
  valor_unitario: number;
  precio_unitario: number;
  subtotal: number;
  tipo_de_igv: number;
  igv: number;
  total: number;
}
