import * as React from "react";
import { cn } from "../utils/cn";

export interface EnvSeries {
  key: string;
  label: string;
  data: number[];
  /** Any text-* class; line uses currentColor of that tone. */
  colorClass?: string;
  unit?: string;
  /** Optional optimal band [min,max] shaded behind the line. */
  optimal?: [number, number];
}

export interface EnvChartProps extends React.HTMLAttributes<HTMLDivElement> {
  series: EnvSeries[];
  height?: number;
  /** x-axis tick labels (e.g. hours). */
  xLabels?: string[];
}

const PALETTE = ["text-danger-fg", "text-info-fg", "text-warn-fg", "text-brand-600"];

/**
 * EnvChart — multi-series sensor line chart, inline SVG, no deps. Each series
 * is normalised to its own min/max so temp/humidity/co2 can share one frame.
 * Renders an optimal band per series when provided.
 */
export const EnvChart = React.forwardRef<HTMLDivElement, EnvChartProps>(
  ({ className, series, height = 200, xLabels, ...props }, ref) => {
    const W = 600;
    const H = height;
    const padL = 8, padR = 8, padT = 12, padB = 22;
    const innerW = W - padL - padR;
    const innerH = H - padT - padB;

    const project = (data: number[], optimal?: [number, number]) => {
      const lo = Math.min(...data, ...(optimal ? [optimal[0]] : []));
      const hi = Math.max(...data, ...(optimal ? [optimal[1]] : []));
      const range = hi - lo || 1;
      const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;
      const x = (i: number) => padL + i * stepX;
      const y = (v: number) => padT + innerH - ((v - lo) / range) * innerH;
      return { x, y, lo, hi, range };
    };

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label="Environment chart">
          {/* horizontal gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <line
              key={t}
              x1={padL} x2={W - padR}
              y1={padT + innerH * t} y2={padT + innerH * t}
              className="text-border-default"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray={t === 0 || t === 1 ? "0" : "3 3"}
              opacity={t === 0 || t === 1 ? 0.6 : 0.4}
            />
          ))}

          {series.map((s, si) => {
            const { x, y } = project(s.data, s.optimal);
            const color = s.colorClass ?? PALETTE[si % PALETTE.length]!;
            const path = s.data.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(v)}`).join(" ");
            return (
              <g key={s.key} className={color}>
                {s.optimal && (
                  <rect
                    x={padL}
                    width={innerW}
                    y={y(s.optimal[1])}
                    height={Math.max(0, y(s.optimal[0]) - y(s.optimal[1]))}
                    fill="currentColor"
                    opacity="0.08"
                  />
                )}
                <path d={path} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                {/* last point dot */}
                <circle cx={x(s.data.length - 1)} cy={y(s.data[s.data.length - 1]!)} r="3" fill="currentColor" />
              </g>
            );
          })}

          {/* x labels */}
          {xLabels && xLabels.map((lbl, i) => {
            const stepX = xLabels.length > 1 ? innerW / (xLabels.length - 1) : 0;
            return (
              <text
                key={i}
                x={padL + i * stepX}
                y={H - 6}
                textAnchor={i === 0 ? "start" : i === xLabels.length - 1 ? "end" : "middle"}
                className="text-text-muted"
                fill="currentColor"
                fontSize="10"
                fontFamily="var(--font-mono)"
              >
                {lbl}
              </text>
            );
          })}
        </svg>

        {/* legend */}
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          {series.map((s, si) => {
            const color = s.colorClass ?? PALETTE[si % PALETTE.length]!;
            const last = s.data[s.data.length - 1];
            return (
              <span key={s.key} className="inline-flex items-center gap-1.5 text-xs">
                <span className={cn("h-2 w-2 rounded-full", color)} style={{ background: "currentColor" }} aria-hidden />
                <span className="text-text-secondary">{s.label}</span>
                <span className="font-mono text-text-primary">
                  {typeof last === "number" ? last.toFixed(s.unit === "%" || s.unit === "°C" ? 1 : 0) : "—"}{s.unit ? ` ${s.unit}` : ""}
                </span>
              </span>
            );
          })}
        </div>
      </div>
    );
  }
);
EnvChart.displayName = "EnvChart";
