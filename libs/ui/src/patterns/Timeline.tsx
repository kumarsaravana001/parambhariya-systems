import * as React from "react";
import { cn } from "../utils/cn";

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  time: string;
  icon?: React.ReactNode;
  tone?: "default" | "success" | "warn" | "danger" | "info";
}

const DOT_TONE = {
  default: "bg-brand-500",
  success: "bg-success-fg",
  warn:    "bg-warn-fg",
  danger:  "bg-danger-fg",
  info:    "bg-info-fg",
} as const;

export interface TimelineProps extends React.HTMLAttributes<HTMLOListElement> {
  events: TimelineEvent[];
}

export const Timeline = React.forwardRef<HTMLOListElement, TimelineProps>(
  ({ className, events, ...props }, ref) => (
    <ol ref={ref} className={cn("relative flex flex-col gap-0", className)} {...props}>
      {events.map((e, i) => {
        const last = i === events.length - 1;
        return (
          <li key={e.id} className="relative flex gap-3 pb-5 pl-1">
            {!last && (
              <span aria-hidden className="absolute left-2.5 top-5 bottom-0 w-px bg-border-default" />
            )}
            <span className={cn("relative z-10 mt-1 h-2.5 w-2.5 rounded-full shrink-0 ring-2 ring-surface-bg",
              DOT_TONE[e.tone ?? "default"])} />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <div className="text-sm font-medium text-text-primary truncate">{e.title}</div>
                <div className="text-xs text-text-muted font-mono shrink-0">{e.time}</div>
              </div>
              {e.description && <div className="text-xs text-text-muted mt-0.5">{e.description}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  )
);
Timeline.displayName = "Timeline";
