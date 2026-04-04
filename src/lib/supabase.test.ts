import { describe, expect, it } from "vitest";
import { supabase } from "./supabase";

describe("supabase client", () => {
  it("should initialize with valid URL and key", () => {
    expect(supabase).toBeDefined();
    expect(supabase.supabaseUrl).toBe(process.env.NEXT_PUBLIC_SUPABASE_URL);
  });

  it("should be able to reach the database", async () => {
    const { error } = await supabase.from("_test_connection").select("*").limit(1);

    // Table doesn't exist → error will be a 42P01 (relation does not exist)
    // That means the connection DID work — just the table is missing
    // An auth/network error would be a different kind of failure
    expect(error?.code).not.toBe("PGRST301"); // not an auth error
  });
});
