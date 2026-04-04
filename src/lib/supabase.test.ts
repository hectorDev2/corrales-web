import { describe, expect, it } from "vitest";
import { supabase } from "./supabase";

describe("supabase client", () => {
  it("should initialize correctly", () => {
    expect(supabase).toBeDefined();
  });

  it("should be able to reach the database", async () => {
    const { error } = await supabase.from("categories").select("id").limit(1);
    expect(error).toBeNull();
  });
});
