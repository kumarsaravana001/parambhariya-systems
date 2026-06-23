import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../utils/cn";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
}

export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, items, ...props }, ref) => (
    <nav ref={ref} aria-label="Breadcrumb" className={cn("text-sm", className)} {...props}>
      <ol className="flex items-center gap-1 flex-wrap">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {item.href && !last ? (
                <a
                  href={item.href}
                  className="text-text-muted hover:text-text-primary hover:underline underline-offset-2"
                >
                  {item.label}
                </a>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className={last ? "text-text-primary font-medium" : "text-text-muted"}
                >
                  {item.label}
                </span>
              )}
              {!last && <ChevronRight className="h-4 w-4 text-text-muted" aria-hidden />}
            </li>
          );
        })}
      </ol>
    </nav>
  )
);
Breadcrumb.displayName = "Breadcrumb";
