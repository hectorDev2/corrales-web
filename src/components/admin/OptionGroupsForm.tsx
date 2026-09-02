"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  deleteProductImage,
  getAdminOptionGroups,
  saveOptionGroups,
  uploadProductImage,
} from "@/lib/api/products";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface OptionForm {
  _key: string;
  _id?: string;
  name: string;
  price_delta: number;
  image_url: string;
}

interface GroupForm {
  _key: string;
  _id?: string;
  name: string;
  selection_type: "single" | "quantity";
  min_select: number;
  max_select: number | null;
  is_required: boolean;
  options: OptionForm[];
}

interface Props {
  productId: string;
  onSaved: () => void;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

let keyCounter = 0;
function nextKey(): string {
  return `k${++keyCounter}`;
}

function emptyGroup(): GroupForm {
  return {
    _key: nextKey(),
    name: "",
    selection_type: "single",
    min_select: 1,
    max_select: 1,
    is_required: true,
    options: [],
  };
}

function emptyOption(): OptionForm {
  return { _key: nextKey(), name: "", price_delta: 0, image_url: "" };
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function OptionGroupsForm({ productId, onSaved }: Props) {
  const [groups, setGroups] = useState<GroupForm[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getAdminOptionGroups(productId)
      .then((data) => {
        setGroups(
          data.map((g) => ({
            _key: nextKey(),
            _id: g.id,
            name: g.name,
            selection_type: g.selection_type,
            min_select: g.min_select,
            max_select: g.max_select,
            is_required: g.is_required,
            options: g.options.map((o) => ({
              _key: nextKey(),
              _id: o.id,
              name: o.name,
              price_delta: o.price_delta,
              image_url: o.image_url ?? "",
            })),
          })),
        );
      })
      .catch(() => setMessage("Error al cargar opciones"))
      .finally(() => setLoading(false));
  }, [open, productId]);

  function addGroup() {
    setGroups((prev) => [...prev, emptyGroup()]);
  }

  function removeGroup(key: string) {
    setGroups((prev) => prev.filter((g) => g._key !== key));
  }

  function updateGroup(key: string, patch: Partial<GroupForm>) {
    setGroups((prev) =>
      prev.map((g) => (g._key === key ? { ...g, ...patch } : g)),
    );
  }

  function addOption(groupKey: string) {
    setGroups((prev) =>
      prev.map((g) =>
        g._key === groupKey
          ? { ...g, options: [...g.options, emptyOption()] }
          : g,
      ),
    );
  }

  function removeOption(groupKey: string, optionKey: string) {
    setGroups((prev) =>
      prev.map((g) =>
        g._key === groupKey
          ? { ...g, options: g.options.filter((o) => o._key !== optionKey) }
          : g,
      ),
    );
  }

  function updateOption(groupKey: string, optionKey: string, patch: Partial<OptionForm>) {
    setGroups((prev) =>
      prev.map((g) =>
        g._key === groupKey
          ? {
              ...g,
              options: g.options.map((o) =>
                o._key === optionKey ? { ...o, ...patch } : o,
              ),
            }
          : g,
      ),
    );
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const deletedGroupIds: string[] = [];
      const payload = groups.map((g, i) => {
        if (g._id && !groups.find((gg) => gg._id === g._id)) {
          deletedGroupIds.push(g._id);
        }
        const newOptions: Array<{ name: string; price_delta: number; image_url: string; sort_order: number }> = [];
        const updatedOptions: Array<{ id: string; name: string; price_delta: number; image_url: string; sort_order: number }> = [];
        const deletedOptionIds: string[] = [];

        g.options.forEach((o, oi) => {
          if (o._id) {
            updatedOptions.push({ id: o._id, name: o.name, price_delta: o.price_delta, image_url: o.image_url, sort_order: oi });
          } else {
            newOptions.push({ name: o.name, price_delta: o.price_delta, image_url: o.image_url, sort_order: oi });
          }
        });

        return {
          id: g._id,
          name: g.name,
          selection_type: g.selection_type,
          min_select: g.min_select,
          max_select: g.max_select,
          is_required: g.is_required,
          sort_order: i,
          newOptions,
          updatedOptions,
          deletedOptionIds,
        };
      });

      await saveOptionGroups(productId, payload, deletedGroupIds);
      setMessage("Opciones guardadas");
      onSaved();
    } catch {
      setMessage("Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  const hasGroups = groups.length > 0;

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-2xl bg-surface-container-low p-4 text-left"
      >
        <div>
          <p className="text-sm font-bold text-on-surface">
            Opciones de personalización
          </p>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {hasGroups
              ? `${groups.length} grupo${groups.length !== 1 ? "s" : ""}`
              : "Agregá complementos, bebidas, extras..."}
          </p>
        </div>
        <span
          className={`material-symbols-outlined text-on-surface-variant transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </button>

      {open && (
        <div className="space-y-4">
          {loading && (
            <p className="text-center text-sm text-on-surface-variant py-4">
              Cargando...
            </p>
          )}

          {!loading && !hasGroups && (
            <p className="text-center text-sm text-on-surface-variant py-4">
              Todavía no hay grupos de opciones.
            </p>
          )}

          {!loading &&
            groups.map((group, gi) => (
              <div
                key={group._key}
                className="rounded-2xl border border-outline-variant/40 overflow-hidden"
              >
                {/* Group header */}
                <div className="flex items-center gap-2 bg-surface-container-low px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <input
                      value={group.name}
                      onChange={(e) => updateGroup(group._key, { name: e.target.value })}
                      placeholder="Nombre del grupo"
                      className="w-full bg-transparent text-sm font-bold text-on-surface focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeGroup(group._key)}
                    className="w-7 h-7 flex items-center justify-center rounded-full text-error hover:bg-error-container transition"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>

                {/* Group settings */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-surface">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Tipo
                    </label>
                    <select
                      value={group.selection_type}
                      onChange={(e) =>
                        updateGroup(group._key, {
                          selection_type: e.target.value as "single" | "quantity",
                        })
                      }
                      className="w-full mt-1 bg-surface-container-high rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="single">Single (radio)</option>
                      <option value="quantity">Quantity (contador)</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                        Min
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={group.min_select}
                        onChange={(e) =>
                          updateGroup(group._key, {
                            min_select: Math.max(0, Number(e.target.value)),
                          })
                        }
                        className="w-full mt-1 bg-surface-container-high rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                        Max
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={group.max_select ?? ""}
                        onChange={(e) =>
                          updateGroup(group._key, {
                            max_select: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                        placeholder="∞"
                        className="w-full mt-1 bg-surface-container-high rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Required toggle */}
                <div className="flex items-center justify-between px-3 py-2 bg-surface border-t border-outline-variant/20">
                  <span className="text-xs font-bold text-on-surface">Requerido</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={group.is_required}
                      onChange={(e) =>
                        updateGroup(group._key, { is_required: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-outline rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                  </label>
                </div>

                {/* Options */}
                <div className="divide-y divide-outline-variant/20">
                  {group.options.map((opt) => (
                    <OptionImageRow
                      key={opt._key}
                      groupKey={group._key}
                      opt={opt}
                      updateOption={updateOption}
                      removeOption={removeOption}
                    />
                  ))}
                </div>

                {/* Add option */}
                <div className="px-3 pb-3 pt-1">
                  <button
                    type="button"
                    onClick={() => addOption(group._key)}
                    className="flex items-center gap-1 text-xs font-bold text-primary"
                  >
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                    Agregar opción
                  </button>
                </div>
              </div>
            ))}

          {/* Add group */}
          <button
            type="button"
            onClick={addGroup}
            className="flex items-center gap-1 text-sm font-bold text-primary"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            Agregar grupo
          </button>

          {/* Message */}
          {message && (
            <p
              className={`text-xs text-center ${
                message.includes("Error") ? "text-error" : "text-green-600"
              }`}
            >
              {message}
            </p>
          )}

          {/* Save */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-2xl bg-primary text-on-primary font-bold text-sm transition active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar opciones"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Option Row with Image Upload ─────────────────────────────────────

function OptionImageRow({
  groupKey,
  opt,
  updateOption,
  removeOption,
}: {
  groupKey: string;
  opt: OptionForm;
  updateOption: (groupKey: string, optionKey: string, patch: Partial<OptionForm>) => void;
  removeOption: (groupKey: string, optionKey: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const previousUrl = opt.image_url;
      const url = await uploadProductImage(file);
      if (previousUrl) await deleteProductImage(previousUrl);
      updateOption(groupKey, opt._key, { image_url: url });
    } catch {
      toast.error("No se pudo subir la imagen de la opción.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleRemoveImage() {
    updateOption(groupKey, opt._key, { image_url: "" });
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <div className="relative shrink-0">
        <label
          aria-label={`Subir imagen para ${opt.name || "opción"}`}
          className={`relative flex w-10 h-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-outline-variant/40 bg-surface-container-high transition hover:border-primary ${
            uploading ? "cursor-wait opacity-50" : ""
          }`}
        >
          {opt.image_url ? (
            <img
              src={opt.image_url}
              alt={opt.name || "icono"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-on-surface-variant">
              <span className="material-symbols-outlined text-lg">image</span>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg animate-spin">
                progress_activity
              </span>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            disabled={uploading}
            onChange={handleFile}
          />
        </label>
        {opt.image_url && (
          <button
            type="button"
            onClick={handleRemoveImage}
            aria-label={`Quitar imagen de ${opt.name || "opción"}`}
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-error text-white flex items-center justify-center shadow"
          >
            <span className="material-symbols-outlined text-[10px]">close</span>
          </button>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <input
          value={opt.name}
          onChange={(e) =>
            updateOption(groupKey, opt._key, { name: e.target.value })
          }
          placeholder="Opción"
          className="w-full bg-transparent text-sm text-on-surface focus:outline-none"
        />
      </div>
      <div className="w-20">
        <input
          type="number"
          step="0.01"
          min={0}
          value={opt.price_delta}
          onChange={(e) =>
            updateOption(groupKey, opt._key, {
              price_delta: Number(e.target.value),
            })
          }
          placeholder="+S/ 0.00"
          className="w-full bg-surface-container-high rounded-lg px-2 py-1.5 text-xs text-on-surface text-right focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <button
        type="button"
        onClick={() => removeOption(groupKey, opt._key)}
        className="w-6 h-6 flex items-center justify-center rounded-full text-error hover:bg-error-container transition shrink-0"
      >
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  );
}
