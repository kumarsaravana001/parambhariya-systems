import * as React from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "../primitives/Button";
import { cn } from "../utils/cn";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  ({ className, title, description, onRetry, retryLabel = "Try again", ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center text-center px-6 py-12 gap-3 rounded-lg border border-border-default bg-surface-card",
        className
      )}
      {...props}
    >
      <TriangleAlert className="h-10 w-10 text-danger-fg" aria-hidden />
      <div>
        <h2 className="text-lg font-semibold text-text-primary leading-snug">{title}</h2>
        {description && <p className="text-sm text-text-muted mt-1 max-w-md mx-auto">{description}</p>}
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  )
);
ErrorState.displayName = "ErrorState";
