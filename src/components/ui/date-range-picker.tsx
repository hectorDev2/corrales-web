"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import {
  addDaysISO,
  addMonths,
  formatLong,
  formatShort,
  monthTitle,
  monthWeeks,
  parseISODate,
  startOfMonth,
  toISODate,
  todayISO,
} from "@/lib/dates";

export interface DateRange {
  from: string;
  to: string;
}

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

const ICON = (filled = false) => ({
  fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
});

function presets(today: string): { id: string; label: string; range: DateRange }[] {
  const t = today;
  const monthStart = toMonthStart(t);
  return [
    { id: "today", label: "Hoy", range: { from: t, to: t } },
    { id: "yesterday", label: "Ayer", range: { from: addDaysISO(t, -1), to: addDaysISO(t, -1) } },
    { id: "7d", label: "Últimos 7 días", range: { from: addDaysISO(t, -6), to: t } },
    { id: "30d", label: "Últimos 30 días", range: { from: addDaysISO(t, -29), to: t } },
    { id: "month", label: "Este mes", range: { from: monthStart, to: t } },
  ];
}

function toMonthStart(iso: string) {
  return `${iso.slice(0, 8)}01`;
}

// ─── Mes ──────────────────────────────────────────────────────────────────────

function MonthGrid({
  month,
  from,
  to,
  hover,
  min,
  max,
  onPick,
  onHover,
}: {
  month: Date;
  from: string | null;
  to: string | null;
  hover: string | null;
  min?: string;
  max?: string;
  onPick: (iso: string) => void;
  onHover: (iso: string | null) => void;
}) {
  const weeks = useMemo(() => monthWeeks(month), [month]);
  const today = todayISO();

  // Mientras se elige el final, el rango «provisional» sigue al cursor.
  const end = to ?? (from && hover ? hover : null);
  const lo = from && end ? (from < end ? from : end) : from;
  const hi = from && end ? (from < end ? end : from) : from;

  return (
    <div role="grid" aria-label={monthTitle(month)} className="w-full select-none">
      <div role="row" className="mb-1 grid grid-cols-7">
        {WEEKDAYS.map((d) => (
          <div key={d} role="columnheader" className="text-outline py-1 text-center text-[11px] font-bold">
            {d}
          </div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} role="row" className="grid grid-cols-7">
          {week.map((iso, di) => {
            if (!iso) return <div key={di} role="gridcell" />;
            const disabled = (min !== undefined && iso < min) || (max !== undefined && iso > max);
            const isStart = iso === lo;
            const isEnd = iso === hi;
            const inRange = lo && hi && iso > lo && iso < hi;
            const selected = isStart || isEnd;
            const hasSpan = lo && hi && lo !== hi;

            let band: string | undefined;
            if (inRange) band = "var(--range-band)";
            else if (hasSpan && isStart)
              band = "linear-gradient(to right, transparent 50%, var(--range-band) 50%)";
            else if (hasSpan && isEnd)
              band = "linear-gradient(to left, transparent 50%, var(--range-band) 50%)";

            return (
              <div key={di} role="gridcell" className="flex justify-center py-0.5" style={{ background: band }}>
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={formatLong(iso)}
                  aria-pressed={selected}
                  aria-current={iso === today ? "date" : undefined}
                  onClick={() => onPick(iso)}
                  onMouseEnter={() => onHover(iso)}
                  onFocus={() => onHover(iso)}
                  className={`flex size-9 items-center justify-center rounded-full text-sm font-semibold transition-colors md:size-10 ${
                    selected
                      ? "bg-primary text-on-primary shadow-primary/30 shadow-md"
                      : disabled
                        ? "text-outline/40 cursor-not-allowed"
                        : "text-on-surface hover:bg-primary/10"
                  } ${iso === today && !selected ? "ring-primary/50 ring-1" : ""}`}
                >
                  {Number(iso.slice(8))}
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Selector ─────────────────────────────────────────────────────────────────

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
  /** Última fecha seleccionable (por defecto hoy). */
  max?: string;
  min?: string;
  label?: string;
  /** Muestra los rangos rápidos (Hoy, Ayer, 7 días...). Útil para historiales, no para fechas futuras. */
  showPresets?: boolean;
}

export function DateRangePicker({ value, onChange, max = todayISO(), min, label = "Período", showPresets = true }: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => startOfMonth(parseISODate(showPresets ? value.to : value.from)));
  const [draftFrom, setDraftFrom] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const list = showPresets ? presets(todayISO()) : [];
  const matched = list.find((p) => p.range.from === value.from && p.range.to === value.to);
  const sameDay = value.from === value.to;
  const sameYear = value.from.slice(0, 4) === value.to.slice(0, 4);
  const text =
    matched?.label ??
    (sameDay
      ? formatShort(value.from, true)
      : `${formatShort(value.from, !sameYear)} – ${formatShort(value.to, true)}`);

  function show() {
    setMonth(startOfMonth(parseISODate(showPresets ? value.to : value.from)));
    setDraftFrom(null);
    setHover(null);
    setOpen(true);
  }
  function close() {
    setOpen(false);
    setDraftFrom(null);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  function pick(iso: string) {
    if (!draftFrom) {
      setDraftFrom(iso);
      return;
    }
    const [from, to] = iso < draftFrom ? [iso, draftFrom] : [draftFrom, iso];
    onChange({ from, to });
    close();
  }

  const nextMonth = addMonths(month, 1);
  const canNext = toISODate(nextMonth) <= max;

  const navButton = (dir: -1 | 1, disabled = false, className = "") => (
    <button
      type="button"
      onClick={() => setMonth((m) => addMonths(m, dir))}
      disabled={disabled}
      aria-label={dir === -1 ? "Mes anterior" : "Mes siguiente"}
      className={`bg-surface-container-high text-on-surface-variant flex size-9 items-center justify-center rounded-full transition-colors hover:bg-primary/10 disabled:opacity-30 ${className}`}
    >
      <span className="material-symbols-outlined text-xl" style={ICON()}>
        {dir === -1 ? "chevron_left" : "chevron_right"}
      </span>
    </button>
  );
  const spacer = <span className="size-9" aria-hidden="true" />;

  return (
    <div ref={rootRef} className="relative" style={{ "--range-band": "rgba(228,0,43,0.10)" } as React.CSSProperties}>
      <button
        type="button"
        onClick={() => (open ? close() : show())}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        className={`bg-surface-container-high flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all md:w-auto md:min-w-72 ${
          open ? "ring-primary/40 ring-2" : "hover:bg-surface-container-highest"
        }`}
      >
        <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-xl">
          <span className="material-symbols-outlined text-xl" style={ICON(true)}>
            calendar_month
          </span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="text-secondary block text-[10px] font-bold tracking-widest uppercase">{label}</span>
          <span className="text-on-surface block truncate text-sm font-black">{text}</span>
        </span>
        <span className="material-symbols-outlined text-outline text-xl" style={ICON()}>
          {open ? "expand_less" : "expand_more"}
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 md:hidden" aria-hidden="true" />
          <div
            id={`${id}-panel`}
            role="dialog"
            aria-label="Elegir período"
            className="fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] overflow-y-auto rounded-t-3xl bg-white p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl md:absolute md:inset-x-auto md:top-full md:bottom-auto md:left-0 md:mt-2 md:w-[680px] md:max-w-[90vw] md:rounded-3xl md:p-5 md:pb-5 md:ring-1 md:ring-black/5"
          >
            <div className="bg-outline-variant mx-auto mb-3 h-1.5 w-10 rounded-full md:hidden" aria-hidden="true" />

            {/* Rangos rápidos */}
            {showPresets && (
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
              {list.map((p) => {
                const active = matched?.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onChange(p.range);
                      close();
                    }}
                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all active:scale-95 ${
                      active
                        ? "bg-primary text-on-primary shadow-primary/25 shadow-md"
                        : "bg-surface-container-high text-on-surface-variant hover:bg-primary/10"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
            )}

            {/* Meses */}
            <div className="grid gap-6 md:grid-cols-2" onMouseLeave={() => setHover(null)}>
              {[month, nextMonth].map((m, i) => (
                <div key={i} className={i === 1 ? "hidden md:block" : ""}>
                  <div className="mb-2 flex items-center justify-between">
                    {i === 0 ? navButton(-1) : spacer}
                    <p className="text-on-surface text-sm font-black">{monthTitle(m)}</p>
                    {i === 1 ? navButton(1, !canNext) : navButton(1, !canNext, "md:hidden")}
                    {i === 0 && <span className="hidden md:block">{spacer}</span>}
                  </div>
                  <MonthGrid
                    month={m}
                    from={draftFrom ?? value.from}
                    to={draftFrom ? null : value.to}
                    hover={hover}
                    min={min}
                    max={max}
                    onPick={pick}
                    onHover={setHover}
                  />
                </div>
              ))}
            </div>

            <p className="text-on-surface-variant mt-4 text-center text-xs">
              {draftFrom ? `Desde el ${formatShort(draftFrom, true)} — elige el último día` : "Toca el primer y el último día"}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
