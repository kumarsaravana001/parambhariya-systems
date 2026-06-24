import * as React from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "../utils/cn";

export interface SidebarNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  active?: boolean;
  /** Optional badge count (e.g. open alerts) shown on the right of the row. */
  badge?: number;
}

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  items: SidebarNavItem[];
  /** Optional renderer to integrate with a router Link component. */
  renderItem?: (item: SidebarNavItem, content: React.ReactNode) => React.ReactNode;
  /** Optional footer (user/tenant card etc.) anchored at the bottom. */
  footer?: React.ReactNode;
  /** Controlled collapse state. Default starts expanded. */
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  ({ className, items, renderItem, footer, collapsed, defaultCollapsed, onCollapsedChange, ...props }, ref) => {
    const [internal, setInternal] = React.useState(defaultCollapsed ?? false);
    const isCollapsed = collapsed ?? internal;
    const toggle = () => {
      const next = !isCollapsed;
      onCollapsedChange?.(next);
      if (collapsed === undefined) setInternal(next);
    };
    return (
      <aside
        ref={ref}
        data-collapsed={isCollapsed || undefined}
        className={cn(
          "hidden md:flex md:flex-col",
          "shrink-0 border-r border-border-default bg-surface-card",
          "py-3 px-2 gap-1 sticky top-16 self-start h-[calc(100dvh-4rem)] overflow-y-auto",
          "transition-[width] duration-[180ms]",
          isCollapsed ? "w-[72px]" : "w-60",
          className
        )}
        {...props}
      >
        <nav className="flex flex-col gap-1 flex-1" aria-label="Primary">
          {items.map((item) => {
            const content = (
              <span
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 h-10 rounded-md text-sm font-medium",
                  "transition-colors duration-[120ms]",
                  "hover:bg-surface-muted",
                  "[&_svg]:h-5 [&_svg]:w-5 [&_svg]:shrink-0",
                  item.active
                    ? "bg-brand-50 dark:bg-surface-muted text-brand-700"
                    : "text-text-secondary hover:text-text-primary",
                  isCollapsed && "justify-center px-0"
                )}
              >
                {item.icon}
                {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
                {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto text-xs font-mono bg-danger-bg text-danger-fg px-1.5 py-0.5 rounded-sm">
                    {item.badge}
                  </span>
                )}
              </span>
            );
            if (renderItem) return <React.Fragment key={item.href}>{renderItem(item, content)}</React.Fragment>;
            return (
              <a key={item.href} href={item.href} aria-current={item.active ? "page" : undefined}>
                {content}
              </a>
            );
          })}
        </nav>
        {footer && !isCollapsed && <div className="border-t border-border-default pt-3 mt-2">{footer}</div>}
        <button
          type="button"
          onClick={toggle}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-pressed={isCollapsed}
          className={cn(
            "mt-2 flex items-center gap-2 px-3 h-9 rounded-md text-xs font-medium text-text-muted",
            "hover:bg-surface-muted hover:text-text-primary",
            "focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
            isCollapsed && "justify-center px-0"
          )}
        >
          {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          {!isCollapsed && <span>Collapse</span>}
        </button>
      </aside>
    );
  }
);
Sidebar.displayName = "Sidebar";
