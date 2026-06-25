import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "../utils/cn";

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  size?: "sm" | "md";
}

const SIZE = {
  sm: { root: "h-5 w-9", thumb: "h-4 w-4 data-[state=checked]:translate-x-4" },
  md: { root: "h-6 w-11", thumb: "h-5 w-5 data-[state=checked]:translate-x-5" },
} as const;

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, size = "md", ...props }, ref) => {
  const s = SIZE[size];
  return (
    <SwitchPrimitive.Root
      ref={ref}
      className={cn(
        "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent",
        "transition-colors duration-[120ms]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "data-[state=checked]:bg-brand-500 data-[state=unchecked]:bg-surface-sunken",
        s.root,
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow-sm",
          "transition-transform duration-[120ms]",
          "data-[state=unchecked]:translate-x-0",
          s.thumb
        )}
      />
    </SwitchPrimitive.Root>
  );
});
Switch.displayName = "Switch";
