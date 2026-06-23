import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "../utils/cn";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-medium select-none",
    "transition-colors duration-[120ms]",
    "disabled:pointer-events-none disabled:opacity-50",
    "rounded-md",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
  ].join(" "),
  {
    variants: {
      variant: {
        // brand-500 is BACKGROUND ONLY (spec rule). Hover steps to brand-600/700.
        primary:
          "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700",
        secondary:
          "bg-surface-card border border-border-strong text-text-primary hover:bg-surface-muted active:bg-surface-sunken",
        ghost:
          "text-text-primary hover:bg-surface-muted active:bg-surface-sunken",
        danger:
          "bg-danger-fg text-white hover:opacity-90 active:opacity-80",
        // brand-as-text uses brand-700 (passes contrast).
        link:
          "text-brand-700 hover:underline underline-offset-2 px-0 h-auto",
      },
      size: {
        xs: "btn--xs h-7 px-2 text-xs gap-1 [&_svg]:h-3.5 [&_svg]:w-3.5",
        sm: "btn--sm h-8 px-3 text-sm gap-1.5 [&_svg]:h-4 [&_svg]:w-4",
        md: "h-10 px-4 text-base [&_svg]:h-4 [&_svg]:w-4",
        lg: "h-12 px-6 text-base [&_svg]:h-5 [&_svg]:w-5",
        icon: "h-10 w-10 [&_svg]:h-5 [&_svg]:w-5",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        aria-busy={loading || undefined}
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" aria-hidden />}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
