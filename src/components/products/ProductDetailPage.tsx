"use client";

import { useMemo, useState } from "react";

import { useCartStore } from "@/store/cart";
import type { SelectedOptionsMap } from "@/types/cart";
import { calcOptionsTotal } from "@/types/cart";
import type { Product, ProductOption, ProductOptionGroup, ProductVariant } from "@/types/product";

interface Props {
  product: Product;
}

export function ProductDetailPage({ product }: Props) {
  const { addItem, openDrawer } = useCartStore();

  // ── State ──────────────────────────────────────────────────────────
  const variant: ProductVariant = product.variants[0];
  const groups = product.optionGroups ?? [];

  // selectedOptions: Record<groupId, Record<optionId, quantity>>
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

  // Which groups are expanded
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const g of groups) {
      init[g.id] = true; // todos abiertos por defecto
    }
    return init;
  });

  // ── Derived ────────────────────────────────────────────────────────

  /** Convierte el estado selections al formato SelectedOptionsMap del carrito */
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
  const totalQty = Object.values(selections).reduce(
    (sum, group) => sum + Object.values(group).reduce((s, q) => s + q, 0),
    0,
  );

  /** ¿Están completos todos los grupos requeridos? */
  const isComplete = useMemo(() => {
    for (const g of groups) {
      if (!g.isRequired) continue;
      const groupSel = selections[g.id] ?? {};
      const total = Object.values(groupSel).reduce((s, q) => s + q, 0);
      if (total < g.minSelect) return false;
    }
    return true;
  }, [groups, selections]);

  // ── Handlers ───────────────────────────────────────────────────────

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

  // ── Helpers ────────────────────────────────────────────────────────

  function groupStatus(g: ProductOptionGroup): { label: string; color: "green" | "gray" } {
    const groupSel = selections[g.id] ?? {};
    const total = Object.values(groupSel).reduce((s, q) => s + q, 0);
    if (g.isRequired && total < g.minSelect) {
      return { label: "Requerido", color: "gray" };
    }
    return { label: "Completado", color: "green" };
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
          return `${opt?.name ?? ""} x ${qty}`;
        })
        .join(", ");
    }
    return "";
  }

  // Badge colors
  const badgeGreen = { backgroundColor: "#dcfce7", color: "#15803d" };
  const badgeGray = { backgroundColor: "#f3f4f6", color: "#374151" };
  const textGray = { color: "#6b7280" };
  const textDark = { color: "#111" };
  const textMuted = { color: "#9ca3af" };
  const borderColor = { borderColor: "#e0e0e0" };

  return (
    <div className="pb-24" style={{ backgroundColor: "#ffffff" }}>
      <main className="mx-auto max-w-7xl py-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* ── Left Panel ──────────────────────────────────────────── */}
        <section>
          <h1 className="text-3xl font-black mb-6" style={textDark}>
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
              <span className="text-3xl font-black leading-none" style={textDark}>
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
            style={{ ...textGray, borderColor: "#f0f0f0" }}
          >
            {product.description}
          </p>

          {/* Summary Checklist */}
          {groups.length > 0 && (
            <div className="mt-8 space-y-4">
              <h3 className="font-black text-lg" style={textDark}>
                Personaliza tu pedido
              </h3>
              <div className="space-y-3">
                {groups.map((g) => {
                  const status = groupStatus(g);
                  const badge = status.color === "green" ? badgeGreen : badgeGray;
                  return (
                    <div
                      key={g.id}
                      className="flex justify-between items-center p-3 rounded-lg border cursor-pointer"
                      style={{
                        backgroundColor: status.color === "green" ? "#f8f8f8" : "#ffffff",
                        ...borderColor,
                      }}
                      onClick={() => toggleGroup(g.id)}
                    >
                      <div>
                        <p className="text-sm font-black" style={textDark}>
                          {g.name}
                        </p>
                        <p className="text-xs" style={textGray}>
                          {groupSummary(g)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] px-2 py-0.5 rounded font-bold uppercase"
                          style={badge}
                        >
                          {status.label}
                        </span>
                        <span style={textMuted}>
                          {expanded[g.id] ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M5 15l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                            </svg>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* ── Right Panel: Option Groups ────────────────────────────── */}
        <section className="space-y-6">
          {groups.map((g) => {
            const groupSel = selections[g.id] ?? {};
            const status = groupStatus(g);
            const badge = status.color === "green" ? badgeGreen : badgeGray;
            const totalInGroup = Object.values(groupSel).reduce((s, q) => s + q, 0);

            return (
              <div
                key={g.id}
                className="border rounded-xl overflow-hidden shadow-sm"
                style={borderColor}
              >
                <div
                  className="p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleGroup(g.id)}
                >
                  <h2 className="font-black text-lg" style={textDark}>
                    {g.name}
                  </h2>
                  {expanded[g.id] ? (
                    <svg className="w-5 h-5" style={textMuted} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M5 15l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" style={textMuted} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  )}
                </div>

                <div className="px-4 pb-2 flex items-center justify-between">
                  {g.selectionType === "quantity" ? (
                    <span className="text-xs italic" style={textMuted}>
                      {totalInGroup} seleccionadas
                    </span>
                  ) : (
                    <span className="text-xs italic" style={textMuted}>
                      {g.isRequired ? `Elige ${g.minSelect} opción` : "Opcional"}
                    </span>
                  )}
                  <span
                    className="text-[10px] px-2 py-0.5 rounded font-bold uppercase"
                    style={badge}
                  >
                    {status.label}
                  </span>
                </div>

                {expanded[g.id] && (
                  <div className="divide-y" style={borderColor}>
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
                )}
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
              isComplete
                ? ""
                : "opacity-50 cursor-not-allowed"
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

// ── Option Row Component ──────────────────────────────────────────────

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
  const textColor = isActive ? "#111" : "#9ca3af";
  const borderStyle = { borderColor: "#d1d5db" };

  if (group.selectionType === "single") {
    return (
      <label
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 group"
        style={borderStyle}
      >
        <div className="flex items-center gap-4">
          {option.imageUrl && (
            <img
              alt={option.name}
              className="w-12 h-12 rounded shadow-sm border"
              style={borderStyle}
              src={option.imageUrl}
            />
          )}
          <span className="font-bold" style={{ color: "#111" }}>
            {option.name}
            {option.priceDelta > 0 && (
              <span className="font-medium ml-1 text-sm" style={{ color: "#9ca3af" }}>
                + S/ {option.priceDelta.toFixed(2)}
              </span>
            )}
          </span>
        </div>
        <input
          className="w-5 h-5 border-gray-300"
          style={{ accentColor: "#e4002b" }}
          type="radio"
          name={group.id}
          checked={isActive}
          onChange={onSelect}
        />
      </label>
    );
  }

  // selectionType === "quantity"
  return (
    <div
      className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      style={borderStyle}
    >
      <div className="flex items-center gap-4" style={{ color: textColor }}>
        {option.imageUrl && (
          <img
            alt={option.name}
            className={`w-12 h-12 rounded shadow-sm border ${
              isActive ? "" : "grayscale opacity-50"
            }`}
            style={borderStyle}
            src={option.imageUrl}
          />
        )}
        <span className="font-bold">{option.name}</span>
        {option.priceDelta > 0 && (
          <span className="text-xs font-bold" style={{ color: "#6b7280" }}>
            + S/ {option.priceDelta.toFixed(2)}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {isActive ? (
          <div
            className="flex items-center border rounded-lg p-1 bg-white"
            style={borderStyle}
          >
            <button
              onClick={() => onUpdate(-1)}
              className="w-7 h-7 flex items-center justify-center font-bold hover:bg-gray-50 rounded-md transition-colors"
              style={{ color: "#e4002b" }}
            >
              {selectedQty === 1 ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              ) : (
                "-"
              )}
            </button>
            <span className="w-8 text-center font-bold text-sm">
              {selectedQty}
            </span>
            <button
              onClick={() => onUpdate(1)}
              className="w-7 h-7 flex items-center justify-center font-bold hover:bg-gray-50 rounded-md transition-colors"
              style={{ color: "#e4002b" }}
            >
              +
            </button>
          </div>
        ) : (
          <button
            onClick={() => onUpdate(1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md hover:opacity-90 active:scale-95 transition-all"
            style={{ backgroundColor: "#e4002b" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
