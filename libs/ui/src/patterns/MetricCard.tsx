import * as React from "react";
import { Card } from "../primitives/Card";
import { cn } from "../utils/cn";

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  /** A short context line, e.g. "Last reading 2 min ago" or a delta. */
  hint?: string;
  /** Out-of-range readings render in danger; warn band in warn. */
  tone?: "default" | "warn" | "danger" | "success";
}

const TONES = {
  default: "text-text-primary",
  warn: "text-warn-fg",
  danger: "text-danger-fg",
  success: "text-success-fg",
} as const;

export const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ className, label, value, unit, icon, hint, tone = "default", ...props }, ref) => (
    <Card ref={ref} className={cn("flex flex-col gap-2", className)} {...props}>
      <div className="flex items-center gap-2 text-text-muted">
        {icon && <span className="[&_svg]:h-4 [&_svg]:w-4">{icon}</span>}
        <span className="text-xs font-medium uppercase tracking-[0.06em]">{label}</span>
      </div>
      <div className={cn("flex items-baseline gap-1", TONES[tone])}>
        <span className="font-mono text-2xl font-semibold leading-none">{value}</span>
        {unit && <span className="font-mono text-sm text-text-muted">{unit}</span>}
      </div>
      {hint && <div className="text-xs text-text-muted">{hint}</div>}
    </Card>
  )
);
MetricCard.displayName = "MetricCard";
