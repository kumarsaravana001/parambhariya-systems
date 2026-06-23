import * as React from "react";
import { cn } from "../utils/cn";

export interface TopBarProps extends React.HTMLAttributes<HTMLElement> {
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export const TopBar = React.forwardRef<HTMLElement, TopBarProps>(
  ({ className, left, right, ...props }, ref) => (
    <header
      ref={ref}
      className={cn(
        "sticky top-0 z-[var(--z-nav)]",
        "bg-surface-card/95 backdrop-blur supports-[backdrop-filter]:bg-surface-card/85",
        "border-b border-border-default",
        "h-16 flex items-center justify-between gap-3 px-4",
        "pt-[var(--safe-top)]",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3 min-w-0">{left}</div>
      <div className="flex items-center gap-2">{right}</div>
    </header>
  )
);
TopBar.displayName = "TopBar";
