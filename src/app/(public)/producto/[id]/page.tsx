import { notFound } from "next/navigation";

import { ProductDetailPage } from "@/components/products/ProductDetailPage";
import { getProductById } from "@/lib/api/products";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return <ProductDetailPage product={product} />;
}
