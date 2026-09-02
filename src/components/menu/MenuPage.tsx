"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { useCartStore } from "@/store/cart";
import type { Product } from "@/types/product";

const PRODUCTS_PER_PAGE = 12;

type SortOrder = "featured" | "price-asc" | "price-desc";
export type ViewMode = "vertical" | "horizontal";

interface MenuPageProps {
  products: Product[];
  categories: string[];
  activeCategory?: string;
  query?: string;
  tag?: string;
}

function getProductPrice(product: Product) {
  return product.variants[0]?.price ?? 0;
}

export function ProductCatalogCard({
  product,
  viewMode,
}: {
  product: Product;
  viewMode: ViewMode;
}) {
  const { addItem } = useCartStore();
  const price = getProductPrice(product);
  const isHorizontal = viewMode === "horizontal";

  function addToCart() {
    const variant = product.variants[0];
    if (variant) addItem(product, variant);
  }

  return (
    <article
      className={`group hover:shadow-card min-w-0 overflow-hidden rounded-md border border-[#ececec] bg-white transition-shadow duration-200 ${
        isHorizontal ? "flex min-h-35 sm:min-h-40" : "flex flex-col"
      }`}
    >
      <Link
        href={`/producto/${product.id}`}
        aria-label={product.name}
        className={`focus-visible:ring-primary outline-none focus-visible:ring-2 focus-visible:ring-inset ${
          isHorizontal ? "flex min-w-0 flex-1 items-stretch" : "flex flex-1 flex-col"
        }`}
      >
        <div
          className={`relative shrink-0 overflow-hidden bg-[#fafafa] ${
            isHorizontal ? "w-28 sm:w-36" : "aspect-square"
          }`}
        >
          <Image
            src={product.image.src || "/images/404-image.png"}
            alt={product.image.alt}
            fill
            sizes={
              isHorizontal
                ? "(min-width: 640px) 144px, 112px"
                : "(min-width: 1280px) 280px, (min-width: 768px) 33vw, 50vw"
            }
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.03]"
          />
          {product.tag && (
            <span className="bg-primary absolute top-2 left-2 rounded-sm px-2 py-1 text-[10px] font-extrabold tracking-wide text-white uppercase">
              {product.tag}
            </span>
          )}
        </div>
        <div
          className={`min-w-0 ${isHorizontal ? "flex flex-1 flex-col justify-center px-3 py-3 sm:px-4" : "px-3 pt-3 sm:px-4"}`}
        >
          <h2 className="text-on-surface line-clamp-1 text-[15px] leading-tight font-black sm:text-base">
            {product.name}
          </h2>
          <p
            className={`text-on-surface-variant mt-1 text-xs leading-[1.2] ${
              isHorizontal ? "line-clamp-2" : "line-clamp-2 min-h-9"
            }`}
          >
            {product.description}
          </p>
        </div>
      </Link>

      <div
        className={`flex shrink-0 gap-2 ${
          isHorizontal
            ? "flex-col items-end justify-center border-l border-[#f0f0f0] px-3 py-3 sm:px-4"
            : "mt-auto items-end justify-between px-3 pt-3 pb-2.5 sm:px-4"
        }`}
      >
        <span className="text-on-surface text-lg leading-none font-black">
          S/ {price.toFixed(2)}
        </span>
        <button
          type="button"
          onClick={addToCart}
          disabled={!product.variants[0]}
          aria-label={`Agregar ${product.name} al carrito`}
          className="text-on-surface hover:border-primary hover:bg-primary focus-visible:ring-primary flex size-8 shrink-0 items-center justify-center rounded-md border border-[#e5e5e5] bg-white shadow-sm transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-xl" aria-hidden="true">
            add
          </span>
        </button>
      </div>
    </article>
  );
}

