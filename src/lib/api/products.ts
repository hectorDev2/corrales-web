import { supabase } from "@/lib/supabase";
import type { Product } from "@/types/product";

// ─── Admin types ──────────────────────────────────────────────────────────────

export interface CategoryOption {
  id: string;
  name: string;
}

export interface AdminVariant {
  id: string;
  label: string | null;
  price: number;
  sort_order: number;
  is_active: boolean;
}

export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  image_src: string;
  image_alt: string;
  tag: string | null;
  is_active: boolean;
  category_id: string;
  category_name: string;
  variants: AdminVariant[];
}

export interface ProductInput {
  name: string;
  description: string;
  image_src: string;
  image_alt: string;
  tag: string | null;
  is_active: boolean;
  category_id: string;
  /** Variants without id → new inserts */
  newVariants: Array<{ label: string; price: number; sort_order: number }>;
  /** Variants with id → updates */
  updatedVariants: Array<{ id: string; label: string; price: number; sort_order: number }>;
  /** IDs of variants removed by the user → soft-delete */
  deletedVariantIds: string[];
}

// ─── Admin queries ────────────────────────────────────────────────────────────

export async function getAdminProducts(): Promise<AdminProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id, name, description, image_src, image_alt, tag, is_active, category_id,
      categories ( name ),
      product_variants ( id, label, price, sort_order, is_active )
    `)
    .order("name");

  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    image_src: row.image_src,
    image_alt: row.image_alt,
    tag: row.tag,
    is_active: row.is_active,
    category_id: row.category_id,
    category_name: (row.categories as { name: string }).name,
    variants: (
      row.product_variants as AdminVariant[]
    ).sort((a, b) => a.sort_order - b.sort_order),
  }));
}

export async function getCategoriesWithId(): Promise<CategoryOption[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  if (error) throw error;
  return data;
}

export async function createProduct(input: ProductInput): Promise<void> {
  const { data: product, error } = await supabase
    .from("products")
    .insert({
      name: input.name,
      description: input.description,
      image_src: input.image_src,
      image_alt: input.image_alt,
      tag: input.tag || null,
      is_active: input.is_active,
      category_id: input.category_id,
    })
    .select("id")
    .single();

  if (error) throw error;

  if (input.newVariants.length > 0) {
    const { error: varError } = await supabase
      .from("product_variants")
      .insert(
        input.newVariants.map((v) => ({
          product_id: product.id,
          label: v.label || null,
          price: v.price,
          sort_order: v.sort_order,
          is_active: true,
        })),
      );
    if (varError) throw varError;
  }
}

export async function updateProduct(id: string, input: ProductInput): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({
      name: input.name,
      description: input.description,
      image_src: input.image_src,
      image_alt: input.image_alt,
      tag: input.tag || null,
      is_active: input.is_active,
      category_id: input.category_id,
    })
    .eq("id", id);

  if (error) throw error;

  // Soft-delete removed variants
  if (input.deletedVariantIds.length > 0) {
    const { error: delError } = await supabase
      .from("product_variants")
      .update({ is_active: false })
      .in("id", input.deletedVariantIds);
    if (delError) throw delError;
  }

  // Update existing variants
  for (const v of input.updatedVariants) {
    const { error: upErr } = await supabase
      .from("product_variants")
      .update({ label: v.label || null, price: v.price, sort_order: v.sort_order })
      .eq("id", v.id);
    if (upErr) throw upErr;
  }

  // Insert new variants
  if (input.newVariants.length > 0) {
    const { error: insError } = await supabase
      .from("product_variants")
      .insert(
        input.newVariants.map((v) => ({
          product_id: id,
          label: v.label || null,
          price: v.price,
          sort_order: v.sort_order,
          is_active: true,
        })),
      );
    if (insError) throw insError;
  }
}

export async function toggleProductActive(id: string, is_active: boolean): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({ is_active })
    .eq("id", id);
  if (error) throw error;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes
    .replace(/[^a-z0-9\s-]/g, "")   // solo alfanumérico
    .trim()
    .replace(/\s+/g, "-")            // espacios → guiones
    .replace(/-+/g, "-");            // guiones múltiples → uno
}

function extractStorageFileName(url: string): string | null {
  // URL format: .../storage/v1/object/public/product-images/{filename}
  const marker = "/product-images/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

export async function deleteProductImage(url: string): Promise<void> {
  const fileName = extractStorageFileName(url);
  if (!fileName) return; // no es una imagen de nuestro bucket, ignorar
  await supabase.storage.from("product-images").remove([fileName]);
}

export async function uploadProductImage(file: File, productName?: string): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const base = productName ? slugify(productName) : crypto.randomUUID();
  const fileName = `${base}.${ext}`;

  const { error } = await supabase.storage
    .from("product-images")
    .upload(fileName, file, { cacheControl: "3600", upsert: false });

  if (error) throw error;

  const { data } = supabase.storage
    .from("product-images")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

// ─── Public queries ───────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      description,
      image_src,
      image_alt,
      tag,
      categories!inner ( name ),
      product_variants ( id, label, price, sort_order )
    `)
    .eq("is_active", true)
    .order("name");

  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    image: { src: row.image_src, alt: row.image_alt },
    tag: row.tag,
    category: (row.categories as { name: string }).name,
    variants: (
      row.product_variants as Array<{
        id: string;
        label: string | null;
        price: number;
        sort_order: number;
      }>
    ).sort((a, b) => a.sort_order - b.sort_order),
  }));
}

const PRIORITY_CATEGORIES = ["Pollo a la Brasa", "Parrillas"];

export async function getCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("name")
    .order("name");

  if (error) throw error;

  const names = data.map((c) => c.name);
  const priority = PRIORITY_CATEGORIES.filter((p) => names.includes(p));
  const rest = names.filter((n) => !PRIORITY_CATEGORIES.includes(n));
  return [...priority, ...rest];
}
