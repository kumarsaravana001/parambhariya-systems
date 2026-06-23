import * as React from "react";
import { Thermometer, Droplets, Wind, Sun, AlertTriangle } from "lucide-react";
import { Card } from "../primitives/Card";
import { Tag } from "../primitives/Tag";
import { Button } from "../primitives/Button";
import { cn } from "../utils/cn";

export type AlertMetric = "temp" | "rh" | "co2" | "light" | "offline";

const METRIC_ICON: Record<AlertMetric, React.ReactNode> = {
  temp: <Thermometer />,
  rh: <Droplets />,
  co2: <Wind />,
  light: <Sun />,
  offline: <AlertTriangle />,
};
const METRIC_LABEL: Record<AlertMetric, string> = {
  temp: "Temperature",
  rh: "Humidity",
  co2: "CO₂",
  light: "Light",
  offline: "Sensor offline",
};

export interface AlertRowProps extends React.HTMLAttributes<HTMLDivElement> {
  metric: AlertMetric;
  severity: "warn" | "critical";
  /** "Room A-2 · Fruiting" — where the reading came from. */
  source: string;
  value?: string;
  threshold?: string;
  agoLabel: string;
  acknowledged?: boolean;
  onAcknowledge?: () => void;
  onView?: () => void;
}

export const AlertRow = React.forwardRef<HTMLDivElement, AlertRowProps>(
  ({ className, metric, severity, source, value, threshold, agoLabel, acknowledged, onAcknowledge, onView, ...props }, ref) => {
    const tone = severity === "critical" ? "danger" : "warn";
    return (
      <Card
        ref={ref}
        padding="none"
        className={cn(
          "overflow-hidden",
          severity === "critical" && !acknowledged && "border-danger-fg/40",
          className
        )}
        {...props}
      >
        <div className={cn(
          "flex items-start gap-3 p-4",
          severity === "critical" ? "bg-danger-bg" : "bg-warn-bg"
        )}>
          <span aria-hidden className={cn("[&_svg]:h-5 [&_svg]:w-5",
            severity === "critical" ? "text-danger-fg" : "text-warn-fg")}>
            {METRIC_ICON[metric]}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className={cn("font-semibold leading-snug",
                severity === "critical" ? "text-danger-fg" : "text-warn-fg")}>
                {METRIC_LABEL[metric]} out of range
              </span>
              <Tag tone={tone} size="sm">{severity.toUpperCase()}</Tag>
              {acknowledged && <Tag tone="neutral" size="sm">ACKED</Tag>}
            </div>
            <div className="text-sm text-text-primary mt-1">{source}</div>
            <div className="mt-1 flex items-center gap-3 text-xs text-text-muted font-mono">
              {value && <span>Current {value}</span>}
              {threshold && <span>Threshold {threshold}</span>}
              <span>{agoLabel}</span>
            </div>
          </div>
        </div>
        {(onAcknowledge || onView) && !acknowledged && (
          <div className="px-4 py-2 flex items-center justify-end gap-2 border-t border-border-default bg-surface-card">
            {onView && <Button variant="secondary" size="sm" onClick={onView}>View zone</Button>}
            {onAcknowledge && <Button variant="primary" size="sm" onClick={onAcknowledge}>Acknowledge</Button>}
          </div>
        )}
      </Card>
    );
  }
);
AlertRow.displayName = "AlertRow";
