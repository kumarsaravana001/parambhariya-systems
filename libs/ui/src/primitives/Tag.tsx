import * as React from "react";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn";

const tagVariants = cva(
  "inline-flex items-center gap-1 font-medium leading-none whitespace-nowrap",
  {
    variants: {
      tone: {
        success: "bg-success-bg text-success-fg",
        warn:    "bg-warn-bg text-warn-fg",
        danger:  "bg-danger-bg text-danger-fg",
        info:    "bg-info-bg text-info-fg",
        neutral: "bg-neutral-bg text-neutral-fg",
        brand:   "bg-brand-50 text-brand-700",
      },
      size: {
        sm: "h-5 px-2 rounded-sm text-[10px] [&_svg]:h-3 [&_svg]:w-3",
        md: "h-6 px-2.5 rounded-md text-xs [&_svg]:h-3.5 [&_svg]:w-3.5",
      },
    },
    defaultVariants: { tone: "neutral", size: "md" },
  }
);

export interface TagProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof tagVariants> {
  icon?: React.ReactNode;
  /** When set, renders a trailing × button that calls this callback. */
  onRemove?: () => void;
}

export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  ({ className, tone, size, icon, onRemove, children, ...props }, ref) => (
    <span ref={ref} className={cn(tagVariants({ tone, size }), className)} {...props}>
      {icon}
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          aria-label="Remove"
          className="ml-0.5 rounded-sm p-0.5 hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-current"
        >
          <X aria-hidden />
        </button>
      )}
    </span>
  )
);
Tag.displayName = "Tag";
