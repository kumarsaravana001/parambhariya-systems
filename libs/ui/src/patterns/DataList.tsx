import * as React from "react";
import { cn } from "../utils/cn";

export interface DataListItem {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}

export interface DataListProps extends React.HTMLAttributes<HTMLDListElement> {
  items: DataListItem[];
  layout?: "stacked" | "inline";
}

export const DataList = React.forwardRef<HTMLDListElement, DataListProps>(
  ({ className, items, layout = "stacked", ...props }, ref) => (
    <dl
      ref={ref}
      className={cn(
        layout === "stacked" ? "flex flex-col gap-3" : "grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2",
        className
      )}
      {...props}
    >
      {items.map((item, i) => (
        <div
          key={i}
          className={cn(
            layout === "stacked"
              ? "flex flex-col gap-0.5"
              : "contents"
          )}
        >
          <dt className="text-xs font-medium uppercase tracking-[0.06em] text-text-muted">{item.label}</dt>
          <dd className={cn("text-base text-text-primary", item.mono && "font-mono")}>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
);
DataList.displayName = "DataList";
