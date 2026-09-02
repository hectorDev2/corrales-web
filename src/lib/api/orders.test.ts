import { describe, expect, it, vi } from "vitest";

import { supabase } from "@/lib/supabase";

import { createOrder } from "./orders";

vi.mock("@/lib/supabase", () => ({
  supabase: { rpc: vi.fn() },
}));

describe("createOrder", () => {
  it("sends only catalog identifiers and quantities to the pricing RPC", async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ data: 42, error: null } as never);

    await createOrder({
      customerName: "Cliente",
      customerPhone: "999999999",
      deliveryType: "delivery",
      paymentMethod: "cash",
      items: [
        {
          key: "variant-1",
          product: {
            id: "product-1",
            name: "Nombre manipulado",
            description: "Descripción",
            image: { src: "/image.webp", alt: "Imagen" },
            category: "Pollo",
            variants: [],
          },
          variant: {
            id: "variant-1",
            label: "Etiqueta manipulada",
            price: 0.01,
            sort_order: 0,
          },
          quantity: 2,
          selectedOptions: {
            "group-1": [{ optionId: "option-1", quantity: 1 }],
          },
        },
      ],
      total: 0.02,
    });

    expect(supabase.rpc).toHaveBeenCalledWith(
      "create_order",
      expect.objectContaining({
        p_items: [
          {
            product_id: "product-1",
            variant_id: "variant-1",
            quantity: 2,
            selected_options: [{ option_id: "option-1", quantity: 1 }],
          },
        ],
      }),
    );

    const payload = vi.mocked(supabase.rpc).mock.calls[0][1] as {
      p_items: Record<string, unknown>[];
    };
    expect(payload.p_items[0]).not.toHaveProperty("unit_price");
    expect(payload.p_items[0]).not.toHaveProperty("product_name");
  });
});
