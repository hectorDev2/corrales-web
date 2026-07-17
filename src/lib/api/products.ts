import { supabase } from "@/lib/supabase";
import type { Product, ProductOptionGroup } from "@/types/product";

// ─── Admin types ──────────────────────────────────────────────────────────────

export interface CategoryOption {
  id: string;
  name: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  product_count: number;
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

export interface AdminOptionGroup {
  id: string;
  name: string;
  selection_type: "single" | "quantity";
  min_select: number;
  max_select: number | null;
  is_required: boolean;
  sort_order: number;
  options: AdminOption[];
}

export interface AdminOption {
  id: string;
  name: string;
  image_url: string | null;
  price_delta: number;
  sort_order: number;
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

export async function getAdminOptionGroups(
  productId: string,
): Promise<AdminOptionGroup[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data, error } = await db
    .from("product_option_groups")
    .select(`
      id, name, selection_type, min_select, max_select, is_required, sort_order,
      product_options ( id, name, image_url, price_delta, sort_order )
    `)
    .eq("product_id", productId)
    .order("sort_order");

  if (error) throw error;
  if (!data) return [];

  return data.map((g: Record<string, unknown>) => ({
    id: g.id as string,
    name: g.name as string,
    selection_type: g.selection_type as "single" | "quantity",
    min_select: g.min_select as number,
    max_select: g.max_select as number | null,
    is_required: g.is_required as boolean,
    sort_order: g.sort_order as number,
    options: (g.product_options as Array<{
      id: string;
      name: string;
      image_url: string | null;
      price_delta: number;
      sort_order: number;
    }>).sort((a, b) => a.sort_order - b.sort_order),
  }));
}

export async function saveOptionGroups(
  productId: string,
  groups: Array<{
    id?: string;
    name: string;
    selection_type: "single" | "quantity";
    min_select: number;
    max_select: number | null;
    is_required: boolean;
    sort_order: number;
    newOptions: Array<{ name: string; price_delta: number; image_url: string; sort_order: number }>;
    updatedOptions: Array<{ id: string; name: string; price_delta: number; image_url: string; sort_order: number }>;
    deletedOptionIds: string[];
  }>,
  deletedGroupIds: string[],
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Delete removed groups
  if (deletedGroupIds.length > 0) {
    // Cascade delete handles options
    await db.from("product_option_groups").delete().in("id", deletedGroupIds);
  }

  for (const group of groups) {
    if (group.id) {
      // Update existing group
      await db
        .from("product_option_groups")
        .update({
          name: group.name,
          selection_type: group.selection_type,
          min_select: group.min_select,
          max_select: group.max_select,
          is_required: group.is_required,
          sort_order: group.sort_order,
        })
        .eq("id", group.id);
    } else {
      // Insert new group
      const { data: newGroup } = await db
        .from("product_option_groups")
        .insert({
          product_id: productId,
          name: group.name,
          selection_type: group.selection_type,
          min_select: group.min_select,
          max_select: group.max_select,
          is_required: group.is_required,
          sort_order: group.sort_order,
        })
        .select("id")
        .single();

      // Set group.id to the new ID for option inserts
      group.id = (newGroup as { id: string }).id;
    }

    // Delete removed options
    if (group.deletedOptionIds.length > 0) {
      await db.from("product_options").delete().in("id", group.deletedOptionIds);
    }

    // Update existing options
    for (const opt of group.updatedOptions) {
      await db
        .from("product_options")
        .update({
          name: opt.name,
          price_delta: opt.price_delta,
          image_url: opt.image_url || null,
          sort_order: opt.sort_order,
        })
        .eq("id", opt.id);
    }

    // Insert new options
    if (group.newOptions.length > 0) {
      await db.from("product_options").insert(
        group.newOptions.map((o) => ({
          group_id: group.id,
          name: o.name,
          price_delta: o.price_delta,
          image_url: o.image_url || null,
          sort_order: o.sort_order,
        })),
      );
    }
  }
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

// ─── Category admin ───────────────────────────────────────────────────────────

export async function getAdminCategories(): Promise<AdminCategory[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, is_active, created_at, products(count)")
    .order("name");

  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    is_active: row.is_active,
    created_at: row.created_at,
    product_count:
      (row.products as unknown as [{ count: number }])?.[0]?.count ?? 0,
  }));
}