export function ViewModeToggle({
  viewMode,
  onChange,
}: {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  return (
    <div className="text-on-surface-variant flex items-center gap-1.5 text-xs font-semibold">
      <span>Vista:</span>
      <button
        type="button"
        aria-label="Ver productos en modo vertical"
        aria-pressed={viewMode === "vertical"}
        onClick={() => onChange("vertical")}
        className={`focus-visible:ring-primary flex size-7 items-center justify-center rounded border transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 ${
          viewMode === "vertical"
            ? "border-primary bg-primary text-white"
            : "text-on-surface-variant hover:border-primary hover:text-primary border-[#dedede] bg-white"
        }`}
      >
        <span className="flex gap-0.5" aria-hidden="true">
          <span className="h-3 w-1.5 rounded-[1px] bg-current" />
          <span className="h-3 w-1.5 rounded-[1px] bg-current" />
        </span>
      </button>
      <button
        type="button"
        aria-label="Ver productos en modo horizontal"
        aria-pressed={viewMode === "horizontal"}
        onClick={() => onChange("horizontal")}
        className={`focus-visible:ring-primary flex size-7 items-center justify-center rounded border transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 ${
          viewMode === "horizontal"
            ? "border-primary bg-primary text-white"
            : "text-on-surface-variant hover:border-primary hover:text-primary border-[#dedede] bg-white"
        }`}
      >
        <span className="h-1.5 w-3 rounded-[1px] bg-current" aria-hidden="true" />
      </button>
    </div>
  );
}

function CategoryStrip({
  categories,
  activeCategory,
}: Pick<MenuPageProps, "categories" | "activeCategory">) {
  return (
    <nav
      aria-label="Categorías de la carta"
      className="sticky top-[calc(var(--public-mobile-header-height)+var(--public-subheader-height))] z-30 border-b border-[#e9e9e9] bg-white shadow-sm md:top-[106px]"
    >
      <div className="mx-auto flex max-w-7xl scrollbar-none gap-7 overflow-x-auto px-4 md:px-8">
        <Link
          href="/menu"
          className={`shrink-0 border-b-2 px-0 py-4 text-sm font-extrabold transition-colors ${!activeCategory ? "border-primary text-primary" : "text-on-surface hover:border-primary hover:text-primary border-transparent"}`}
        >
          Ver todo
        </Link>
        {categories.map((category) => {
          const isActive = activeCategory?.toLocaleLowerCase() === category.toLocaleLowerCase();
          return (
            <Link
              key={category}
              href={`/menu?categoria=${encodeURIComponent(category)}`}
              className={`shrink-0 border-b-2 px-0 py-4 text-sm font-bold transition-colors ${isActive ? "border-primary text-primary" : "text-on-surface hover:border-primary hover:text-primary border-transparent"}`}
            >
              {category}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function Pagination({
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
      aria-label="Paginación de productos"
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

export function MenuPage({ products, categories, activeCategory, query, tag }: MenuPageProps) {
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<SortOrder>("featured");
  const [viewMode, setViewMode] = useState<ViewMode>("vertical");

  const sortedProducts = useMemo(() => {
    if (sortOrder === "featured") return products;
    return [...products].sort((a, b) => {
      const priceDifference = getProductPrice(a) - getProductPrice(b);
      return sortOrder === "price-asc" ? priceDifference : -priceDifference;
    });
  }, [products, sortOrder]);

  const pageCount = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
  const visibleProducts = sortedProducts.slice(
    (page - 1) * PRODUCTS_PER_PAGE,
    page * PRODUCTS_PER_PAGE,
  );
  const filterLabel = query
    ? `Resultados para: ${query}`
    : tag
      ? `Promociones: ${tag}`
      : activeCategory
        ? `Categoría: ${activeCategory}`
        : null;

  function changeSort(order: SortOrder) {
    setSortOrder(order);
    setPage(1);
  }

  function changePage(nextPage: number) {
    setPage(Math.min(Math.max(nextPage, 1), pageCount));
  }

  return (
    <div className="bg-white">
      <CategoryStrip categories={categories} activeCategory={activeCategory} />

      <main className="mx-auto max-w-7xl px-4 pt-8 pb-14 md:px-8 lg:px-10">
        {filterLabel && <p className="text-on-surface-variant mb-4 text-sm">{filterLabel}</p>}

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
              <span className="sr-only">Ordenar productos</span>
              <select
                value={sortOrder}
                onChange={(event) => changeSort(event.target.value as SortOrder)}
                className="text-on-surface cursor-pointer bg-transparent text-sm font-bold outline-none"
                aria-label="Ordenar productos"
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
              data-testid={viewMode === "vertical" ? "menu-product-grid" : "menu-product-list"}
              aria-label="Productos de la carta"
              className={
                viewMode === "vertical"
                  ? "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4"
                  : "flex flex-col gap-3 sm:gap-4"
              }
            >
              {visibleProducts.map((product) => (
                <ProductCatalogCard key={product.id} product={product} viewMode={viewMode} />
              ))}
            </section>
            <Pagination page={page} pageCount={pageCount} onChange={changePage} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="material-symbols-outlined text-primary/30 text-5xl" aria-hidden="true">
              restaurant_menu
            </span>
            <h1 className="text-on-surface mt-4 text-2xl font-black">No encontramos productos</h1>
            <p className="text-on-surface-variant mt-2 max-w-md text-sm">
              Probá otra búsqueda o explorá la carta completa.
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
