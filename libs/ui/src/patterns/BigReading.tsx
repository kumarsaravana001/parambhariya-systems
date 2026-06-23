import * as React from "react";
import { cn } from "../utils/cn";
import { Card } from "../primitives/Card";
import { Spark } from "./Spark";

export interface BigReadingProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  /** Optimal range "22 – 26 °C". */
  range?: string;
  /** "12s ago", or `—` for no reading. */
  freshness?: string;
  /** Tone driven by domain rules (in-band = default, drifting = warn, out = danger). */
  tone?: "default" | "warn" | "danger" | "success";
  /** Inline sparkline data. */
  trend?: number[];
}

const TONE_TEXT = {
  default: "text-text-primary",
  warn:    "text-warn-fg",
  danger:  "text-danger-fg",
  success: "text-success-fg",
} as const;
const TONE_SPARK = {
  default: "text-brand-500",
  warn:    "text-warn-fg",
  danger:  "text-danger-fg",
  success: "text-success-fg",
} as const;

/**
 * BigReading — hero sensor display. Used in zone detail. Pairs a giant
 * mono numeral with unit, optimal range, freshness, and an optional trend.
 */
export const BigReading = React.forwardRef<HTMLDivElement, BigReadingProps>(
  ({ className, label, value, unit, icon, range, freshness, tone = "default", trend, ...props }, ref) => (
    <Card ref={ref} className={cn("flex flex-col gap-3", className)} {...props}>
      <div className="flex items-center justify-between gap-2 text-text-muted">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.06em]">
          {icon && <span className="[&_svg]:h-4 [&_svg]:w-4">{icon}</span>}
          {label}
        </span>
        {freshness && <span className="text-xs font-mono">{freshness}</span>}
      </div>
      <div className={cn("flex items-baseline gap-2", TONE_TEXT[tone])}>
        <span className="font-mono text-[42px] font-semibold leading-none tracking-tight">{value}</span>
        {unit && <span className="font-mono text-base text-text-muted">{unit}</span>}
      </div>
      <div className="flex items-end justify-between gap-3">
        {range ? (
          <span className="text-xs text-text-muted">
            Optimal&nbsp;<span className="font-mono text-text-secondary">{range}</span>
          </span>
        ) : <span />}
        {trend && trend.length > 0 && <Spark data={trend} className={TONE_SPARK[tone]} width={120} height={32} />}
      </div>
    </Card>
  )
);
BigReading.displayName = "BigReading";
