import * as React from "react";
import { cn } from "../utils/cn";

export interface KanbanColumnProps extends React.HTMLAttributes<HTMLDivElement> {
  header: React.ReactNode;
  count?: number;
  empty?: React.ReactNode;
}

/** Visual lane container — does not handle drag-and-drop. */
export const KanbanColumn = React.forwardRef<HTMLDivElement, KanbanColumnProps>(
  ({ className, header, count, empty, children, ...props }, ref) => {
    const items = React.Children.toArray(children);
    return (
      <div
        ref={ref}
        className={cn(
          "bg-surface-muted rounded-lg p-3 flex flex-col gap-2 min-h-[12rem]",
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between gap-2 mb-1">
          {header}
          {typeof count === "number" && (
            <span className="text-xs text-text-muted font-mono">{count}</span>
          )}
        </div>
        {items.length === 0
          ? empty ?? <span className="text-xs text-text-muted italic">No items</span>
          : items}
      </div>
    );
  }
);
KanbanColumn.displayName = "KanbanColumn";
