import Link from "next/link";

import { KfcProductCarousel } from "@/components/home";
import { getCategories, getProducts, getProductsByCategory, getProductsByTag, searchProducts } from "@/lib/api/products";

export const metadata = {
  title: "Carta — Pollería & Fastfood Corrales",
  description: "Pollo a la brasa, parrillas, fast food y más. Pedí online.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string; tag?: string }>;
}) {
  const { q, categoria, tag } = await searchParams;

  let products;
  let categories;

  if (tag?.trim()) {
    const [results, cats] = await Promise.all([
      getProductsByTag(tag.trim()),
      getCategories(),
    ]);
    products = results;
    categories = cats;
  } else if (categoria?.trim()) {
    const [results, cats] = await Promise.all([
      getProductsByCategory(categoria.trim()),
      getCategories(),
    ]);
    products = results;
    categories = cats;
  } else if (q?.trim()) {
    const [results, cats] = await Promise.all([
      searchProducts(q.trim()),
      getCategories(),
    ]);
    products = results;
    categories = cats;
  } else {
    const [prods, cats] = await Promise.all([
      getProducts(),
      getCategories(),
    ]);
    products = prods;
    categories = cats;
  }

  const filteredCategories = categoria
    ? categories.filter((c) => c.toLowerCase() === categoria.toLowerCase())
    : categories;

  const grouped = filteredCategories
    .map((cat) => ({
      name: cat,
      items: products.filter((p) => p.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  const hasNoResults = grouped.length === 0;

  return (
    <div className="max-w-[1280px] mx-auto overflow-hidden">
      {/* Info header */}
      {q?.trim() && (
        <div className="px-4 md:px-margin-desktop pt-6 pb-2">
          <p className="text-sm text-on-surface-variant">
            Resultados para: <span className="font-bold text-on-surface">{q}</span>
          </p>
        </div>
      )}
      {categoria?.trim() && (
        <div className="px-4 md:px-margin-desktop pt-6 pb-2">
          <p className="text-sm text-on-surface-variant">
            Categoría: <span className="font-bold text-on-surface">{categoria}</span>
          </p>
        </div>
      )}
      {tag?.trim() && (
        <div className="px-4 md:px-margin-desktop pt-6 pb-2">
          <p className="text-sm text-on-surface-variant">
            Promociones: <span className="font-bold text-on-surface">{tag}</span>
          </p>
        </div>
      )}

      {/* Content or fallback */}
      {!hasNoResults ? (
        grouped.map((g) => (
          <KfcProductCarousel key={g.name} title={g.name} products={g.items} />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center px-4 gap-6">
          <span
            className="material-symbols-outlined text-6xl text-primary/30"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}
          >
            local_fire_department
          </span>
          <div>
            <p className="text-2xl font-black text-on-surface">
              Lo sentimos, esta página no está disponible
            </p>
            <p className="text-sm text-on-surface-variant/70 mt-2 max-w-md mx-auto">
              No encontramos productos para esta búsqueda. Probá con otros términos o explorá nuestra carta completa.
            </p>
          </div>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">restaurant_menu</span>
            Ver carta completa
          </Link>
        </div>
      )}
    </div>
  );
}
