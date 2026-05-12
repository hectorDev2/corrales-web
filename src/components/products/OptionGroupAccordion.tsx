"use client";

import { useCallback } from "react";

import type { ProductOptionGroup } from "@/types/product";

interface Props {
  group: ProductOptionGroup;
  selections: Record<string, number>;
  onChange: (optionId: string, delta: number) => void;
  isOpen: boolean;
  onToggle: () => void;
}

function getSelectedCount(selections: Record<string, number>): number {
  return Object.values(selections).reduce((sum, qty) => sum + qty, 0);
}

function getStatusText(
  group: ProductOptionGroup,
  selections: Record<string, number>,
): string {
  const selected = getSelectedCount(selections);

  if (group.selectionType === "single") {
    if (selected === 0) return "Elige 1 opción";
    const selectedOption = group.options.find((o) => (selections[o.id] ?? 0) > 0);
    return selectedOption?.name ?? "Elige 1 opción";
  }

  if (group.selectionType === "quantity") {
    if (selected === 0) {
      if (group.maxSelect) return `Elige ${group.maxSelect} opciones`;
      return "Elige algunas opciones";
    }
    const labels = group.options
      .filter((o) => (selections[o.id] ?? 0) > 0)
      .map((o) => `${o.name} x ${selections[o.id]} un`);
    return labels.join(", ");
  }

  return "";
}

function getBadge(
  group: ProductOptionGroup,
  selections: Record<string, number>,
): { label: string; variant: "success" | "neutral" | "muted" } {
  const selected = getSelectedCount(selections);

  if (selected >= group.minSelect) {
    return { label: "Completado", variant: "success" };
  }
  if (group.isRequired) {
    return { label: "Requerido", variant: "neutral" };
  }
  return { label: "Opcional", variant: "muted" };
}

function OptionRow({
  optionId,
  name,
  imageUrl,
  priceDelta,
  selectionType,
  quantity,
  onIncrement,
  onDecrement,
  isAtMax,
}: {
  optionId: string;
  name: string;
  imageUrl: string | null;
  priceDelta: number;
  selectionType: "single" | "quantity";
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  isAtMax: boolean;
}) {
  const isSelected = quantity > 0;

  if (selectionType === "single") {
    return (
      <button
        type="button"
        onClick={isSelected ? onDecrement : onIncrement}
        className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl border-2 transition-all ${
          isSelected
            ? "border-primary bg-primary/5"
            : "border-transparent bg-surface-container-high hover:bg-surface-container-higher"
        }`}
      >
        {imageUrl && (
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container-higher flex-shrink-0">
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <div className="flex-1 text-left">
          <span className="text-sm font-bold text-on-surface">{name}</span>
        </div>
        {isSelected && (
          <span
            className="material-symbols-outlined text-primary"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            check_circle
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 px-3 py-3">
      {imageUrl && (
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container-higher flex-shrink-0">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-on-surface truncate">{name}</p>
        {priceDelta > 0 && (
          <p className="text-[11px] text-primary font-bold">
            + S/ {priceDelta.toFixed(2)}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onDecrement}
          disabled={quantity === 0}
          className="w-7 h-7 flex items-center justify-center rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label={`Reducir ${name}`}
        >
          <span
            className="material-symbols-outlined text-sm"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            remove
          </span>
        </button>
        <span className="w-5 text-center text-sm font-bold text-on-surface">
          {quantity}
        </span>
        <button
          type="button"
          onClick={onIncrement}
          disabled={isAtMax}
          className="w-7 h-7 flex items-center justify-center rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label={`Aumentar ${name}`}
        >
          <span
            className="material-symbols-outlined text-sm"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            add
          </span>
        </button>
      </div>
    </div>
  );
}

export function OptionGroupAccordion({
  group,
  selections,
  onChange,
  isOpen,
  onToggle,
}: Props) {
  const selectedCount = getSelectedCount(selections);
  const badge = getBadge(group, selections);
  const statusText = getStatusText(group, selections);

  const totalSelected = useCallback(
    () => getSelectedCount(selections),
    [selections],
  );

  const canIncrement = useCallback(
    (optionId: string) => {
      if (group.selectionType === "single") {
        return selectedCount < group.minSelect || selections[optionId] === 0;
      }
      if (group.maxSelect != null) {
        return totalSelected() < group.maxSelect;
      }
      return true;
    },
    [group, selections, selectedCount, totalSelected],
  );

  const badgeColors: Record<string, string> = {
    success: "bg-green-100 text-green-700",
    neutral: "bg-surface-container-higher text-on-surface-variant",
    muted: "bg-surface-container text-outline",
  };

  return (
    <section
      className="border-b border-outline-variant/30 last:border-b-0"
      aria-label={group.name}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full px-4 py-3 text-left"
      >
        <div className="flex-1 min-w-0">
          <span className="text-sm font-bold text-on-surface block">
            {group.name}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badgeColors[badge.variant]}`}>
              {badge.label}
            </span>
            {selectedCount > 0 && (
              <span className="text-[11px] text-on-surface-variant truncate">
                {statusText}
              </span>
            )}
          </div>
        </div>
        <span
          className={`material-symbols-outlined text-on-surface-variant transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
        >
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className="px-3 pb-3 space-y-1">
          {group.options.map((option) => {
            const qty = selections[option.id] ?? 0;
            const atMax =
              group.selectionType === "single"
                ? qty > 0
                : group.maxSelect != null && totalSelected() >= group.maxSelect && qty === 0;

            return (
              <OptionRow
                key={option.id}
                optionId={option.id}
                name={option.name}
                imageUrl={option.imageUrl}
                priceDelta={option.priceDelta}
                selectionType={group.selectionType}
                quantity={qty}
                onIncrement={() => onChange(option.id, 1)}
                onDecrement={() => onChange(option.id, -1)}
                isAtMax={atMax}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
