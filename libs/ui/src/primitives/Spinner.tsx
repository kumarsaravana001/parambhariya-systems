import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../utils/cn";

const SIZE = { xs: "h-3 w-3", sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6", xl: "h-8 w-8" } as const;

export interface SpinnerProps extends React.HTMLAttributes<SVGSVGElement> {
  size?: keyof typeof SIZE;
  /** Render as a full-overlay over the parent (parent must be relative). */
  overlay?: boolean;
  label?: string;
}

export function Spinner({ size = "md", overlay, label = "Loading…", className, ...props }: SpinnerProps) {
  const icon = (
    <Loader2
      role="status"
      aria-label={label}
      className={cn("animate-spin text-text-muted", SIZE[size], className)}
      {...props}
    />
  );
  if (!overlay) return icon;
  return (
    <span className="absolute inset-0 grid place-items-center bg-surface-card/70 backdrop-blur-[1px] z-[var(--z-overlay)]">
      {icon}
    </span>
  );
}
