import * as React from "react";
import { Sprout, MapPin, ChevronRight } from "lucide-react";
import { Card } from "../primitives/Card";
import { Tag } from "../primitives/Tag";
import { cn } from "../utils/cn";

export interface FarmCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  location?: string;
  rooms?: number;
  bags?: number;
  alerts?: number;
}

export const FarmCard = React.forwardRef<HTMLDivElement, FarmCardProps>(
  ({ className, name, location, rooms, bags, alerts, ...props }, ref) => (
    <Card ref={ref} interactive className={cn("flex items-start gap-4", className)} {...props}>
      <div className="h-12 w-12 rounded-md bg-brand-50 dark:bg-surface-muted grid place-items-center text-brand-700 shrink-0" aria-hidden>
        <Sprout />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-md font-semibold text-text-primary leading-snug tracking-tight truncate">{name}</h3>
        {location && (
          <div className="text-sm text-text-muted mt-0.5 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" aria-hidden /> {location}
          </div>
        )}
        <div className="mt-3 flex items-center gap-2 flex-wrap text-xs text-text-muted">
          {typeof rooms === "number" && <span className="font-mono">{rooms} rooms</span>}
          {typeof bags === "number" && <><span aria-hidden>·</span><span className="font-mono">{bags} bags</span></>}
          {typeof alerts === "number" && alerts > 0 && (
            <><span aria-hidden>·</span>
            <Tag tone="danger" size="sm">{alerts} alert{alerts > 1 ? "s" : ""}</Tag></>
          )}
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-text-muted self-center shrink-0" aria-hidden />
    </Card>
  )
);
FarmCard.displayName = "FarmCard";
