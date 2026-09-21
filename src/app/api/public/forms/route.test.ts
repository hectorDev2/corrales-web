import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";

import { POST } from "./route";

vi.mock("@/lib/supabase-admin", () => ({
  createSupabaseAdminClient: vi.fn(),
}));

function requestWithJson(body: unknown) {
  return new NextRequest("http://localhost/api/public/forms", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/public/forms", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("persists a newsletter subscription", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createSupabaseAdminClient).mockReturnValue({
      from: vi.fn().mockReturnValue({ upsert }),
    } as never);

    const response = await POST(
      requestWithJson({
        type: "newsletter",
        name: "Ana Pérez",
        email: "ANA@example.com",
      }),
    );

    expect(response.status).toBe(200);
    expect(upsert).toHaveBeenCalledWith(
      { name: "Ana Pérez", email: "ana@example.com" },
      { onConflict: "email", ignoreDuplicates: true },
    );
  });

  it("rejects corporate requests without privacy consent", async () => {
    const from = vi.fn();
    vi.mocked(createSupabaseAdminClient).mockReturnValue({ from } as never);

    const response = await POST(
      requestWithJson({
        formType: "corporate-sales",
        name: "Ana",
        lastName: "Pérez",
        email: "ana@example.com",
        phoneNumber: "999999999",
        privacyPolicy: false,
      }),
    );

    expect(response.status).toBe(400);
    expect(from).not.toHaveBeenCalled();
  });

  it("rejects unsupported CV content before touching storage", async () => {
    const upload = vi.fn();
    vi.mocked(createSupabaseAdminClient).mockReturnValue({
      storage: { from: vi.fn().mockReturnValue({ upload }) },
    } as never);

    const formData = new FormData();
    formData.set("formType", "careers");
    formData.set("name", "Ana Pérez");
    formData.set("email", "ana@example.com");
    formData.set("privacyPolicy", "true");
    formData.set("resume", new File(["not an image"], "cv.txt", { type: "text/plain" }));

    const response = await POST(
      new NextRequest("http://localhost/api/public/forms", {
        method: "POST",
        body: formData,
      }),
    );

    expect(response.status).toBe(400);
    expect(upload).not.toHaveBeenCalled();
  });
});
