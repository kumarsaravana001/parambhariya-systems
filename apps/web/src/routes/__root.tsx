import * as React from "react";
import { createRootRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import {
  AppShell, TopBar, Sidebar, BottomNav, Brand, Button, IconButton, Avatar, TooltipProvider,
} from "@parambhariya/ui";
import {
  Sprout, TriangleAlert, ChartBar, Dna, Settings, LogOut, Bell,
  LayoutDashboard, Workflow, Component,
} from "lucide-react";
import { alerts } from "../data/mock";

const NAV = [
  { label: "Dashboard",  href: "/dashboard",  icon: <LayoutDashboard /> },
  { label: "Farms",      href: "/farms",      icon: <Sprout /> },
  { label: "Strains",    href: "/strains",    icon: <Dna /> },
  { label: "Alerts",     href: "/alerts",     icon: <TriangleAlert /> },
  { label: "Reports",    href: "/reports",    icon: <ChartBar /> },
  { label: "Flows",      href: "/flows",      icon: <Workflow /> },
  { label: "Components", href: "/components", icon: <Component /> },
  { label: "Settings",   href: "/settings",   icon: <Settings /> },
];

function Shell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isLogin = pathname === "/" || pathname === "/login";

  if (isLogin) {
    return (
      <TooltipProvider>
        <Outlet />
      </TooltipProvider>
    );
  }

  const openAlerts = alerts.filter((a) => !a.acknowledged).length;

  const items = NAV.map((n) => ({
    ...n,
    active: pathname.startsWith(n.href),
    badge: n.href === "/alerts" ? openAlerts : undefined,
  }));
  // Mobile bottom = first 4 nav entries (spec: 4-tab mobile shell)
  const mobile = items.slice(0, 4);

  return (
    <TooltipProvider>
      <AppShell
        topBar={
          <TopBar
            left={
              <Link to="/dashboard" aria-label="Parambhariya home">
                <Brand name="Parambhariya" hint="Farm management" size="sm" />
              </Link>
            }
            right={
              <>
                <Link to="/alerts" aria-label="Alerts">
                  <IconButton aria-label="Alerts" variant="ghost" size="sm" className="relative">
                    <Bell />
                    {openAlerts > 0 && (
                      <span
                        aria-hidden
                        className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 grid place-items-center rounded-full bg-danger-fg text-white text-[10px] font-mono leading-none"
                      >
                        {openAlerts}
                      </span>
                    )}
                  </IconButton>
                </Link>
                <Avatar size="sm" initials="SK" />
                <Link to="/login">
                  <Button variant="ghost" size="sm" aria-label="Log out">
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Log out</span>
                  </Button>
                </Link>
              </>
            }
          />
        }
        sidebar={
          <Sidebar
            items={items}
            renderItem={(item, content) => (
              <Link to={item.href} aria-current={item.active ? "page" : undefined}>
                {content}
              </Link>
            )}
          />
        }
        bottomNav={
          <BottomNav
            items={mobile}
            renderItem={(item, content) => (
              <Link to={item.href} aria-current={item.active ? "page" : undefined}>
                {content}
              </Link>
            )}
          />
        }
      >
        <Outlet />
      </AppShell>
    </TooltipProvider>
  );
}

export const Route = createRootRoute({ component: Shell });
