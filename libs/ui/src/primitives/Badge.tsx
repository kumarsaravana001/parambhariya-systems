import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      tone: {
        success: "bg-success-bg text-success-fg",
        warn: "bg-warn-bg text-warn-fg",
        danger: "bg-danger-bg text-danger-fg",
        info: "bg-info-bg text-info-fg",
        neutral: "bg-neutral-bg text-neutral-fg",
        // lifecycle stages — these are domain values surfaced verbatim
        created: "bg-life-created-bg text-life-created-fg",
        colonizing: "bg-life-colonizing-bg text-life-colonizing-fg",
        pinning: "bg-life-pinning-bg text-life-pinning-fg",
        fruiting: "bg-life-fruiting-bg text-life-fruiting-fg",
        harvested: "bg-life-harvested-bg text-life-harvested-fg",
        contam: "bg-life-contam-bg text-life-contam-fg",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
);

/** Map UPPER_SNAKE_CASE bag/strain status enums → badge tone. */
export const lifecycleStatusToTone: Record<string, VariantProps<typeof badgeVariants>["tone"]> = {
  CREATED: "created",
  COLONIZING: "colonizing",
  PINNING: "pinning",
  FRUITING: "fruiting",
  HARVESTED: "harvested",
  CONTAMINATED: "contam",
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, tone, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ tone }), className)} {...props} />
  )
);
Badge.displayName = "Badge";

export { badgeVariants };
