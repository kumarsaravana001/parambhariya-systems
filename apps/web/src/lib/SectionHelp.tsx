import * as React from "react";
import { Eye, EyeOff, BookOpen } from "lucide-react";
import { cn } from "@parambhariya/ui";

export interface SectionHelpProps {
  /** stable id → remembers open/closed per section in localStorage */
  id: string;
  title?: string;
  /** each item: a heading + body, or just a body line */
  items: { label?: string; body: string }[];
  className?: string;
}

/**
 * Per-section "How to use" guide. An eye button toggles a panel explaining the
 * screen. State persists per section so a grower can hide guides they know.
 */
export function SectionHelp({ id, title = "How to use this section", items, className }: SectionHelpProps) {
  const key = `parambhariya.help.${id}`;
  const [open, setOpen] = React.useState<boolean>(() => {
    try { return localStorage.getItem(key) === "1"; } catch { return false; }
  });
  const toggle = () => {
    setOpen((o) => {
      const next = !o;
      try { localStorage.setItem(key, next ? "1" : "0"); } catch {}
      return next;
    });
  };

  return (
    <div className={cn("mb-4", className)}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="inline-flex items-center gap-2 h-8 px-2.5 rounded-md text-sm font-medium text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors duration-[120ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        {open ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        {open ? "Hide guide" : "How to use"}
      </button>

      {open && (
        <div className="mt-2 rounded-lg border border-info-fg/20 bg-info-bg p-4">
          <div className="flex items-center gap-2 mb-2 text-info-fg">
            <BookOpen className="h-4 w-4" aria-hidden />
            <span className="text-sm font-semibold">{title}</span>
          </div>
          <ul className="flex flex-col gap-1.5">
            {items.map((it, i) => (
              <li key={i} className="text-sm text-text-primary/90 flex gap-2">
                <span aria-hidden className="text-info-fg mt-0.5">•</span>
                <span>
                  {it.label && <span className="font-medium">{it.label}: </span>}
                  {it.body}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
