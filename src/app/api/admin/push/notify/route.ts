import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  if (!process.env.PUSH_NOTIFY_SECRET || secret !== process.env.PUSH_NOTIFY_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { type, record } = body;

  // Solo procesar inserciones nuevas
  if (type !== "INSERT") {
    return NextResponse.json({ ok: true });
  }

  const admin = createSupabaseAdminClient();
  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth_key");

  if (!subs?.length) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  const payload = JSON.stringify({
    title: `Pedido #${record.order_number}`,
    body: `${record.delivery_type === "delivery" ? "Delivery" : "Recojo"} · ${record.customer_name} · S/ ${Number(record.total).toFixed(2)}`,
    url: "/admin",
  });

  const staleIds: string[] = [];

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth_key },
          },
          payload,
        );
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 410 || status === 404) {
          staleIds.push(sub.id);
        }
      }
    }),
  );

  if (staleIds.length) {
    await admin.from("push_subscriptions").delete().in("id", staleIds);
  }

  return NextResponse.json({ ok: true, sent: subs.length - staleIds.length });
}
