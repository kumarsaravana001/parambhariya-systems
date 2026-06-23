import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  FlaskConical, Database, FolderTree, Download,
  SlidersHorizontal, ScrollText, ShieldCheck, LayoutDashboard,
} from "lucide-react";

const SUBNAV = [
  { label: "Dashboard",     href: "/lab",               icon: <LayoutDashboard />, exact: true },
  { label: "Cultures",      href: "/lab/cultures",      icon: <FlaskConical /> },
  { label: "Storage",       href: "/lab/storage",       icon: <Database /> },
  { label: "Categories",    href: "/lab/categories",    icon: <FolderTree /> },
  { label: "Data & Backup", href: "/lab/data",          icon: <Download /> },
  { label: "Custom Fields", href: "/lab/custom-fields", icon: <SlidersHorizontal /> },
  { label: "Audit Logs",    href: "/lab/audit",         icon: <ScrollText /> },
  { label: "Security",      href: "/lab/security",      icon: <ShieldCheck /> },
];

function LabLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <div className="h-10 w-10 rounded-md bg-brand-50 grid place-items-center text-brand-700 shrink-0" aria-hidden>
          <FlaskConical className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.06em] text-text-muted">Parambhariya · Internal</div>
          <h1 className="text-xl font-bold tracking-[-0.015em] text-text-primary leading-tight">Lab Portal</h1>
        </div>
      </div>

      {/* sub-nav */}
      <nav aria-label="Lab portal" className="mb-6 -mx-1 overflow-x-auto">
        <ul className="flex items-center gap-1 px-1 border-b border-border-default">
          {SUBNAV.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={[
                    "inline-flex items-center gap-2 h-10 px-3 -mb-px border-b-2 text-sm font-medium whitespace-nowrap",
                    "[&_svg]:h-4 [&_svg]:w-4 transition-colors duration-[120ms]",
                    active
                      ? "border-brand-500 text-brand-700"
                      : "border-transparent text-text-secondary hover:text-text-primary",
                  ].join(" ")}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Outlet />
    </div>
  );
}

export const Route = createFileRoute("/lab")({ component: LabLayout });
