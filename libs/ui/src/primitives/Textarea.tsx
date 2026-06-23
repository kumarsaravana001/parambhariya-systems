import * as React from "react";
import { cn } from "../utils/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => (
    <textarea
      ref={ref}
      data-invalid={invalid || undefined}
      className={cn(
        "min-h-[80px] w-full rounded-md border bg-surface-card px-3 py-2 text-base text-text-primary",
        "placeholder:text-text-muted",
        "border-border-default hover:border-border-strong",
        "transition-colors duration-[120ms]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "data-[invalid]:border-danger-fg data-[invalid]:focus-visible:ring-danger-fg",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
