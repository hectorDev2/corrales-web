"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  createCategory,
  deleteCategory,
  getAdminCategories,
  toggleCategory,
  updateCategory,
  type AdminCategory,
} from "@/lib/api/products";

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  async function fetchCategories() {
    try {
      const data = await getAdminCategories();
      setCategories(data);
    } catch {
      toast.error("Error al cargar las categorías.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (editingId) editInputRef.current?.focus();
  }, [editingId]);

  function startEdit(cat: AdminCategory) {
    setEditingId(cat.id);
    setEditName(cat.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
  }

  async function handleSaveEdit(id: string) {
    const trimmed = editName.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await updateCategory(id, trimmed);
      toast.success("Categoría actualizada.");
      setEditingId(null);
      await fetchCategories();
    } catch {
      toast.error("No se pudo actualizar la categoría.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setCreating(true);
    try {
      await createCategory(trimmed);
      toast.success(`Categoría "${trimmed}" creada.`);
      setNewName("");
      await fetchCategories();
    } catch {
      toast.error("No se pudo crear la categoría.");
    } finally {
      setCreating(false);
    }
  }

  async function handleToggle(cat: AdminCategory) {
    try {
      await toggleCategory(cat.id, !cat.is_active);
      toast.success(cat.is_active ? "Categoría ocultada." : "Categoría visible.");
      await fetchCategories();
    } catch {
      toast.error("No se pudo cambiar la visibilidad.");
    }
  }

  async function handleDelete(cat: AdminCategory) {
    if (cat.product_count > 0) return;
    if (!confirm(`¿Eliminás la categoría "${cat.name}"?`)) return;
    try {
      await deleteCategory(cat.id);
      toast.success("Categoría eliminada.");
      await fetchCategories();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar.");
    }
  }

  return (
    <div className="w-full max-w-2xl md:max-w-5xl lg:max-w-7xl mx-auto px-4 md:px-8 space-y-6 py-4 md:py-8 pb-28">
      {/* Header */}
      <div className="flex justify-between items-end py-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">
            Panel de Control
          </p>
          <h2 className="text-2xl font-black tracking-tighter text-on-surface">
            Categorías
          </h2>
        </div>
        <div className="bg-surface-container-high rounded-xl p-2 px-3 text-right">
          <p className="text-[10px] font-bold text-secondary uppercase">Total</p>
          <p className="text-sm font-black text-primary">{categories.length}</p>
        </div>
      </div>

      {/* Nueva categoría */}
      <div className="bg-surface-container-low p-4 rounded-3xl space-y-3">
        <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">
          Nueva categoría
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="Ej. Bebidas"
            className="flex-1 bg-surface-container-high border-none rounded-xl py-3 px-4 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-outline"
          />
          <button
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
            className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-primary text-on-primary text-[11px] font-black uppercase tracking-wider shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span
              className="material-symbols-outlined text-base"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              {creating ? "progress_activity" : "add"}
            </span>
            Crear
          </button>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-16">
          <span
            className="material-symbols-outlined text-4xl text-outline animate-spin"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}
          >
            progress_activity
          </span>
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-on-surface-variant gap-3">
          <span
            className="material-symbols-outlined text-5xl text-outline"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}
          >
            category
          </span>
          <p className="font-bold text-sm">Sin categorías</p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-surface-container-lowest rounded-2xl shadow-[0_4px_20px_rgba(89,65,61,0.06)] overflow-hidden"
            >
              {editingId === cat.id ? (
                /* Modo edición */
                <div className="p-4 flex items-center gap-2">
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit(cat.id);
                      if (e.key === "Escape") cancelEdit();
                    }}
                    className="flex-1 bg-surface-container-high border-none rounded-xl py-2.5 px-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    onClick={() => handleSaveEdit(cat.id)}
                    disabled={saving || !editName.trim()}
                    className="p-2.5 rounded-xl bg-primary text-on-primary transition-all active:scale-95 disabled:opacity-40"
                  >
                    <span
                      className="material-symbols-outlined text-base"
                      style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                    >
                      {saving ? "progress_activity" : "check"}
                    </span>
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-2.5 rounded-xl bg-surface-container-highest text-on-surface-variant transition-all active:scale-95"
                  >
                    <span
                      className="material-symbols-outlined text-base"
                      style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                    >
                      close
                    </span>
                  </button>
                </div>
              ) : (
                /* Modo vista */
                <div className={`p-4 flex items-center gap-3 transition-opacity ${!cat.is_active ? "opacity-50" : ""}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cat.is_active ? "bg-primary/10" : "bg-surface-container-high"}`}>
                    <span
                      className={`material-symbols-outlined text-lg ${cat.is_active ? "text-primary" : "text-outline"}`}
                      style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                    >
                      category
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-on-surface truncate">{cat.name}</p>
                      {!cat.is_active && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-surface-container-highest text-outline">
                          Oculta
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-on-surface-variant">
                      {cat.product_count === 0
                        ? "Sin productos"
                        : `${cat.product_count} producto${cat.product_count !== 1 ? "s" : ""}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => startEdit(cat)}
                      className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-all active:scale-90"
                    >
                      <span
                        className="material-symbols-outlined text-lg"
                        style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                      >
                        edit
                      </span>
                    </button>
                    <button
                      onClick={() => handleToggle(cat)}
                      title={cat.is_active ? "Ocultar categoría" : "Mostrar categoría"}
                      className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-all active:scale-90"
                    >
                      <span
                        className="material-symbols-outlined text-lg"
                        style={{ fontVariationSettings: `'FILL' ${cat.is_active ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
                      >
                        {cat.is_active ? "visibility" : "visibility_off"}
                      </span>
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      disabled={cat.product_count > 0}
                      title={
                        cat.product_count > 0
                          ? "Tiene productos asociados"
                          : "Eliminar categoría"
                      }
                      className="p-2 rounded-xl text-error hover:bg-error-container transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <span
                        className="material-symbols-outlined text-lg"
                        style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                      >
                        delete
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
