import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "../utils/cn";

export interface FilterChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  count?: number;
}

export const FilterChip = React.forwardRef<HTMLButtonElement, FilterChipProps>(
  ({ className, active, count, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-sm font-medium border whitespace-nowrap",
        "transition-colors duration-[120ms]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2",
        active
          ? "bg-brand-500 text-white border-brand-500 hover:bg-brand-600"
          : "bg-surface-card text-text-secondary border-border-default hover:bg-surface-muted hover:text-text-primary",
        className
      )}
      {...props}
    >
      {active && <Check className="h-3.5 w-3.5" aria-hidden />}
      <span>{children}</span>
      {typeof count === "number" && (
        <span className={cn("font-mono text-xs", active ? "text-white/80" : "text-text-muted")}>
          {count}
        </span>
      )}
    </button>
  )
);
FilterChip.displayName = "FilterChip";
