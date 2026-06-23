import * as React from "react";
import { cn } from "../utils/cn";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, action, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        "rounded-lg border-2 border-dashed border-border-default",
        "px-6 py-12 gap-3",
        className
      )}
      {...props}
    >
      {icon && <div className="text-text-muted [&_svg]:h-10 [&_svg]:w-10">{icon}</div>}
      <div>
        <h2 className="text-lg font-semibold text-text-primary leading-snug">{title}</h2>
        {description && <p className="text-sm text-text-muted mt-1 max-w-md mx-auto">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
);
EmptyState.displayName = "EmptyState";
