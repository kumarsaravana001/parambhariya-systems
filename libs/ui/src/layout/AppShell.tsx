import * as React from "react";
import { cn } from "../utils/cn";

export interface AppShellProps {
  topBar?: React.ReactNode;
  sidebar?: React.ReactNode;
  bottomNav?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function AppShell({ topBar, sidebar, bottomNav, children, className }: AppShellProps) {
  return (
    <div className={cn("min-h-svh flex flex-col bg-surface-bg", className)}>
      {/* Skip link — first focusable element, lets keyboard/SR users jump past
          the ~13 nav stops straight to the page content (WCAG 2.4.1). */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[var(--z-toast)] focus:rounded-md focus:bg-surface-card focus:px-4 focus:py-2 focus:text-text-primary focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
      >
        Skip to main content
      </a>
      {topBar}
      <div className="flex flex-1 min-h-0">
        {sidebar}
        <main id="main-content" tabIndex={-1} className="flex-1 min-w-0 focus:outline-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-10">{children}</div>
        </main>
      </div>
      {bottomNav}
    </div>
  );
}
