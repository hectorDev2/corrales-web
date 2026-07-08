import { KfcProductCarousel } from "@/components/home";
import { getCategories, getProducts, searchProducts } from "@/lib/api/products";

export const metadata = {
  title: "Carta — Pollería & Fastfood Corrales",
  description: "Pollo a la brasa, parrillas, fast food y más. Pedí online.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string }>;
}) {
  const { q, categoria } = await searchParams;

  let products;
  let categories;

  if (q?.trim()) {
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

  return (
    <div className="max-w-[1280px] mx-auto overflow-hidden">
      {q?.trim() && (
        <div className="px-4 md:px-margin-desktop pt-6 pb-2">
          <p className="text-sm text-on-surface-variant">
            Resultados para: <span className="font-bold text-on-surface">{q}</span>
          </p>
        </div>
      )}
      {categoria && !q?.trim() && (
        <div className="px-4 md:px-margin-desktop pt-6 pb-2">
          <p className="text-sm text-on-surface-variant">
            Categoría: <span className="font-bold text-on-surface">{categoria}</span>
          </p>
        </div>
      )}

      {grouped.length > 0 ? (
        grouped.map((g) => (
          <KfcProductCarousel key={g.name} title={g.name} products={g.items} />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <span
            className="material-symbols-outlined mb-4 text-6xl text-[#e5e5e5]"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}
          >
            restaurant_menu
          </span>
          <p className="text-lg font-bold text-on-surface-variant">Sin resultados</p>
          <p className="text-sm text-on-surface-variant/60 mt-1">
            Probá con otra palabra clave
          </p>
        </div>
      )}
    </div>
  );
}
