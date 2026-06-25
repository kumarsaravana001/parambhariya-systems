import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "../utils/cn";

export const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> & {
    orientation?: "vertical" | "horizontal";
  }
>(({ className, orientation = "vertical", ...props }, ref) => (
  <RadioGroupPrimitive.Root
    ref={ref}
    className={cn("flex gap-3", orientation === "vertical" ? "flex-col" : "flex-row flex-wrap", className)}
    {...props}
  />
));
RadioGroup.displayName = "RadioGroup";

export const Radio = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      "h-5 w-5 shrink-0 rounded-full border bg-surface-card",
      "border-border-strong hover:border-text-secondary",
      "transition-colors duration-[120ms]",
      "data-[state=checked]:border-brand-500",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      className
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="grid place-items-center h-full w-full">
      <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-brand-500" />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
));
Radio.displayName = "Radio";
