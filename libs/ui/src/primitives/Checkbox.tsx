import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";
import { cn } from "../utils/cn";

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  size?: "sm" | "md";
  invalid?: boolean;
}

const SIZE = {
  sm: "h-4 w-4 rounded-sm [&_svg]:h-3 [&_svg]:w-3",
  md: "h-5 w-5 rounded-[6px] [&_svg]:h-4 [&_svg]:w-4",
} as const;

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, size = "md", invalid, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    data-invalid={invalid || undefined}
    className={cn(
      "shrink-0 grid place-items-center border bg-surface-card text-white",
      "border-border-strong transition-colors duration-[120ms]",
      "hover:border-text-secondary",
      "data-[state=checked]:bg-brand-500 data-[state=checked]:border-brand-500",
      "data-[state=indeterminate]:bg-brand-500 data-[state=indeterminate]:border-brand-500",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      "data-[invalid]:border-danger-fg",
      SIZE[size],
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator>
      {props.checked === "indeterminate" ? <Minus /> : <Check />}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = "Checkbox";
