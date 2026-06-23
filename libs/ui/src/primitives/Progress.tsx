import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import type { LifecycleStage } from "../icons/lifecycle";
import { cn } from "../utils/cn";

const STAGE_FILL: Record<LifecycleStage, string> = {
  CREATED:      "bg-life-created-fg",
  COLONIZING:   "bg-life-colonizing-fg",
  PINNING:      "bg-life-pinning-fg",
  FRUITING:     "bg-life-fruiting-fg",
  HARVESTED:    "bg-life-harvested-fg",
  CONTAMINATED: "bg-life-contam-fg",
  DISPOSED:     "bg-neutral-fg",
};

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  /** 0..100 */
  value?: number;
  /** Lifecycle-aware tinting; defaults to brand. */
  stage?: LifecycleStage;
}

export const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value = 0, stage, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    value={value}
    className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken", className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn("h-full w-full flex-1 transition-transform duration-[180ms]", stage ? STAGE_FILL[stage] : "bg-brand-500")}
      style={{ transform: `translateX(-${100 - Math.max(0, Math.min(100, value))}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = "Progress";
