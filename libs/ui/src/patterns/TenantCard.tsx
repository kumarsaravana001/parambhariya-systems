import * as React from "react";
import { Check } from "lucide-react";
import { Card } from "../primitives/Card";
import { cn } from "../utils/cn";

export interface TenantCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  /** Hex string used as the brand swatch. */
  swatch: string;
  selected?: boolean;
}

export const TenantCard = React.forwardRef<HTMLDivElement, TenantCardProps>(
  ({ className, name, swatch, selected, ...props }, ref) => (
    <Card
      ref={ref}
      interactive
      className={cn(
        "flex items-center gap-3",
        selected && "border-brand-500 ring-1 ring-brand-500",
        className
      )}
      {...props}
    >
      <span
        aria-hidden
        className="h-10 w-10 rounded-md shrink-0"
        style={{ background: swatch }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-md font-semibold text-text-primary truncate">{name}</div>
        <div className="text-xs text-text-muted font-mono">{swatch}</div>
      </div>
      {selected && (
        <span aria-label="Selected" className="text-brand-700">
          <Check className="h-5 w-5" />
        </span>
      )}
    </Card>
  )
);
TenantCard.displayName = "TenantCard";
