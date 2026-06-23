import * as React from "react";
import { AlertTriangle, Info, X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn";

const bannerVariants = cva(
  "flex items-start gap-3 w-full rounded-lg border p-4",
  {
    variants: {
      tone: {
        critical: "bg-danger-bg border-danger-fg/40 text-danger-fg",
        warning:  "bg-warn-bg border-warn-fg/40 text-warn-fg",
        info:     "bg-info-bg border-info-fg/40 text-info-fg",
      },
    },
    defaultVariants: { tone: "info" },
  }
);

const ICON = { critical: AlertTriangle, warning: AlertTriangle, info: Info } as const;

export interface AlertBannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bannerVariants> {
  title: string;
  /** CRITICAL alerts must NOT be dismissible — omit onDismiss for them per spec. */
  onDismiss?: () => void;
  actions?: React.ReactNode;
}

/**
 * AlertBanner — for full-width persistent notices. Critical sensor banners
 * use tone="critical" and MUST NOT pass onDismiss (per design contract:
 * "never dismissible by tap-elsewhere").
 */
export const AlertBanner = React.forwardRef<HTMLDivElement, AlertBannerProps>(
  ({ className, tone = "info", title, children, onDismiss, actions, ...props }, ref) => {
    const Icon = ICON[tone ?? "info"];
    return (
      <div ref={ref} role="alert" aria-live="assertive" className={cn(bannerVariants({ tone }), className)} {...props}>
        <Icon className="h-5 w-5 mt-0.5 shrink-0" aria-hidden />
        <div className="flex-1 min-w-0">
          <div className="font-semibold leading-snug">{title}</div>
          {children && <div className="text-sm mt-1 text-text-primary/90">{children}</div>}
          {actions && <div className="mt-3 flex items-center gap-2">{actions}</div>}
        </div>
        {tone !== "critical" && onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            className="shrink-0 rounded-sm p-1 hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-current"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
    );
  }
);
AlertBanner.displayName = "AlertBanner";
