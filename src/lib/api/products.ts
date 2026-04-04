import { supabase } from "@/lib/supabase";
import type { Product } from "@/types/product";

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

export async function getCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("name")
    .order("name");

  if (error) throw error;
  return data.map((c) => c.name);
}
