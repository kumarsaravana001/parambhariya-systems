import * as React from "react";
import { cn } from "../utils/cn";
import { LIFECYCLE_GLYPH, type LifecycleStage } from "../icons/lifecycle";

const TONE_BG: Record<LifecycleStage, string> = {
  CREATED:      "bg-life-created-bg",
  COLONIZING:   "bg-life-colonizing-bg",
  PINNING:      "bg-life-pinning-bg",
  FRUITING:     "bg-life-fruiting-bg",
  HARVESTED:    "bg-life-harvested-bg",
  CONTAMINATED: "bg-life-contam-bg",
  DISPOSED:     "bg-neutral-bg",
};
const TONE_FG: Record<LifecycleStage, string> = {
  CREATED:      "text-life-created-fg",
  COLONIZING:   "text-life-colonizing-fg",
  PINNING:      "text-life-pinning-fg",
  FRUITING:     "text-life-fruiting-fg",
  HARVESTED:    "text-life-harvested-fg",
  CONTAMINATED: "text-life-contam-fg",
  DISPOSED:     "text-neutral-fg",
};
/** Fill color when an internal progress overlay covers the label area. */
const FILL_BG: Record<LifecycleStage, string> = {
  CREATED:      "bg-life-created-fg",
  COLONIZING:   "bg-life-colonizing-fg",
  PINNING:      "bg-life-pinning-fg",
  FRUITING:     "bg-life-fruiting-fg",
  HARVESTED:    "bg-life-harvested-fg",
  CONTAMINATED: "bg-life-contam-fg",
  DISPOSED:     "bg-neutral-fg",
};

export interface LifeBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  stage: LifecycleStage;
  size?: "sm" | "md";
  /** 0..1 — renders internal progress fill. ≥0.5 switches label to -on-fill color. */
  progress?: number;
  /** Hide the glyph (text-only). */
  noGlyph?: boolean;
  /** Hide the label (glyph-only, for very tight rows). */
  noLabel?: boolean;
}

const SIZE = {
  sm: { pad: "h-5 px-2 text-[10px] gap-1 [&_svg]:h-3 [&_svg]:w-3", radius: "rounded-full" },
  md: { pad: "h-6 px-2.5 text-xs gap-1.5 [&_svg]:h-3.5 [&_svg]:w-3.5", radius: "rounded-full" },
} as const;

/**
 * LifeBadge — the canonical lifecycle pill. UPPER_SNAKE label, biology glyph,
 * optional internal progress fill. The fill uses the stage's foreground color
 * as the overlay; once it covers ≥50% of the pill, the label flips to the
 * spec's -on-fill color (white or near-black) to maintain contrast.
 */
export const LifeBadge = React.forwardRef<HTMLSpanElement, LifeBadgeProps>(
  ({ className, stage, size = "md", progress, noGlyph, noLabel, ...props }, ref) => {
    const Glyph = LIFECYCLE_GLYPH[stage];
    const s = SIZE[size];
    const hasFill = typeof progress === "number" && progress > 0;
    const filledLabel = hasFill && (progress ?? 0) >= 0.5;
    return (
      <span
        ref={ref}
        role="status"
        aria-label={`${stage}${typeof progress === "number" ? ` ${Math.round(progress * 100)}%` : ""}`}
        className={cn(
          "relative inline-flex items-center isolate overflow-hidden",
          "font-semibold uppercase tracking-[0.06em] leading-none",
          "font-mono",
          s.radius,
          s.pad,
          TONE_BG[stage],
          TONE_FG[stage],
          className
        )}
        {...props}
      >
        {hasFill && (
          <span
            aria-hidden
            className={cn("absolute inset-y-0 left-0 -z-10 transition-[width] duration-[180ms]", FILL_BG[stage])}
            style={{ width: `${Math.max(0, Math.min(1, progress!)) * 100}%` }}
          />
        )}
        {!noGlyph && <Glyph aria-hidden />}
        {!noLabel && (
          <span
            className={cn(
              "relative",
              filledLabel && (stage === "PINNING" ? "text-life-pinning-on-fill" : "text-white")
            )}
          >
            {stage}
          </span>
        )}
      </span>
    );
  }
);
LifeBadge.displayName = "LifeBadge";

export type { LifecycleStage };
export { LIFECYCLE_ORDER, LIFECYCLE_GLYPH } from "../icons/lifecycle";
