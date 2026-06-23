import * as React from "react";
import { cn } from "../utils/cn";

export interface SparkProps extends React.SVGAttributes<SVGSVGElement> {
  data: number[];
  width?: number;
  height?: number;
  /** "line" or "area". Default "area". */
  variant?: "line" | "area";
  /** Color via CSS — pass any text-* class to set stroke/fill via currentColor. */
  className?: string;
  /** Min/max override; default = data min/max. */
  domain?: [number, number];
}

/** Tiny inline sparkline. No deps. */
export function Spark({
  data,
  width = 100,
  height = 28,
  variant = "area",
  domain,
  className,
  ...props
}: SparkProps) {
  if (data.length === 0) return null;
  const [min, max] = domain ?? [Math.min(...data), Math.max(...data)];
  const range = max - min || 1;
  const stepX = data.length > 1 ? width / (data.length - 1) : 0;
  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 2) - 1;
    return [x, y] as const;
  });
  const path = points.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");
  const area = `${path} L${width},${height} L0,${height} Z`;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      aria-hidden
      className={cn("text-brand-500", className)}
      {...props}
    >
      {variant === "area" && <path d={area} fill="currentColor" opacity="0.18" />}
      <path d={path} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
