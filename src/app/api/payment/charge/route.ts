import { NextRequest, NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { Json } from "@/types/database.types";

interface PaymentItem {
  product_id: string;
  variant_id: string;
  quantity: number;
  selected_options?: Array<{ option_id: string; quantity: number }>;
}

interface PaymentRequest {
  token: string;
  email: string;
  deliveryType: "delivery" | "pickup";
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerNotes?: string;
  customerLocationUrl?: string;
  items: PaymentItem[];
}

async function cancelPendingOrder(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  orderId: string,
) {
  const { error } = await admin.from("orders").update({ status: "cancelado" }).eq("id", orderId);
  if (error) console.error("Could not cancel pending payment order:", error);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    token,
    email,
    deliveryType,
    customerName,
    customerPhone,
    customerAddress,
    customerNotes,
    customerLocationUrl,
    items,
  } = body as Partial<PaymentRequest>;

  if (
    typeof token !== "string" ||
    !token ||
    typeof email !== "string" ||
    !email ||
    (deliveryType !== "delivery" && deliveryType !== "pickup") ||
    typeof customerName !== "string" ||
    customerName.trim().length < 3 ||
    typeof customerPhone !== "string" ||
    !/^\d{9}$/.test(customerPhone) ||
    (deliveryType === "delivery" &&
      (typeof customerAddress !== "string" || customerAddress.trim().length < 5)) ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return NextResponse.json({ error: "Parámetros inválidos." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data: orderNumber, error: orderError } = await admin.rpc("create_order", {
    p_delivery_type: deliveryType,
    p_customer_name: customerName.trim(),
    p_customer_phone: customerPhone,
    p_customer_address: (customerAddress?.trim() || null) as string,
    p_customer_notes: (customerNotes?.trim() || null) as string,
    p_customer_location_url: (customerLocationUrl || null) as string,
    p_payment_method: "culqi",
    p_total: 0,
    p_items: items as PaymentItem[] as unknown as Json,
  });

  if (orderError || typeof orderNumber !== "number") {
    console.error("Payment order validation error:", orderError);
    return NextResponse.json({ error: "No se pudo validar el pedido." }, { status: 400 });
  }

  const { data: order, error: orderReadError } = await admin
    .from("orders")
    .select("id, total")
    .eq("order_number", orderNumber)
    .single();

  const amount = Math.round(Number(order?.total) * 100);
  if (orderReadError || !order || !Number.isSafeInteger(amount) || amount <= 0) {
    if (order?.id) await cancelPendingOrder(admin, order.id);
    console.error("Payment order total error:", orderReadError);
    return NextResponse.json(
      { error: "No se pudo validar el importe del pedido." },
      { status: 400 },
    );
  }

  let res: Response;
  try {
    res = await fetch("https://api.culqi.com/v2/charges", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CULQI_PRIVATE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency_code: "PEN",
        email,
        source_id: token,
        description: "Pedido Pollería Corrales",
        capture: true,
      }),
    });
  } catch (error) {
    console.error("Payment provider request failed:", error);
    return NextResponse.json(
      { error: "No pudimos confirmar el pago. Intentá nuevamente." },
      { status: 502 },
    );
  }

  const data = await res.json();

  if (!res.ok) {
    await cancelPendingOrder(admin, order.id);
    return NextResponse.json(
      { error: data.user_message ?? "El pago fue rechazado." },
      { status: 400 },
    );
  }

  return NextResponse.json({ chargeId: data.id, orderNumber });
}
