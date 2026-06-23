import * as React from "react";
import { DoorOpen, ChevronRight, Thermometer, Droplets } from "lucide-react";
import { Card } from "../primitives/Card";
import { Tag } from "../primitives/Tag";
import { cn } from "../utils/cn";

export interface RoomCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  /** "Colonization" / "Fruiting" / "Pinning" / "Storage" */
  purpose?: string;
  zones?: number;
  /** Aggregate reading across the room's zones. */
  tempC?: number;
  rhPct?: number;
  status?: "OK" | "WARN" | "ALARM";
}

export const RoomCard = React.forwardRef<HTMLDivElement, RoomCardProps>(
  ({ className, name, purpose, zones, tempC, rhPct, status = "OK", ...props }, ref) => {
    const tone = status === "ALARM" ? "danger" : status === "WARN" ? "warn" : "success";
    return (
      <Card ref={ref} interactive className={cn("flex items-start gap-3", className)} {...props}>
        <div className="h-10 w-10 rounded-md bg-surface-muted grid place-items-center text-text-secondary shrink-0" aria-hidden>
          <DoorOpen className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-md font-semibold text-text-primary leading-snug tracking-tight truncate">{name}</h3>
              {purpose && <div className="text-xs text-text-muted mt-0.5">{purpose}</div>}
            </div>
            <Tag tone={tone} size="sm">{status}</Tag>
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-text-muted font-mono">
            {typeof zones === "number" && <span>{zones} zones</span>}
            {typeof tempC === "number" && (
              <span className="inline-flex items-center gap-1"><Thermometer className="h-3.5 w-3.5" />{tempC.toFixed(1)} °C</span>
            )}
            {typeof rhPct === "number" && (
              <span className="inline-flex items-center gap-1"><Droplets className="h-3.5 w-3.5" />{rhPct.toFixed(1)} %</span>
            )}
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-text-muted self-center shrink-0" aria-hidden />
      </Card>
    );
  }
);
RoomCard.displayName = "RoomCard";
