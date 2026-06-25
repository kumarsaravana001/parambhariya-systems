import * as React from "react";
import { cn } from "../utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      data-invalid={invalid || undefined}
      className={cn(
        "h-10 w-full rounded-md border bg-surface-card px-3 text-base text-text-primary",
        "placeholder:text-text-muted",
        "border-border-default",
        "transition-colors duration-[120ms]",
        "hover:border-border-strong",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "data-[invalid]:border-danger-fg data-[invalid]:focus-visible:ring-danger-fg",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