export async function toggleCategory(id: string, is_active: boolean): Promise<void> {
  const { error } = await supabase
    .from("categories")
    .update({ is_active })
    .eq("id", id);
  if (error) throw error;
}

export async function createCategory(name: string): Promise<void> {
  const { error } = await supabase.from("categories").insert({ name });
  if (error) throw error;
}

export async function updateCategory(id: string, name: string): Promise<void> {
  const { error } = await supabase
    .from("categories")
    .update({ name })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      throw new Error(
        "No podés eliminar esta categoría porque tiene productos asociados.",
      );
    }
    throw error;
  }
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
      categories!inner ( name, is_active ),
      product_variants ( id, label, price, sort_order )
    `)
    .eq("is_active", true)
    .eq("categories.is_active", true)
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

export async function searchProducts(query: string): Promise<Product[]> {
  const q = `%${query}%`;
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      description,
      image_src,
      image_alt,
      tag,
      categories!inner ( name, is_active ),
      product_variants ( id, label, price, sort_order )
    `)
    .eq("is_active", true)
    .eq("categories.is_active", true)
    .or(`name.ilike.${q},description.ilike.${q}`)
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

export async function getProductsByCategory(categoryName: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      description,
      image_src,
      image_alt,
      tag,
      categories!inner ( name, is_active ),
      product_variants ( id, label, price, sort_order )
    `)
    .eq("is_active", true)
    .eq("categories.is_active", true)
    .eq("categories.name", categoryName)
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

export async function getProductsByTag(tag: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      description,
      image_src,
      image_alt,
      tag,
      categories!inner ( name, is_active ),
      product_variants ( id, label, price, sort_order )
    `)
    .eq("is_active", true)
    .eq("categories.is_active", true)
    .eq("tag", tag)
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

async function fetchOptionGroups(
  productId: string,
): Promise<ProductOptionGroup[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data, error } = await db
    .from("product_option_groups")
    .select(`
      id,
      name,
      selection_type,
      min_select,
      max_select,
      is_required,
      sort_order,
      product_options ( id, name, image_url, price_delta, sort_order )
    `)
    .eq("product_id", productId)
    .order("sort_order");

  if (error || !data) return [];

  return data.map((g: Record<string, unknown>) => ({
    id: g.id as string,
    name: g.name as string,
    selectionType: g.selection_type as "single" | "quantity",
    minSelect: g.min_select as number,
    maxSelect: g.max_select as number | null,
    isRequired: g.is_required as boolean,
    sortOrder: g.sort_order as number,
    options: (g.product_options as Array<{
      id: string;
      name: string;
      image_url: string | null;
      price_delta: number;
      sort_order: number;
    }>)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((o) => ({
        id: o.id,
        name: o.name,
        imageUrl: o.image_url,
        priceDelta: o.price_delta,
        sortOrder: o.sort_order,
      })),
  }));
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      description,
      image_src,
      image_alt,
      tag,
      categories!inner ( name, is_active ),
      product_variants ( id, label, price, sort_order )
    `)
    .eq("id", id)
    .eq("is_active", true)
    .eq("categories.is_active", true)
    .single();

  if (error || !data) return null;

  const category = data.categories as { name: string };
  const variants = (
    data.product_variants as Array<{
      id: string;
      label: string | null;
      price: number;
      sort_order: number;
    }>
  ).sort((a, b) => a.sort_order - b.sort_order);

  const optionGroups = await fetchOptionGroups(id);

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    image: { src: data.image_src, alt: data.image_alt },
    tag: data.tag,
    category: category.name,
    variants,
    optionGroups: optionGroups.length > 0 ? optionGroups : undefined,
  };
}

const PRIORITY_CATEGORIES = ["Pollo a la Brasa", "Parrillas"];

export async function getCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("name")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;

  const names = data.map((c) => c.name);
  const priority = PRIORITY_CATEGORIES.filter((p) => names.includes(p));
  const rest = names.filter((n) => !PRIORITY_CATEGORIES.includes(n));
  return [...priority, ...rest];
}
