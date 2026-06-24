import * as React from "react";
import { cn } from "../utils/cn";
import { LIFECYCLE_GLYPH, LIFECYCLE_ORDER, type LifecycleStage } from "../icons/lifecycle";

const FILL: Record<LifecycleStage, string> = {
  CREATED:      "bg-life-created-fg text-[var(--text-inverse)]",
  COLONIZING:   "bg-life-colonizing-fg text-[var(--text-inverse)]",
  PINNING:      "bg-life-pinning-fg text-[var(--text-inverse)]",
  FRUITING:     "bg-life-fruiting-fg text-[var(--text-inverse)]",
  HARVESTED:    "bg-life-harvested-fg text-[var(--text-inverse)]",
  CONTAMINATED: "bg-life-contam-fg text-[var(--text-inverse)]",
  DISPOSED:     "bg-neutral-fg text-[var(--text-inverse)]",
};

export interface LifecycleStepperProps extends React.HTMLAttributes<HTMLOListElement> {
  current: LifecycleStage;
  /** 0..1 within the current stage (e.g. colonization day 12 of 17 → 0.7). */
  intraProgress?: number;
}

/**
 * LifecycleStepper — horizontal stage path for the bag detail page.
 * Off-track terminal states (CONTAMINATED, DISPOSED) render a single
 * status pill instead of the path.
 */
export const LifecycleStepper = React.forwardRef<HTMLOListElement, LifecycleStepperProps>(
  ({ className, current, intraProgress, ...props }, ref) => {
    if (current === "CONTAMINATED" || current === "DISPOSED") {
      const Glyph = LIFECYCLE_GLYPH[current];
      return (
        <div className={cn("flex items-center gap-3 text-danger-fg", className)}>
          <span className={cn("h-10 w-10 rounded-full grid place-items-center", FILL[current])}>
            <Glyph aria-hidden />
          </span>
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.06em]">{current}</div>
            <div className="text-xs text-text-muted">Off-track terminal state — remove from rotation.</div>
          </div>
        </div>
      );
    }
    const currentIdx = LIFECYCLE_ORDER.indexOf(current);
    return (
      <ol
        ref={ref}
        className={cn("grid grid-cols-5 gap-0 items-start", className)}
        {...props}
      >
        {LIFECYCLE_ORDER.map((stage, i) => {
          const reached = i <= currentIdx;
          const isCurrent = i === currentIdx;
          const isPast = i < currentIdx;
          const Glyph = LIFECYCLE_GLYPH[stage];
          const showProgress = isCurrent && typeof intraProgress === "number";
          return (
            <li key={stage} className="flex flex-col items-center text-center gap-1.5 relative">
              {/* connector to next */}
              {i < LIFECYCLE_ORDER.length - 1 && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-5 left-1/2 w-full h-px",
                    isPast || (isCurrent && !showProgress) ? "bg-brand-500" : "bg-border-default"
                  )}
                />
              )}
              <span
                aria-current={isCurrent || undefined}
                className={cn(
                  "relative h-10 w-10 rounded-full grid place-items-center text-sm font-semibold z-10",
                  "[&_svg]:h-5 [&_svg]:w-5",
                  reached ? FILL[stage] : "bg-surface-muted text-text-muted",
                  isCurrent && "ring-2 ring-brand-500 ring-offset-2"
                )}
              >
                <Glyph aria-hidden />
              </span>
              <span className={cn("text-[10px] font-mono font-semibold uppercase tracking-[0.06em]",
                reached ? "text-text-primary" : "text-text-muted")}>
                {stage}
              </span>
              {showProgress && (
                <span className="text-[10px] font-mono text-text-muted">
                  {Math.round((intraProgress ?? 0) * 100)}%
                </span>
              )}
            </li>
          );
        })}
      </ol>
    );
  }
);
LifecycleStepper.displayName = "LifecycleStepper";
