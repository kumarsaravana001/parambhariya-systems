import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn";

const iconButtonVariants = cva(
  [
    "inline-flex items-center justify-center rounded-md",
    "transition-colors duration-[120ms]",
    "disabled:pointer-events-none disabled:opacity-50",
    "focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
  ].join(" "),
  {
    variants: {
      variant: {
        ghost: "text-text-primary hover:bg-surface-muted",
        secondary: "bg-surface-card border border-border-default text-text-primary hover:bg-surface-muted",
        danger: "text-danger-fg hover:bg-danger-bg",
      },
      size: {
        sm: "h-8 w-8 [&_svg]:h-4 [&_svg]:w-4",
        md: "h-10 w-10 [&_svg]:h-5 [&_svg]:w-5",
        lg: "h-12 w-12 [&_svg]:h-6 [&_svg]:w-6",
      },
    },
    defaultVariants: { variant: "ghost", size: "md" },
  }
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  "aria-label": string; // required — icon-only buttons must label themselves for SR
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(iconButtonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
IconButton.displayName = "IconButton";
