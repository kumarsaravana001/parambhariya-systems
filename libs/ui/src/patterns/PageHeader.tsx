import * as React from "react";
import { cn } from "../utils/cn";

export interface PageHeaderProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  eyebrow?: string;
}

export const PageHeader = React.forwardRef<HTMLElement, PageHeaderProps>(
  ({ className, title, description, actions, eyebrow, ...props }, ref) => (
    <header
      ref={ref}
      className={cn("flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between mb-6", className)}
      {...props}
    >
      <div className="min-w-0">
        {eyebrow && (
          <div className="text-xs font-medium uppercase tracking-[0.06em] text-text-muted mb-1">
            {eyebrow}
          </div>
        )}
        <h1 className="text-xl font-bold text-text-primary leading-tight tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-text-muted mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </header>
  )
);
PageHeader.displayName = "PageHeader";
