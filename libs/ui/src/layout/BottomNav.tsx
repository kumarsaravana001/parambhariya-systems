import * as React from "react";
import { cn } from "../utils/cn";

export interface BottomNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  active?: boolean;
}

export interface BottomNavProps extends React.HTMLAttributes<HTMLElement> {
  items: BottomNavItem[];
  renderItem?: (item: BottomNavItem, content: React.ReactNode) => React.ReactNode;
}

export const BottomNav = React.forwardRef<HTMLElement, BottomNavProps>(
  ({ className, items, renderItem, ...props }, ref) => (
    <nav
      ref={ref}
      aria-label="Primary"
      className={cn(
        "md:hidden",
        "fixed inset-x-0 bottom-0 z-[var(--z-nav)]",
        "bg-surface-card border-t border-border-default",
        "pb-[var(--safe-bottom)]",
        className
      )}
      {...props}
    >
      <ul className={cn(`grid`, items.length === 5 ? "grid-cols-5" : "grid-cols-4")}>
        {items.map((item) => {
          const content = (
            <span
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-2 min-h-[var(--touch-min)]",
                "text-[11px] font-medium",
                "[&_svg]:h-5 [&_svg]:w-5",
                item.active ? "text-brand-700" : "text-text-secondary"
              )}
              aria-current={item.active ? "page" : undefined}
            >
              {item.icon}
              <span>{item.label}</span>
            </span>
          );
          return (
            <li key={item.href}>
              {renderItem ? renderItem(item, content) : <a href={item.href}>{content}</a>}
            </li>
          );
        })}
      </ul>
    </nav>
  )
);
BottomNav.displayName = "BottomNav";
