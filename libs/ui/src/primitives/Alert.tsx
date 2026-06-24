import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "../utils/cn";

const alertVariants = cva(
  "relative w-full rounded-md border p-4 flex gap-3 items-start",
  {
    variants: {
      tone: {
        success: "bg-success-bg border-success-fg/20 text-success-fg",
        warn: "bg-warn-bg border-warn-fg/20 text-warn-fg",
        danger: "bg-danger-bg border-danger-fg/30 text-danger-fg",
        info: "bg-info-bg border-info-fg/20 text-info-fg",
        neutral: "bg-neutral-bg border-border-default text-text-primary",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
);

const ICONS = {
  success: CheckCircle2,
  warn: AlertTriangle,
  danger: AlertTriangle,
  info: Info,
  neutral: Info,
} as const;

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  /** Critical sensor alerts must NOT be dismissible. Only pass onDismiss for non-critical info banners. */
  onDismiss?: () => void;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, tone = "neutral", title, children, onDismiss, ...props }, ref) => {
    const Icon = ICONS[tone ?? "neutral"];
    return (
      <div ref={ref} role="alert" className={cn(alertVariants({ tone }), className)} {...props}>
        <Icon className="h-5 w-5 shrink-0 mt-0.5" aria-hidden />
        <div className="flex-1 min-w-0">
          {title && <div className="font-semibold leading-snug">{title}</div>}
          {children && <div className="text-sm mt-1 text-text-primary/90">{children}</div>}
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            className="shrink-0 grid place-items-center rounded-md p-2 -m-1 hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
    );
  }
);
Alert.displayName = "Alert";
