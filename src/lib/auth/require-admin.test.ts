import { beforeEach, describe, expect, it, vi } from "vitest";

import { createSupabaseServerClient } from "@/lib/supabase-server";

import { requireAdmin } from "./require-admin";

vi.mock("@/lib/supabase-server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

const createServerClientMock = vi.mocked(createSupabaseServerClient);

function mockSupabase({
  user = null,
  profile = null,
  profileError = null,
}: {
  user?: { id: string } | null;
  profile?: { role: "admin" | "delivery"; is_active: boolean } | null;
  profileError?: { message: string } | null;
}) {
  const single = vi.fn().mockResolvedValue({ data: profile, error: profileError });
  const eq = vi.fn().mockReturnValue({ maybeSingle: single });
  const select = vi.fn().mockReturnValue({ eq });

  createServerClientMock.mockResolvedValue({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
    from: vi.fn().mockReturnValue({ select }),
  } as never);
}

describe("requireAdmin", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects requests without a session", async () => {
    mockSupabase({});

    const result = await requireAdmin();

    expect(result.response).toBeDefined();
    if (!result.response) throw new Error("Expected authentication to be rejected");
    expect(result.response.status).toBe(401);
    await expect(result.response.json()).resolves.toEqual({ error: "No autenticado." });
  });

  it("rejects delivery users and inactive admins", async () => {
    for (const profile of [
      { role: "delivery" as const, is_active: true },
      { role: "admin" as const, is_active: false },
    ]) {
      mockSupabase({ user: { id: "user-1" }, profile });

      const result = await requireAdmin();

      expect(result.response).toBeDefined();
      if (!result.response) throw new Error("Expected authorization to be rejected");
      expect(result.response.status).toBe(403);
    }
  });

  it("allows an active admin and returns the authenticated user", async () => {
    const user = { id: "admin-1" };
    mockSupabase({ user, profile: { role: "admin", is_active: true } });

    const result = await requireAdmin();

    expect(result).toMatchObject({ user });
    expect(result.response).toBeUndefined();
  });
});
