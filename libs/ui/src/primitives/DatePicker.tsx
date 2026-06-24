import * as React from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { cn } from "../utils/cn";

/* ── date helpers (no library) ───────────────────────────── */
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const sameDay = (a?: Date | null, b?: Date | null) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const isBetween = (d: Date, a: Date, b: Date) => {
  const t = startOfDay(d).getTime();
  return t > Math.min(a.getTime(), b.getTime()) && t < Math.max(a.getTime(), b.getTime());
};
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const fmt = (d?: Date | null) =>
  d ? `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]!.slice(0, 3)} ${d.getFullYear()}` : "";

function buildGrid(view: Date): (Date | null)[] {
  const first = new Date(view.getFullYear(), view.getMonth(), 1);
  const startPad = first.getDay();
  const days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(view.getFullYear(), view.getMonth(), d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export interface DateRange { from: Date | null; to: Date | null }

interface BaseProps {
  /** A fixed "today" for deterministic rendering (tests/SSR). Defaults to new Date(). */
  today?: Date;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}
interface SingleProps extends BaseProps {
  mode?: "single";
  value: Date | null;
  onChange: (d: Date | null) => void;
}
interface RangeProps extends BaseProps {
  mode: "range";
  value: DateRange;
  onChange: (r: DateRange) => void;
}
export type DatePickerProps = SingleProps | RangeProps;

export function DatePicker(props: DatePickerProps) {
  const { placeholder = "Pick a date", disabled, className, id } = props;
  const today = props.today ?? new Date();
  const isRange = props.mode === "range";

  const initial = isRange
    ? (props.value as DateRange).from ?? today
    : (props.value as Date | null) ?? today;
  const [view, setView] = React.useState(new Date(initial.getFullYear(), initial.getMonth(), 1));
  const [open, setOpen] = React.useState(false);

  const cells = React.useMemo(() => buildGrid(view), [view]);

  const label = isRange
    ? (() => {
        const r = props.value as DateRange;
        if (!r.from) return placeholder;
        if (!r.to) return `${fmt(r.from)} – …`;
        return `${fmt(r.from)} – ${fmt(r.to)}`;
      })()
    : fmt(props.value as Date | null) || placeholder;

  const pick = (d: Date) => {
    if (!isRange) {
      (props as SingleProps).onChange(d);
      setOpen(false);
      return;
    }
    const r = props.value as DateRange;
    const onChange = (props as RangeProps).onChange;
    if (!r.from || (r.from && r.to)) {
      onChange({ from: d, to: null });
    } else {
      onChange(d.getTime() < r.from.getTime() ? { from: d, to: r.from } : { from: r.from, to: d });
    }
  };

  const presets: { label: string; apply: () => void }[] = isRange
    ? [
        { label: "Today", apply: () => (props as RangeProps).onChange({ from: startOfDay(today), to: startOfDay(today) }) },
        { label: "Last 7 days", apply: () => (props as RangeProps).onChange({ from: addDays(startOfDay(today), -6), to: startOfDay(today) }) },
        { label: "Last 30 days", apply: () => (props as RangeProps).onChange({ from: addDays(startOfDay(today), -29), to: startOfDay(today) }) },
      ]
    : [
        { label: "Today", apply: () => { (props as SingleProps).onChange(startOfDay(today)); setOpen(false); } },
        { label: "Yesterday", apply: () => { (props as SingleProps).onChange(addDays(startOfDay(today), -1)); setOpen(false); } },
      ];

  const inSelected = (d: Date) => {
    if (!isRange) return sameDay(d, props.value as Date | null);
    const r = props.value as DateRange;
    return sameDay(d, r.from) || sameDay(d, r.to);
  };
  const inRangeMiddle = (d: Date) => {
    if (!isRange) return false;
    const r = props.value as DateRange;
    return !!r.from && !!r.to && isBetween(d, r.from, r.to);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center gap-2 rounded-md border bg-surface-card px-3 text-left text-base",
            "border-border-default hover:border-border-strong",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
        >
          <CalendarIcon className="h-4 w-4 text-text-muted shrink-0" aria-hidden />
          <span className={cn("flex-1 truncate", label === placeholder ? "text-text-muted" : "text-text-primary")}>
            {label}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <div className="flex">
          {/* quick-select sidebar */}
          <div className="hidden sm:flex flex-col gap-1 border-r border-border-default p-2 w-32">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={p.apply}
                className="text-left text-sm px-2 py-1.5 rounded-sm text-text-secondary hover:bg-surface-muted hover:text-text-primary"
              >
                {p.label}
              </button>
            ))}
          </div>
          {/* calendar */}
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <button type="button" aria-label="Previous month"
                onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
                className="rounded-sm p-1 text-text-muted hover:bg-surface-muted hover:text-text-primary">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold text-text-primary">
                {MONTHS[view.getMonth()]} {view.getFullYear()}
              </span>
              <button type="button" aria-label="Next month"
                onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
                className="rounded-sm p-1 text-text-muted hover:bg-surface-muted hover:text-text-primary">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {DOW.map((d) => (
                <div key={d} className="h-7 grid place-items-center text-[10px] font-mono text-text-muted">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {cells.map((d, i) => {
                if (!d) return <div key={i} />;
                const selected = inSelected(d);
                const middle = inRangeMiddle(d);
                const isToday = sameDay(d, today);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => pick(d)}
                    aria-pressed={selected}
                    className={cn(
                      "h-8 w-8 grid place-items-center rounded-md text-sm font-mono",
                      "hover:bg-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                      selected && "bg-brand-500 text-white hover:bg-brand-600",
                      middle && "bg-brand-50 dark:bg-surface-muted text-brand-700 rounded-none",
                      !selected && !middle && isToday && "ring-1 ring-border-strong"
                    )}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
