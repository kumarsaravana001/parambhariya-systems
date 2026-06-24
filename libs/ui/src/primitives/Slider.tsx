import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "../utils/cn";

export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  showBubble?: boolean;
  formatValue?: (value: number) => string;
}

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, showBubble, formatValue, value, defaultValue, ...props }, ref) => {
  const vals = (value ?? defaultValue ?? [0]) as number[];
  return (
    <SliderPrimitive.Root
      ref={ref}
      value={value as number[] | undefined}
      defaultValue={defaultValue as number[] | undefined}
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-surface-sunken">
        <SliderPrimitive.Range className="absolute h-full bg-brand-500" />
      </SliderPrimitive.Track>
      {vals.map((v, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className={cn(
            "relative block h-5 w-5 rounded-full bg-white border-2 border-brand-500 shadow-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
            "disabled:opacity-50"
          )}
        >
          {showBubble && (
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 rounded-md bg-text-primary text-[var(--text-inverse)] text-xs px-1.5 py-0.5 font-mono whitespace-nowrap">
              {formatValue ? formatValue(v) : v}
            </span>
          )}
        </SliderPrimitive.Thumb>
      ))}
    </SliderPrimitive.Root>
  );
});
Slider.displayName = "Slider";
