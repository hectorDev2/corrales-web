import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";

import { POST } from "./route";

vi.mock("@/lib/supabase-admin", () => ({
  createSupabaseAdminClient: vi.fn(),
}));

const createAdminClientMock = vi.mocked(createSupabaseAdminClient);

describe("POST /api/payment/charge", () => {
  afterEach(() => vi.restoreAllMocks());

  it("charges the amount calculated by the database, not a client amount", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: 42, error: null });
    const single = vi.fn().mockResolvedValue({
      data: { id: "order-1", total: 27.5 },
      error: null,
    });
    const eq = vi.fn().mockReturnValue({ single });
    const select = vi.fn().mockReturnValue({ eq });
    createAdminClientMock.mockReturnValue({
      rpc,
      from: vi.fn().mockReturnValue({ select }),
    } as never);
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ id: "ch_123" }), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    const request = new NextRequest("http://localhost/api/payment/charge", {
      method: "POST",
      body: JSON.stringify({
        token: "tkn_test",
        email: "cliente@example.com",
        deliveryType: "delivery",
        customerName: "Cliente de prueba",
        customerPhone: "999999999",
        customerAddress: "Av. Siempre Viva 123",
        customerNotes: "Sin cebolla",
        amount: 1,
        items: [
          {
            product_id: "product-1",
            variant_id: "variant-1",
            quantity: 1,
            selected_options: [],
          },
        ],
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith("create_order", {
      p_delivery_type: "delivery",
      p_customer_name: "Cliente de prueba",
      p_customer_phone: "999999999",
      p_customer_address: "Av. Siempre Viva 123",
      p_customer_notes: "Sin cebolla",
      p_customer_location_url: null,
      p_payment_method: "culqi",
      p_total: 0,
      p_items: [
        {
          product_id: "product-1",
          variant_id: "variant-1",
          quantity: 1,
          selected_options: [],
        },
      ],
    });
    expect(response.json()).resolves.toEqual({ chargeId: "ch_123", orderNumber: 42 });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string)).toMatchObject({
      amount: 2750,
    });
  });

  it("cancels the reserved order when the payment provider is unreachable", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: 42, error: null });
    const single = vi.fn().mockResolvedValue({
      data: { id: "order-1", total: 27.5 },
      error: null,
    });
    const select = vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single }) });
    const cancelEq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn().mockReturnValue({ eq: cancelEq });
    const from = vi.fn()
      .mockReturnValueOnce({ select })
      .mockReturnValueOnce({ update });
    createAdminClientMock.mockReturnValue({ rpc, from } as never);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));

    const request = new NextRequest("http://localhost/api/payment/charge", {
      method: "POST",
      body: JSON.stringify({
        token: "tkn_test",
        email: "cliente@example.com",
        deliveryType: "delivery",
        customerName: "Cliente de prueba",
        customerPhone: "999999999",
        customerAddress: "Av. Siempre Viva 123",
        items: [{ product_id: "product-1", variant_id: "variant-1", quantity: 1 }],
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(502);
    expect(update).toHaveBeenCalledWith({ status: "cancelado" });
    expect(cancelEq).toHaveBeenCalledWith("id", "order-1");
  });
});
