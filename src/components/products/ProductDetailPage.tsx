"use client";

import { useMemo, useState } from "react";

import { useCartStore } from "@/store/cart";
import type { SelectedOptionsMap } from "@/types/cart";
import { calcOptionsTotal } from "@/types/cart";
import type { Product, ProductOption, ProductOptionGroup, ProductVariant } from "@/types/product";

interface Props {
  product: Product;
}

function ChevronDown() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 24 24" aria-label="chevron down" role="img">
      <path fill="currentColor" d="M12 16.5 4.5 9l1.05-1.05L12 14.4l6.45-6.45L19.5 9z" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" aria-label="minus" role="img">
      <path fill="currentColor" d="M14 8a.5.5 0 0 1-.5.5h-11a.5.5 0 1 1 0-1h11a.5.5 0 0 1 .5.5" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" aria-label="plus" role="img">
      <path fill="currentColor" d="M14 8a.5.5 0 0 1-.5.5h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 1 1 0-1h5v-5a.5.5 0 1 1 1 0v5h5a.5.5 0 0 1 .5.5" />
    </svg>
  );
}

export function ProductDetailPage({ product }: Props) {
  const { addItem, openDrawer } = useCartStore();

  const variant: ProductVariant = product.variants[0];
  const groups = product.optionGroups ?? [];

  const [selections, setSelections] = useState<Record<string, Record<string, number>>>(() => {
    const init: Record<string, Record<string, number>> = {};
    for (const g of groups) {
      init[g.id] = {};
      for (const o of g.options) {
        init[g.id][o.id] = 0;
      }
    }
    return init;
  });

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const g of groups) {
      init[g.id] = true;
    }
    return init;
  });

  const selectedOptionsMap: SelectedOptionsMap = useMemo(() => {
    const map: SelectedOptionsMap = {};
    for (const g of groups) {
      const groupSelections = selections[g.id] ?? {};
      const entries = Object.entries(groupSelections)
        .filter(([, qty]) => qty > 0)
        .map(([optionId, qty]) => ({ optionId, quantity: qty }));
      if (entries.length > 0) {
        map[g.id] = entries;
      }
    }
    return map;
  }, [groups, selections]);

  const optionsExtra = useMemo(
    () => calcOptionsTotal(product, selectedOptionsMap),
    [product, selectedOptionsMap],
  );

  const unitPrice = (variant?.price ?? 0) + optionsExtra;

  const isComplete = useMemo(() => {
    for (const g of groups) {
      if (!g.isRequired) continue;
      const groupSel = selections[g.id] ?? {};
      const total = Object.values(groupSel).reduce((s, q) => s + q, 0);
      if (total < g.minSelect) return false;
    }
    return true;
  }, [groups, selections]);

  function updateOption(groupId: string, optionId: string, delta: number) {
    setSelections((prev) => {
      const group = prev[groupId];
      if (!group) return prev;
      const current = group[optionId] ?? 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [groupId]: { ...group, [optionId]: next } };
    });
  }

  function selectSingle(groupId: string, optionId: string) {
    setSelections((prev) => {
      const cleared: Record<string, number> = {};
      for (const key of Object.keys(prev[groupId] ?? {})) {
        cleared[key] = 0;
      }
      cleared[optionId] = 1;
      return { ...prev, [groupId]: cleared };
    });
  }

  function toggleGroup(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleAdd() {
    if (!variant || !isComplete) return;
    addItem(product, variant, selectedOptionsMap, 1);
    openDrawer();
  }

  function groupStatus(g: ProductOptionGroup): { label: string; color: "success" | "neutral" } {
    const groupSel = selections[g.id] ?? {};
    const total = Object.values(groupSel).reduce((s, q) => s + q, 0);
    if (g.isRequired && total < g.minSelect) {
      return { label: "Requerido", color: "neutral" };
    }
    return { label: "Completado", color: "success" };
  }

  function groupSummary(g: ProductOptionGroup): string {
    const groupSel = selections[g.id] ?? {};
    const selected = Object.entries(groupSel).filter(([, q]) => q > 0);
    if (selected.length === 0) {
      return g.selectionType === "single"
        ? `Elige ${g.minSelect} opción`
        : `Elige ${g.minSelect} opción`;
    }
    if (g.selectionType === "single") {
      const opt = g.options.find((o) => o.id === selected[0][0]);
      return opt?.name ?? "Seleccionado";
    }
    if (g.selectionType === "quantity") {
      return selected
        .map(([optId, qty]) => {
          const opt = g.options.find((o) => o.id === optId);
          return `${opt?.name ?? ""} x ${qty} un`;
        })
        .join(", ");
    }
    return "";
  }

  const labelMap: Record<string, string> = {};

  return (
    <div className="pb-24" style={{ backgroundColor: "#ffffff" }}>
      <main className="mx-auto max-w-7xl py-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* ── Left Panel ──────────────────────────────────────────── */}
        <section>
          <h1 className="text-3xl font-black mb-6">
            {product.name}
          </h1>
          <div
            className="mb-6 rounded-lg overflow-hidden"
            style={{ backgroundColor: "#e4002b", aspectRatio: "16/10" }}
          >
            <img
              alt={product.image.alt}
              className="w-full h-full object-cover"
              src={product.image.src}
            />
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black leading-none">
                S/ {unitPrice.toFixed(2)}
              </span>
            </div>
            {product.tag && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold" style={{ color: "#16a34a" }}>
                  {product.tag}
                </span>
              </div>
            )}
          </div>

          <p
            className="pb-6 border-b font-medium"
            style={{ color: "#6b7280", borderColor: "#f0f0f0" }}
          >
            {product.description}
          </p>
        </section>

        {/* ── Right Panel: Option Groups (KFC-style accordion) ──────── */}
        <section className="space-y-4">
          {groups.map((g) => {
            const groupSel = selections[g.id] ?? {};
            const status = groupStatus(g);
            const totalInGroup = Object.values(groupSel).reduce((s, q) => s + q, 0);

            return (
              <div
                key={g.id}
                className="border rounded-xl overflow-hidden shadow-sm"
                style={{ borderColor: "#e0e0e0" }}
                aria-label={`Accordion item ${groups.indexOf(g)}`}
              >
                {/* ── Accordion Header ─────────────────────────────── */}
                <div>
                  <button
                    className="w-full p-4 flex flex-col gap-1 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleGroup(g.id)}
                    type="button"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black">{g.name}</span>
                      </div>
                      <span
                        className="text-lg"
                        style={{
                          color: "#9ca3af",
                          transform: expanded[g.id] ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s",
                        }}
                      >
                        <ChevronDown />
                      </span>
                    </div>

                    {/* ── Subheader ────────────────────────────────── */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs" style={{ color: "#6b7280" }}>
                        {groupSummary(g)}
                      </div>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded font-bold uppercase leading-normal"
                        style={
                          status.color === "success"
                            ? { backgroundColor: "#dcfce7", color: "#15803d" }
                            : { backgroundColor: "#f3f4f6", color: "#374151" }
                        }
                      >
                        {status.label}
                      </span>
                    </div>
                  </button>

                  {/* ── Accordion Content ──────────────────────────── */}
                  {expanded[g.id] && (
                    <div>
                      <div className="divide-y" style={{ borderColor: "#e0e0e0" }}>
                        {g.options.map((opt) => (
                          <OptionRow
                            key={opt.id}
                            option={opt}
                            group={g}
                            selectedQty={groupSel[opt.id] ?? 0}
                            onUpdate={(delta) => updateOption(g.id, opt.id, delta)}
                            onSelect={() => selectSingle(g.id, opt.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      </main>

      {/* ── Sticky Bottom Bar ──────────────────────────────────────── */}
      <footer
        className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 md:p-4 z-50"
        style={{
          borderColor: "#e0e0e0",
          boxShadow: "0 -4px 10px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div className="mx-auto max-w-7xl flex items-center gap-2 md:gap-4">
          <button
            onClick={handleAdd}
            disabled={!isComplete}
            className={`flex-1 text-white font-black py-3 md:py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all text-sm md:text-lg tracking-wide uppercase whitespace-nowrap ${
              isComplete ? "" : "opacity-50 cursor-not-allowed"
            }`}
            style={{
              backgroundColor: "#e4002b",
              boxShadow: isComplete
                ? "0 10px 15px -3px rgba(228, 0, 43, 0.3)"
                : "none",
            }}
          >
            Agregar{" "}
            <span className="hidden md:inline">
              (S/ {unitPrice.toFixed(2)})
            </span>
          </button>
        </div>
      </footer>
    </div>
  );
}

// ── Option Row Component (KFC-style) ──────────────────────────────────

function OptionRow({
  option,
  group,
  selectedQty,
  onUpdate,
  onSelect,
}: {
  option: ProductOption;
  group: ProductOptionGroup;
  selectedQty: number;
  onUpdate: (delta: number) => void;
  onSelect: () => void;
}) {
  const isActive = selectedQty > 0;
  const showDivider = true;

  if (group.selectionType === "single") {
    return (
      <div>
        <button
          className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={onSelect}
          type="button"
        >
          <div className="flex items-center gap-3">
            {option.imageUrl && (
              <picture>
                <img
                  alt={option.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded shadow-sm border object-cover"
                  style={{ borderColor: "#d1d5db" }}
                  src={option.imageUrl}
                />
              </picture>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">{option.name}</span>
              {option.priceDelta > 0 && (
                <span className="text-xs font-bold" style={{ color: "#6b7280" }}>
                  + S/ {option.priceDelta.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {option.priceDelta > 0 && (
              <span className="text-xs font-bold" style={{ color: "#6b7280" }}>
                + S/ {option.priceDelta.toFixed(2)}
              </span>
            )}
            <label
              className="flex items-center cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                style={{
                  borderColor: isActive ? "#e4002b" : "#d1d5db",
                }}
              >
                {isActive && (
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: "#e4002b" }}
                  />
                )}
              </div>
              <input
                className="sr-only"
                type="radio"
                name={group.id}
                checked={isActive}
                onChange={onSelect}
              />
            </label>
          </div>
        </button>
        <div style={{ borderTop: "1px solid #e0e0e0", marginLeft: 0 }} />
      </div>
    );
  }

  // selectionType === "quantity" — KFC-style counter
  return (
    <div>
      <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          {option.imageUrl && (
            <picture>
              <img
                alt={option.name}
                width={48}
                height={48}
                className={`w-12 h-12 rounded shadow-sm border object-cover ${
                  isActive ? "" : "grayscale opacity-50"
                }`}
                style={{ borderColor: "#d1d5db" }}
                src={option.imageUrl}
              />
            </picture>
          )}
          <div>
            <span
              className="text-sm font-bold"
              style={{ color: isActive ? "#111" : "#9ca3af" }}
            >
              {option.name}
            </span>
            {option.priceDelta > 0 && (
              <div className="text-xs font-bold" style={{ color: "#6b7280" }}>
                + S/ {option.priceDelta.toFixed(2)}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center">
          {isActive ? (
            <fieldset
              className="flex items-center border rounded-lg overflow-hidden bg-white"
              style={{ borderColor: "#d1d5db" }}
              aria-label={`Contador de ${option.name}`}
            >
              <button
                onClick={() => onUpdate(-1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                style={{ color: "#e4002b" }}
                type="button"
                aria-label={`Disminuir cantidad de ${option.name}`}
              >
                <MinusIcon />
              </button>
              <div
                className="w-10 text-center text-sm font-bold"
                style={{ color: "#111" }}
              >
                {selectedQty}
              </div>
              <button
                onClick={() => onUpdate(1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                style={{ color: "#e4002b" }}
                type="button"
                aria-label={`Incrementar cantidad de ${option.name}`}
                disabled={false}
              >
                <PlusIcon />
              </button>
            </fieldset>
          ) : (
            <button
              onClick={() => onUpdate(1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-white shadow-md hover:opacity-90 active:scale-95 transition-all"
              style={{ backgroundColor: "#e4002b" }}
              type="button"
              aria-label={`Incrementar cantidad de ${option.name}`}
            >
              <PlusIcon />
            </button>
          )}
        </div>
      </div>
      <div style={{ borderTop: "1px solid #e0e0e0", marginLeft: 0 }} />
    </div>
  );
}
