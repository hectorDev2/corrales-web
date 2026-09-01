"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ProductCatalogCard, ViewModeToggle, type ViewMode } from "@/components/menu/MenuPage";
import type { Product } from "@/types/product";

const PRODUCTS_PER_PAGE = 12;

type SortOrder = "featured" | "price-asc" | "price-desc";

interface PromotionsPageProps {
  products: Product[];
  tags: string[];
  activeTag?: string;
}

function getProductPrice(product: Product) {
  return product.variants[0]?.price ?? 0;
}

function PromotionPagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;

  return (
    <nav
      aria-label="Paginación de promociones"
      className="mt-10 flex items-center justify-center gap-1.5"
    >
      <button
        type="button"
        aria-label="Página anterior"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="text-on-surface hover:bg-surface-container flex size-9 items-center justify-center rounded-md transition-colors disabled:pointer-events-none disabled:opacity-35"
      >
        <span className="material-symbols-outlined text-lg" aria-hidden="true">
          chevron_left
        </span>
      </button>
      {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          aria-label={`Página ${pageNumber}`}
          aria-current={pageNumber === page ? "page" : undefined}
          onClick={() => onChange(pageNumber)}
          className={`flex size-9 items-center justify-center rounded-md text-sm font-bold transition-colors ${pageNumber === page ? "bg-primary text-white" : "text-on-surface hover:bg-surface-container"}`}
        >
          {pageNumber}
        </button>
      ))}
      <button
        type="button"
        aria-label="Página siguiente"
        onClick={() => onChange(page + 1)}
        disabled={page === pageCount}
        className="text-on-surface hover:bg-surface-container flex size-9 items-center justify-center rounded-md transition-colors disabled:pointer-events-none disabled:opacity-35"
      >
        <span className="material-symbols-outlined text-lg" aria-hidden="true">
          chevron_right
        </span>
      </button>
    </nav>
  );
}

export function PromotionsPage({ products, tags, activeTag }: PromotionsPageProps) {
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<SortOrder>("featured");
  const [viewMode, setViewMode] = useState<ViewMode>("vertical");

  const sortedProducts = useMemo(() => {
    if (sortOrder === "featured") return products;

    return [...products].sort((left, right) => {
      const priceDifference = getProductPrice(left) - getProductPrice(right);
      return sortOrder === "price-asc" ? priceDifference : -priceDifference;
    });
  }, [products, sortOrder]);
  const pageCount = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
  const visibleProducts = sortedProducts.slice(
    (page - 1) * PRODUCTS_PER_PAGE,
    page * PRODUCTS_PER_PAGE,
  );

  function changeSort(order: SortOrder) {
    setSortOrder(order);
    setPage(1);
  }

  function changePage(nextPage: number) {
    setPage(Math.min(Math.max(nextPage, 1), pageCount));
  }

  return (
    <div className="bg-white">
      <nav aria-label="Subcategorías de promociones" className="border-b border-[#e9e9e9]">
        <div className="mx-auto flex max-w-7xl scrollbar-none gap-2 overflow-x-auto px-4 py-4 md:px-8 lg:px-10">
          <Link
            href="/promociones"
            aria-current={!activeTag ? "page" : undefined}
            className={`shrink-0 rounded-md border px-3 py-2 text-sm font-extrabold transition-colors ${!activeTag ? "border-black bg-black text-white" : "text-on-surface hover:border-primary hover:text-primary border-[#4a4a4a]"}`}
          >
            Todas las promos
          </Link>
          {tags.map((tag) => {
            const isActive = activeTag?.toLocaleLowerCase() === tag.toLocaleLowerCase();
            return (
              <Link
                key={tag}
                href={`/promociones?tag=${encodeURIComponent(tag)}`}
                aria-current={isActive ? "page" : undefined}
                className={`shrink-0 rounded-md border px-3 py-2 text-sm font-extrabold transition-colors ${isActive ? "border-black bg-black text-white" : "text-on-surface hover:border-primary hover:text-primary border-[#4a4a4a]"}`}
              >
                {tag}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 pt-8 pb-14 md:px-8 lg:px-10">
        <div className="mb-7 flex flex-col gap-4 border-b border-[#f0f0f0] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-on-surface text-base font-black">
            {products.length} {products.length === 1 ? "resultado" : "resultados"}
          </p>
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />
            <label className="text-on-surface-variant flex items-center gap-2 text-xs font-semibold">
              <span className="material-symbols-outlined text-base" aria-hidden="true">
                swap_vert
              </span>
              <span className="sr-only">Ordenar promociones</span>
              <select
                value={sortOrder}
                onChange={(event) => changeSort(event.target.value as SortOrder)}
                className="text-on-surface cursor-pointer bg-transparent text-sm font-bold outline-none"
                aria-label="Ordenar promociones"
              >
                <option value="featured">Ordenar</option>
                <option value="price-asc">Menor precio</option>
                <option value="price-desc">Mayor precio</option>
              </select>
            </label>
          </div>
        </div>

        {visibleProducts.length > 0 ? (
          <>
            <section
              data-testid={
                viewMode === "vertical" ? "promotions-product-grid" : "promotions-product-list"
              }
              aria-label="Productos en promoción"
              className={
                viewMode === "vertical"
                  ? "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3"
                  : "flex flex-col gap-3 sm:gap-4"
              }
            >
              {visibleProducts.map((product) => (
                <ProductCatalogCard key={product.id} product={product} viewMode={viewMode} />
              ))}
            </section>
            <PromotionPagination page={page} pageCount={pageCount} onChange={changePage} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="material-symbols-outlined text-primary/30 text-5xl" aria-hidden="true">
              local_offer
            </span>
            <h1 className="text-on-surface mt-4 text-2xl font-black">No encontramos promociones</h1>
            <p className="text-on-surface-variant mt-2 max-w-md text-sm">
              Volvé a probar con otra promoción o revisá la carta completa.
            </p>
            <Link
              href="/menu"
              className="bg-primary hover:bg-primary/90 mt-6 rounded-md px-5 py-3 text-sm font-bold text-white transition-colors"
            >
              Ver carta completa
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
