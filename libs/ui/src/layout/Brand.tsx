import * as React from "react";
import { cn } from "../utils/cn";
import { BrandMark } from "../icons/BrandMark";

export interface BrandProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  hint?: string;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: { box: "h-7 w-7 rounded-md text-base", name: "text-sm font-semibold" },
  md: { box: "h-9 w-9 rounded-md text-lg", name: "text-base font-semibold" },
  lg: { box: "h-14 w-14 rounded-xl text-3xl", name: "text-2xl font-bold tracking-[-0.015em]" },
} as const;

export const Brand = React.forwardRef<HTMLDivElement, BrandProps>(
  ({ className, name = "Parambhariya", hint, size = "md", ...props }, ref) => {
    const s = SIZES[size];
    return (
      <div ref={ref} className={cn("flex items-center gap-2.5", className)} {...props}>
        <div
          aria-hidden
          className={cn("bg-brand-500 text-white shrink-0 grid place-items-center", s.box)}
        >
          <BrandMark />
        </div>
        <div className="flex flex-col leading-tight">
          <span className={cn("text-text-primary", s.name)}>{name}</span>
          {hint && <span className="text-xs text-text-muted">{hint}</span>}
        </div>
      </div>
    );
  }
);
Brand.displayName = "Brand";
