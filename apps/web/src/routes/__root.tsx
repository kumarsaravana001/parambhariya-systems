import * as React from "react";
import { createRootRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import {
  AppShell, TopBar, Sidebar, BottomNav, Brand, Button, IconButton, Avatar, TooltipProvider,
  Dialog, DialogContent, DialogHeader, DialogTitle, Toaster,
} from "@parambhariya/ui";
import {
  Sprout, TriangleAlert, ChartBar, Dna, Settings, LogOut, Bell,
  LayoutDashboard, Workflow, FlaskConical, TestTubes, Menu,
} from "lucide-react";
import { useAlerts, useLiveReadings } from "../lib/queries";

const NAV = [
  { label: "Dashboard",  href: "/dashboard",  icon: <LayoutDashboard /> },
  { label: "Farms",      href: "/farms",      icon: <Sprout /> },
  { label: "Strains",    href: "/strains",    icon: <Dna /> },
  { label: "Spawn",      href: "/spawn",      icon: <TestTubes /> },
  { label: "Alerts",     href: "/alerts",     icon: <TriangleAlert /> },
  { label: "Reports",    href: "/reports",    icon: <ChartBar /> },
  { label: "Flows",      href: "/flows",      icon: <Workflow /> },
  { label: "Lab Portal", href: "/lab",        icon: <FlaskConical /> },
  { label: "Settings",   href: "/settings",   icon: <Settings /> },
];

// Routes that live behind the mobile "More" sheet (everything not on the bottom bar).
const MORE_HREFS = ["/strains", "/reports", "/flows", "/lab", "/settings"];

function Shell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isLogin = pathname === "/" || pathname === "/login";
  const [moreOpen, setMoreOpen] = React.useState(false);

  // Keep the live control loop subscription + alert badge running app-wide.
  useLiveReadings();
  const alertsQ = useAlerts(true);
  const openAlerts = (alertsQ.data ?? []).length;

  if (isLogin) {
    return (
      <TooltipProvider>
        <Outlet />
      </TooltipProvider>
    );
  }

  const items = NAV.map((n) => ({
    ...n,
    active: pathname.startsWith(n.href),
    badge: n.href === "/alerts" ? openAlerts : undefined,
  }));
  const byHref = (h: string) => items.find((i) => i.href === h)!;
  // Mobile bottom bar: 4 thumb-zone tabs (Dashboard, Farms, Spawn, Alerts —
  // Alerts kept first-class so its badge stays visible) + a "More" sheet that
  // holds the rest. Everything stays reachable one-handed; nothing is dropped.
  const moreActive = MORE_HREFS.some((h) => pathname.startsWith(h));
  const mobile = [
    byHref("/dashboard"), byHref("/farms"), byHref("/spawn"), byHref("/alerts"),
    { label: "More", href: "__more__", icon: <Menu />, active: moreActive },
  ];
  const moreItems = MORE_HREFS.map(byHref);

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
                <Link to="/alerts" aria-label={openAlerts > 0 ? `Alerts, ${openAlerts} open` : "Alerts"}>
                  <IconButton aria-label={openAlerts > 0 ? `Alerts, ${openAlerts} open` : "Alerts"} variant="ghost" size="sm" className="relative">
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
            renderItem={(item, content) =>
              item.href === "__more__" ? (
                <button type="button" className="w-full" aria-haspopup="dialog" aria-expanded={moreOpen} onClick={() => setMoreOpen(true)}>
                  {content}
                </button>
              ) : (
                <Link to={item.href} aria-current={item.active ? "page" : undefined}>
                  {content}
                </Link>
              )
            }
          />
        }
      >
        <Outlet />
      </AppShell>

      {/* Mobile "More" sheet — the routes that don't fit the bottom bar */}
      <Dialog open={moreOpen} onOpenChange={setMoreOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>More</DialogTitle></DialogHeader>
          <nav className="flex flex-col gap-1">
            {moreItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMoreOpen(false)}
                aria-current={item.active ? "page" : undefined}
                className={
                  "flex items-center gap-3 px-3 h-12 rounded-md text-sm font-medium [&_svg]:h-5 [&_svg]:w-5 " +
                  (item.active ? "bg-brand-50 dark:bg-surface-muted text-brand-700" : "text-text-secondary hover:bg-surface-muted hover:text-text-primary")
                }
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="text-xs font-mono bg-danger-bg text-danger-fg px-1.5 py-0.5 rounded-sm">{item.badge}</span>
                )}
              </Link>
            ))}
          </nav>
        </DialogContent>
      </Dialog>
      <Toaster />
    </TooltipProvider>
  );
}

export const Route = createRootRoute({ component: Shell });
