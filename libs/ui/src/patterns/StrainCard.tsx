import * as React from "react";
import { Dna } from "lucide-react";
import { Card } from "../primitives/Card";
import { Tag } from "../primitives/Tag";
import { cn } from "../utils/cn";

export interface StrainCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  scientific?: string;
  optimalTempC?: [number, number];
  optimalRhPct?: [number, number];
  cycleDays?: number;
  yieldKg?: number;
}

const range = (r?: [number, number], unit?: string) =>
  r ? `${r[0]} – ${r[1]}${unit ? ` ${unit}` : ""}` : "—";

export const StrainCard = React.forwardRef<HTMLDivElement, StrainCardProps>(
  ({ className, name, scientific, optimalTempC, optimalRhPct, cycleDays, yieldKg, ...props }, ref) => (
    <Card ref={ref} interactive className={cn("flex flex-col gap-3", className)} {...props}>
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-md bg-brand-50 dark:bg-surface-muted grid place-items-center text-brand-700 shrink-0" aria-hidden>
          <Dna className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-md font-semibold text-text-primary leading-snug tracking-tight truncate">{name}</h3>
          {scientific && <div className="text-xs text-text-muted italic truncate">{scientific}</div>}
        </div>
        {typeof yieldKg === "number" && <Tag tone="success" size="sm">{yieldKg.toFixed(1)} kg</Tag>}
      </div>
      <dl className="grid grid-cols-3 gap-2 text-center">
        <div>
          <dt className="text-[10px] uppercase tracking-[0.06em] text-text-muted">Temp</dt>
          <dd className="font-mono text-sm">{range(optimalTempC, "°C")}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.06em] text-text-muted">RH</dt>
          <dd className="font-mono text-sm">{range(optimalRhPct, "%")}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.06em] text-text-muted">Cycle</dt>
          <dd className="font-mono text-sm">{typeof cycleDays === "number" ? `${cycleDays} d` : "—"}</dd>
        </div>
      </dl>
    </Card>
  )
);
StrainCard.displayName = "StrainCard";
