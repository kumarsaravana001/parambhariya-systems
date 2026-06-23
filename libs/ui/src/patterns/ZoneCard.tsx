import * as React from "react";
import { LayoutGrid, Thermometer, Droplets, Wind, Sun } from "lucide-react";
import { Card } from "../primitives/Card";
import { Tag } from "../primitives/Tag";
import { cn } from "../utils/cn";

export interface ZoneReading {
  tempC?: number;
  rhPct?: number;
  co2Ppm?: number;
  lightLux?: number;
}

export interface ZoneCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  bags?: number;
  reading?: ZoneReading;
  status?: "OK" | "WARN" | "ALARM";
}

const cell = (icon: React.ReactNode, value?: string, unit?: string) => (
  <div className="flex flex-col items-center gap-0.5">
    <span aria-hidden className="text-text-muted [&_svg]:h-4 [&_svg]:w-4">{icon}</span>
    <span className="font-mono text-sm text-text-primary">{value ?? "—"}</span>
    {unit && <span className="font-mono text-[10px] text-text-muted">{unit}</span>}
  </div>
);

export const ZoneCard = React.forwardRef<HTMLDivElement, ZoneCardProps>(
  ({ className, name, bags, reading, status = "OK", ...props }, ref) => {
    const tone = status === "ALARM" ? "danger" : status === "WARN" ? "warn" : "success";
    return (
      <Card ref={ref} interactive className={cn("flex flex-col gap-3", className)} {...props}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <LayoutGrid className="h-4 w-4 text-text-muted shrink-0" aria-hidden />
            <h3 className="text-md font-semibold text-text-primary leading-snug tracking-tight truncate">{name}</h3>
          </div>
          <Tag tone={tone} size="sm">{status}</Tag>
        </div>
        {typeof bags === "number" && (
          <div className="text-xs text-text-muted font-mono">{bags} bags</div>
        )}
        <dl className="grid grid-cols-4 gap-2 text-center">
          {cell(<Thermometer />, reading?.tempC?.toFixed(1), "°C")}
          {cell(<Droplets />,    reading?.rhPct?.toFixed(1), "%")}
          {cell(<Wind />,        reading?.co2Ppm !== undefined ? String(reading.co2Ppm) : undefined, "ppm")}
          {cell(<Sun />,         reading?.lightLux !== undefined ? String(reading.lightLux) : undefined, "lx")}
        </dl>
      </Card>
    );
  }
);
ZoneCard.displayName = "ZoneCard";
