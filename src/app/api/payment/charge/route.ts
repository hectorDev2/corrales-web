import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { token, amount, email } = await req.json();

  if (!token || !amount || !email) {
    return NextResponse.json({ error: "Parámetros inválidos." }, { status: 400 });
  }

  const res = await fetch("https://api.culqi.com/v2/charges", {
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

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { error: data.user_message ?? "El pago fue rechazado." },
      { status: 400 },
    );
  }

  return NextResponse.json({ chargeId: data.id });
}
