import * as React from "react";
import { Package } from "lucide-react";
import { Card } from "../primitives/Card";
import { LifeBadge } from "../primitives/LifeBadge";
import type { LifecycleStage } from "../icons/lifecycle";
import { cn } from "../utils/cn";

export interface BagCardProps extends React.HTMLAttributes<HTMLDivElement> {
  code: string;
  strain?: string;
  zoneName?: string;
  stage: LifecycleStage;
  /** 0..1 progress within current stage. */
  progress?: number;
  ageDays?: number;
  weightG?: number;
}

export const BagCard = React.forwardRef<HTMLDivElement, BagCardProps>(
  ({ className, code, strain, zoneName, stage, progress, ageDays, weightG, ...props }, ref) => (
    <Card ref={ref} interactive className={cn("flex flex-col gap-2", className)} {...props}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Package className="h-4 w-4 text-text-muted shrink-0" aria-hidden />
          <span className="font-mono text-sm text-text-secondary">{code}</span>
        </div>
        <LifeBadge stage={stage} progress={progress} size="sm" />
      </div>
      {strain && <div className="text-sm text-text-primary truncate">{strain}</div>}
      <div className="flex items-center gap-3 text-xs text-text-muted">
        {zoneName && <span className="truncate">{zoneName}</span>}
        {typeof ageDays === "number" && <span className="font-mono">{ageDays} d</span>}
        {typeof weightG === "number" && <span className="font-mono">{weightG} g</span>}
      </div>
    </Card>
  )
);
BagCard.displayName = "BagCard";
