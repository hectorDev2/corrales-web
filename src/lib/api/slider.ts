import { supabase } from "@/lib/supabase";

export interface SliderSlide {
  id: string;
  type: "image" | "custom";
  sort_order: number;
  is_active: boolean;
  image_url: string | null;
  image_url_mobile: string | null;
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  cta_label: string | null;
  cta_href: string | null;
  bg_gradient: string | null;
  accent_color: string | null;
  icon: string | null;
}

export type SlideInput = Omit<SliderSlide, "id">;

// ─── Public ──────────────────────────────────────────────────────────────────

export async function getSlides(): Promise<SliderSlide[]> {
  const { data, error } = await supabase
    .from("slider_slides")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) return []; // tabla aún no migrada o sin slides
  return data as SliderSlide[];
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function getAdminSlides(): Promise<SliderSlide[]> {
  const { data, error } = await supabase
    .from("slider_slides")
    .select("*")
    .order("sort_order");

  if (error) throw error;
  return data as SliderSlide[];
}

export async function createSlide(input: SlideInput): Promise<void> {
  const { error } = await supabase.from("slider_slides").insert(input);
  if (error) throw error;
}

export async function updateSlide(id: string, input: Partial<SlideInput>): Promise<void> {
  const { error } = await supabase
    .from("slider_slides")
    .update(input)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteSlide(id: string): Promise<void> {
  const { error } = await supabase
    .from("slider_slides")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function toggleSlide(id: string, is_active: boolean): Promise<void> {
  const { error } = await supabase
    .from("slider_slides")
    .update({ is_active })
    .eq("id", id);
  if (error) throw error;
}

export async function reorderSlide(id: string, sort_order: number): Promise<void> {
  const { error } = await supabase
    .from("slider_slides")
    .update({ sort_order })
    .eq("id", id);
  if (error) throw error;
}

// ─── Storage ──────────────────────────────────────────────────────────────────

export async function uploadSlideImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const fileName = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("slider-images")
    .upload(fileName, file, { cacheControl: "3600", upsert: false });

  if (error) throw error;

  const { data } = supabase.storage
    .from("slider-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

export async function deleteSlideImage(url: string): Promise<void> {
  const marker = "/slider-images/";
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const fileName = url.slice(idx + marker.length);
  await supabase.storage.from("slider-images").remove([fileName]);
}
