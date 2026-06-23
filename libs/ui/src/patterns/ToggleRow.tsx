import * as React from "react";
import { cn } from "../utils/cn";

export interface ToggleRowProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  description?: string;
  control: React.ReactNode;
  icon?: React.ReactNode;
}

/** Settings-style row: label/description on the left, control on the right. */
export const ToggleRow = React.forwardRef<HTMLDivElement, ToggleRowProps>(
  ({ className, label, description, control, icon, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-start justify-between gap-4 py-3",
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3 min-w-0">
        {icon && <span className="mt-0.5 text-text-muted [&_svg]:h-5 [&_svg]:w-5">{icon}</span>}
        <div className="min-w-0">
          <div className="text-sm font-medium text-text-primary leading-snug">{label}</div>
          {description && <div className="text-xs text-text-muted mt-0.5">{description}</div>}
        </div>
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  )
);
ToggleRow.displayName = "ToggleRow";
