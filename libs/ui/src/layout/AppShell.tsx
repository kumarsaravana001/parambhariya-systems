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
      {topBar}
      <div className="flex flex-1 min-h-0">
        {sidebar}
        <main className="flex-1 min-w-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-10">{children}</div>
        </main>
      </div>
      {bottomNav}
    </div>
  );
}
