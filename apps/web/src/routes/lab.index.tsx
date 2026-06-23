import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardTitle, Button, EmptyState } from "@parambhariya/ui";
import {
  FlaskConical, CheckCircle2, Database, FolderTree, Zap, Pencil, ChevronRight,
} from "lucide-react";
import {
  cultures, cultureStats, storageCount, categoryCount,
} from "../data/lab";

function Stat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-white/10 px-4 py-3 backdrop-blur-sm">
      <span className={`h-9 w-9 rounded-md grid place-items-center ${tone} [&_svg]:h-5 [&_svg]:w-5`} aria-hidden>{icon}</span>
      <div>
        <div className="font-mono text-2xl font-semibold leading-none text-white">{value}</div>
        <div className="text-[11px] uppercase tracking-[0.06em] text-white/70 mt-1">{label}</div>
      </div>
    </div>
  );
}

function LabDashboard() {
  const s = cultureStats();
  const active = cultures.filter((c) => c.status === "active").length;
  const inactive = cultures.filter((c) => c.status === "inactive" || c.status === "archived").length;
  const contaminated = cultures.filter((c) => c.contaminated).length;

  return (
    <div>
      {/* hero banner */}
      <div className="rounded-xl bg-brand-900 p-6 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-700/40 to-transparent pointer-events-none" aria-hidden />
        <div className="relative flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-white/15 grid place-items-center text-white" aria-hidden>
              <FlaskConical className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-[-0.015em] text-white">Parambhariya Lab</div>
              <div className="text-sm text-white/70">Coimbatore, Tamil Nadu</div>
            </div>
          </div>
          <Button variant="secondary" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            <Pencil className="h-4 w-4" /> Edit lab
          </Button>
        </div>
        <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat icon={<FlaskConical />} label="Total Cultures" value={s.total} tone="bg-info-fg/30 text-white" />
          <Stat icon={<CheckCircle2 />} label="Active Cultures" value={s.active} tone="bg-success-fg/30 text-white" />
          <Stat icon={<Database />} label="Storage Locations" value={storageCount()} tone="bg-warn-fg/30 text-white" />
          <Stat icon={<FolderTree />} label="Categories" value={categoryCount()} tone="bg-brand-300/30 text-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        {/* left column */}
        <div className="flex flex-col gap-6">
          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <CardTitle>Culture Health</CardTitle>
              <Link to="/lab/cultures" className="text-sm text-brand-700 hover:underline">View all</Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Active", count: active, tone: "success" as const },
                { label: "Inactive", count: inactive, tone: "neutral" as const },
                { label: "Contaminated", count: contaminated, tone: "danger" as const },
              ].map((r) => (
                <div key={r.label} className="rounded-lg border border-border-default p-4 text-center">
                  <div className={`font-mono text-2xl font-semibold ${r.tone === "success" ? "text-success-fg" : r.tone === "danger" ? "text-danger-fg" : "text-text-secondary"}`}>{r.count}</div>
                  <div className="text-xs text-text-muted mt-1">{r.label}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card padding="lg">
            <CardTitle className="mb-4">Recent Activity</CardTitle>
            <EmptyState
              icon={<Zap />}
              title="No activity yet"
              description="Add your first culture to get started — passages, edits, and imports will show up here."
              action={<Link to="/lab/cultures"><Button size="sm"><FlaskConical className="h-4 w-4" /> Go to Cultures</Button></Link>}
            />
          </Card>
        </div>

        {/* right column */}
        <div className="flex flex-col gap-6">
          <Card padding="lg">
            <CardTitle className="mb-3">Quick Actions</CardTitle>
            <div className="flex flex-col">
              {[
                { label: "Go to Cultures", to: "/lab/cultures" as const },
                { label: "Storage Locations", to: "/lab/storage" as const },
                { label: "Categories", to: "/lab/categories" as const },
                { label: "Audit Logs", to: "/lab/audit" as const },
              ].map((a) => (
                <Link key={a.to} to={a.to} className="flex items-center justify-between py-2 text-sm text-text-primary hover:text-brand-700 border-b border-border-default last:border-0">
                  {a.label} <ChevronRight className="h-4 w-4 text-text-muted" />
                </Link>
              ))}
            </div>
          </Card>

          <Card padding="lg">
            <CardTitle className="mb-3">Lab Info</CardTitle>
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><dt className="text-text-muted">Cultures</dt><dd className="font-mono">{s.total}</dd></div>
              <div className="flex justify-between"><dt className="text-text-muted">Storage nodes</dt><dd className="font-mono">{storageCount()}</dd></div>
              <div className="flex justify-between"><dt className="text-text-muted">Categories</dt><dd className="font-mono">{categoryCount()}</dd></div>
              <div className="flex justify-between"><dt className="text-text-muted">Access</dt><dd>Internal only</dd></div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/lab/")({ component: LabDashboard });
