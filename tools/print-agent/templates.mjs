import { Ticket } from "./escpos.mjs";

const money = (n) => `S/ ${Number(n).toFixed(2)}`;
const fmtDate = (iso) =>
  new Date(iso).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short", timeZone: "America/Lima" });

function orderKind(o) {
  if (o.delivery_type === "dine_in") return `MESA ${o.table_label ?? "?"}`;
  return o.delivery_type === "delivery" ? "DELIVERY" : "PARA RECOGER";
}

function wrap(text, width) {
  const lines = [];
  let cur = "";
  for (const w of String(text).split(/\s+/)) {
    if ((cur + " " + w).trim().length > width) { lines.push(cur); cur = w; }
    else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}

const STATION_LABEL = { cocina: "COCINA", horno: "HORNO", barra: "BARRA" };

/** Comanda de una estación (cocina/horno/barra): sin precios, letra grande. */
export function kitchenTicket(order, cfg, station) {
  const t = new Ticket(cfg.columns);
  t.align("center").bold(true);
  if (station) t.size(2, 2).line(`*** ${STATION_LABEL[station] ?? station.toUpperCase()} ***`);
  t.size(2, 2).line(`ORDEN #${order.order_number}`).size(1, 1);
  t.size(2, 1).line(orderKind(order)).size(1, 1).bold(false);
  t.line(fmtDate(order.created_at)).align("left").hr("=");
  for (const it of order.items) {
    t.bold(true).size(1, 2).line(`${it.quantity} x ${it.product_name}`).size(1, 1).bold(false);
    if (it.variant_label) t.line(`    (${it.variant_label})`);
  }
  if (order.customer_notes) {
    t.hr();
    t.bold(true).line("NOTAS:").bold(false);
    for (const l of wrap(order.customer_notes, cfg.columns)) t.line(l);
  }
  t.hr("=").cut();
  return t.build();
}

/** Boleta / comprobante para el cliente. */
export function receiptTicket(order, cfg) {
  const t = new Ticket(cfg.columns);
  t.align("center").bold(true).size(2, 2).line(cfg.businessName ?? "").size(1, 1).bold(false);
  if (order.invoice) {
    t.bold(true).line("BOLETA DE VENTA ELECTRONICA").bold(false);
    t.line(`${order.invoice.series}-${String(order.invoice.number).padStart(8, "0")}`);
  } else {
    t.line("COMPROBANTE DE PEDIDO (no valido como boleta)");
  }
  t.align("left").hr();
  t.line(`Orden: #${order.order_number}   ${orderKind(order)}`);
  t.line(`Fecha: ${fmtDate(order.created_at)}`);
  t.line(`Cliente: ${order.customer_name}`);
  if (order.customer_address) for (const l of wrap(`Dir: ${order.customer_address}`, cfg.columns)) t.line(l);
  t.hr();
  for (const it of order.items) {
    const label = `${it.quantity} x ${it.product_name}${it.variant_label ? ` (${it.variant_label})` : ""}`;
    const price = money(it.quantity * it.unit_price);
    const room = cfg.columns - price.length - 1;
    const parts = wrap(label, room);
    t.row(parts[0] ?? "", price);
    for (const p of parts.slice(1)) t.line(`  ${p}`);
  }
  t.hr();
  t.bold(true).size(1, 2).row("TOTAL", money(order.total)).size(1, 1).bold(false);
  const pay = { yape: "Yape", cash: "Efectivo", culqi: "Tarjeta" }[order.payment_method] ?? order.payment_method;
  t.line(`Pago: ${pay}`);
  t.align("center").line().line("Gracias por su preferencia!").cut();
  return t.build();
}
