"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  type AdminProduct,
  type CategoryOption,
  getAdminProducts,
  getCategoriesWithId,
  toggleProductActive,
} from "@/lib/api/products";

import { ProductForm } from "./ProductForm";

export function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function fetchProducts() {
    try {
      const data = await getAdminProducts();
      setProducts(data);
    } catch {
      toast.error("Error al cargar los productos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
    getCategoriesWithId().then(setCategories).catch(() => {});
  }, []);

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(product: AdminProduct) {
    setEditing(product);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  async function handleSuccess() {
    closeForm();
    toast.success(editing ? "Producto actualizado." : "Producto creado.");
    await fetchProducts();
  }

  async function handleToggle(product: AdminProduct) {
    setTogglingId(product.id);
    try {
      await toggleProductActive(product.id, !product.is_active);
      toast.success(product.is_active ? "Producto desactivado." : "Producto activado.");
      await fetchProducts();
    } catch {
      toast.error("No se pudo actualizar el producto.");
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="w-full max-w-[390px] mx-auto px-4 space-y-6 py-4 pb-24">
      {/* Header */}
      <div className="flex justify-between items-end py-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">
            Administración
          </p>
          <h2 className="text-2xl font-black tracking-tighter text-on-surface">Productos</h2>
        </div>
        <div className="bg-surface-container-high rounded-xl p-2 px-3 text-right">
          <p className="text-[10px] font-bold text-secondary uppercase">Total</p>
          <p className="text-sm font-black text-primary">{products.length} items</p>
        </div>
      </div>

      {/* Lista */}
      <section className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <span
              className="material-symbols-outlined text-4xl text-outline animate-spin"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}
            >
              progress_activity
            </span>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-on-surface-variant gap-3">
            <span
              className="material-symbols-outlined text-5xl text-outline"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}
            >
              restaurant_menu
            </span>
            <p className="font-bold text-sm">Sin productos</p>
          </div>
        ) : (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              toggling={togglingId === product.id}
              onEdit={() => openEdit(product)}
              onToggle={() => handleToggle(product)}
            />
          ))
        )}
      </section>

      {/* FAB */}
      <button
        onClick={openCreate}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-primary text-on-primary shadow-xl shadow-primary/30 flex items-center justify-center transition active:scale-90 z-40"
      >
        <span
          className="material-symbols-outlined text-2xl"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
        >
          add
        </span>
      </button>

      {/* Bottom Sheet */}
      {showForm && (
        <>
          <div
            className="fixed inset-0 bg-scrim/40 z-[60]"
            onClick={closeForm}
          />
          <div className="fixed inset-x-0 bottom-0 z-[60] max-h-[92dvh] overflow-hidden bg-surface rounded-t-3xl flex flex-col shadow-[0_-16px_60px_rgba(0,0,0,0.2)]">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-outline-variant" />
            </div>
            <ProductForm
              product={editing}
              categories={categories}
              onSuccess={handleSuccess}
              onClose={closeForm}
            />
          </div>
        </>
      )}
    </div>
  );
}

// ─── ProductCard ──────────────────────────────────────────────────────────────

interface CardProps {
  product: AdminProduct;
  toggling: boolean;
  onEdit: () => void;
  onToggle: () => void;
}

function ProductCard({ product, toggling, onEdit, onToggle }: CardProps) {
  const activeVariants = product.variants.filter((v) => v.is_active);
  const minPrice = activeVariants.length > 0 ? Math.min(...activeVariants.map((v) => v.price)) : 0;
  const maxPrice = activeVariants.length > 0 ? Math.max(...activeVariants.map((v) => v.price)) : 0;

  const priceLabel =
    activeVariants.length === 0
      ? "Sin variantes"
      : minPrice === maxPrice
        ? `S/ ${minPrice.toFixed(2)}`
        : `S/ ${minPrice.toFixed(2)} – ${maxPrice.toFixed(2)}`;

  return (
    <div
      className={[
        "bg-surface-container-lowest rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(89,65,61,0.07)] transition-all",
        !product.is_active && "opacity-60",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="p-4 flex items-start gap-3">
        {/* Image */}
        <div className="w-14 h-14 rounded-2xl bg-surface-container-high overflow-hidden shrink-0 relative">
          <Image
            src={product.image_src}
            alt={product.image_alt}
            fill
            className="object-cover"
            sizes="56px"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/404-image.png";
            }}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-black text-on-surface leading-tight truncate">
              {product.name}
            </p>
            <span
              className={[
                "shrink-0 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                product.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-surface-container-high text-on-surface-variant",
              ].join(" ")}
            >
              {product.is_active ? "Activo" : "Inactivo"}
            </span>
          </div>
          <p className="text-[10px] text-secondary font-bold uppercase tracking-wider mt-0.5">
            {product.category_name}
          </p>
          <p className="text-xs font-bold text-primary mt-1">{priceLabel}</p>
          {product.tag && (
            <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded-full">
              {product.tag}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-surface-container-high text-on-surface text-[11px] font-bold uppercase tracking-wider transition active:scale-95"
        >
          <span className="material-symbols-outlined text-sm">edit</span>
          Editar
        </button>
        <button
          onClick={onToggle}
          disabled={toggling}
          className={[
            "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition active:scale-95 disabled:opacity-40",
            product.is_active
              ? "bg-error-container text-error"
              : "bg-primary/10 text-primary",
          ].join(" ")}
        >
          <span className="material-symbols-outlined text-sm">
            {product.is_active ? "visibility_off" : "visibility"}
          </span>
          {product.is_active ? "Desactivar" : "Activar"}
        </button>
      </div>
    </div>
  );
}
