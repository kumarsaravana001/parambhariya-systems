import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  PageHeader, Card, CardTitle, Button, Badge, Tag, Pipeline, AlertRow, EmptyState,
  Progress, ListSkeleton, ErrorState, LIFECYCLE_ORDER,
} from "@parambhariya/ui";
import {
  Sprout, Package, TriangleAlert, Gauge, Thermometer, Droplets, Wind, ChevronRight,
  TrendingUp, Activity, CheckCircle2,
} from "lucide-react";
import type { LifecycleStage } from "@parambhariya/types";
import {
  useSummary, useZones, useRooms, useFarms, useBags, useAlerts, useAckAlert, useLiveReadings, driverMode,
} from "../lib/queries";

/* KPI tile — executive metric with delta line */
function Kpi({ icon, label, value, unit, sub, tone = "default" }: {
  icon: React.ReactNode; label: string; value: string | number; unit?: string; sub?: string;
  tone?: "default" | "success" | "warn" | "danger";
}) {
  const accent = { default: "text-brand-700 bg-brand-50", success: "text-success-fg bg-success-bg", warn: "text-warn-fg bg-warn-bg", danger: "text-danger-fg bg-danger-bg" }[tone];
  return (
    <Card padding="lg" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.06em] text-text-muted">{label}</span>
        <span className={`h-8 w-8 rounded-md grid place-items-center [&_svg]:h-4 [&_svg]:w-4 ${accent}`} aria-hidden>{icon}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-mono text-3xl font-semibold leading-none text-text-primary">{value}</span>
        {unit && <span className="font-mono text-sm text-text-muted">{unit}</span>}
      </div>
      {sub && <div className="text-xs text-text-muted">{sub}</div>}
    </Card>
  );
}

function Dashboard() {
  useLiveReadings();
  const navigate = useNavigate();
  const summary = useSummary();
  const zones = useZones();
  const rooms = useRooms();
  const farms = useFarms();
  const bags = useBags();
  const alerts = useAlerts(true);
  const ack = useAckAlert();

  if (summary.isLoading || zones.isLoading || rooms.isLoading || farms.isLoading || bags.isLoading)
    return <><PageHeader title="Operations" /><ListSkeleton rows={4} /></>;
  if (summary.error || zones.error || rooms.error || farms.error || bags.error)
    return <ErrorState title="Failed to load dashboard" onRetry={() => { summary.refetch(); zones.refetch(); rooms.refetch(); farms.refetch(); bags.refetch(); }} />;

  const s = summary.data!;
  const zoneList = zones.data ?? [];
  const roomName = (rid: string) => (rooms.data ?? []).find((r) => r.id === rid)?.name ?? "";
  const farmOf = (rid: string) => {
    const r = (rooms.data ?? []).find((r) => r.id === rid);
    return (farms.data ?? []).find((f) => f.id === r?.farmId)?.name ?? "";
  };
  const pipeline = LIFECYCLE_ORDER.map((stage) => ({ stage: stage as LifecycleStage, count: (bags.data ?? []).filter((b) => b.status === stage).length }));
  const openAlerts = (alerts.data ?? []);
  const zoneName = (zid: string) => { const z = zoneList.find((z) => z.id === zid); return `${roomName(z?.roomId ?? "")} · ${z?.name ?? zid}`; };

  // zones needing attention first
  const ranked = [...zoneList].sort((a, b) => ({ ALARM: 0, WARN: 1, OK: 2 }[a.status] - { ALARM: 0, WARN: 1, OK: 2 }[b.status]));

  return (
    <div>
      <PageHeader
        title="Operations"
        eyebrow="Parambhariya · Live"
        description={`${s.farms} farms · ${s.rooms} rooms · ${s.zones} zones · ${s.bagsActive} active bags`}
        actions={<Tag tone={driverMode === "api" ? "success" : "info"} size="sm">{driverMode === "api" ? "● Live (API)" : "● Live (demo)"}</Tag>}
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Kpi icon={<Package />} label="Active bags" value={s.bagsActive} sub={`${s.bagsTotal} total · ${s.bagsHarvested} harvested`} />
        <Kpi icon={<TrendingUp />} label="Yield (cycle)" value={s.yieldKg.toFixed(1)} unit="kg" tone="success" sub={`${s.successRate}% non-contaminated`} />
        <Kpi icon={<Gauge />} label="Zones in spec" value={`${s.zones - s.zonesAlarm - s.zonesWarn}/${s.zones}`} tone={s.zonesAlarm ? "danger" : s.zonesWarn ? "warn" : "success"} sub={`${s.zonesAlarm} alarm · ${s.zonesWarn} warning`} />
        <Kpi icon={<TriangleAlert />} label="Open alerts" value={s.openAlerts} tone={s.criticalAlerts ? "danger" : s.openAlerts ? "warn" : "default"} sub={`${s.criticalAlerts} critical`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mb-8">
        {/* live fleet */}
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Live Environment — Fleet</CardTitle>
            <Link to="/farms" className="text-sm text-brand-700 hover:underline">All farms</Link>
          </div>
          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.06em] text-text-muted border-b border-border-default">
                  <th className="py-2 pr-3 font-semibold">Zone</th>
                  <th className="py-2 px-2 font-semibold text-right">Temp</th>
                  <th className="py-2 px-2 font-semibold text-right">RH</th>
                  <th className="py-2 px-2 font-semibold text-right">CO₂</th>
                  <th className="py-2 pl-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {ranked.map((z) => (
                  <tr key={z.id} className="hover:bg-surface-muted cursor-pointer" onClick={() => navigate({ to: "/zone/$zoneId", params: { zoneId: z.id } })}>
                    <td className="py-2.5 pr-3">
                      <div className="font-medium text-text-primary">{z.name}</div>
                      <div className="text-xs text-text-muted">{farmOf(z.roomId)} · {roomName(z.roomId)}</div>
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums">{z.tempC?.toFixed(1) ?? "—"}<span className="text-text-muted text-xs"> °C</span></td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums">{z.rhPct?.toFixed(1) ?? "—"}<span className="text-text-muted text-xs"> %</span></td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums">{z.co2Ppm != null ? Math.round(z.co2Ppm) : "—"}</td>
                    <td className="py-2.5 pl-2"><Badge tone={z.status === "ALARM" ? "danger" : z.status === "WARN" ? "warn" : "success"}>{z.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* attention / alerts */}
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Needs attention</CardTitle>
            <Link to="/alerts" className="text-sm text-brand-700 hover:underline">All alerts</Link>
          </div>
          {openAlerts.length === 0 ? (
            <div className="flex flex-col items-center text-center py-8 gap-2">
              <CheckCircle2 className="h-8 w-8 text-success-fg" />
              <div className="text-sm font-medium text-text-primary">All zones in spec</div>
              <div className="text-xs text-text-muted">The controller is holding every setpoint.</div>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {openAlerts.slice(0, 4).map((a) => (
                <li key={a.id} className="flex items-start gap-2 rounded-md border border-border-default p-3">
                  <TriangleAlert className={`h-4 w-4 mt-0.5 shrink-0 ${a.severity === "critical" ? "text-danger-fg" : "text-warn-fg"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-primary">{a.metric.toUpperCase()} out of range</div>
                    <div className="text-xs text-text-muted">{zoneName(a.zoneId)} · <span className="font-mono">{a.value}</span></div>
                  </div>
                  <Button variant="ghost" size="xs" onClick={() => ack.mutate(a.id)}>Ack</Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* production funnel */}
      <Card padding="lg" className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Production Pipeline</CardTitle>
          <Link to="/flows" className="text-sm text-brand-700 hover:underline">Open board</Link>
        </div>
        <Pipeline data={pipeline} />
      </Card>

      {/* farms quick grid */}
      <section>
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-lg font-semibold text-text-primary">Farms</h2>
          <Link to="/farms" className="text-sm text-brand-700 hover:underline">Manage</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(farms.data ?? []).map((f) => {
            const fRooms = (rooms.data ?? []).filter((r) => r.farmId === f.id);
            const fZones = zoneList.filter((z) => fRooms.some((r) => r.id === z.roomId));
            const inSpec = fZones.filter((z) => z.status === "OK").length;
            return (
              <Link key={f.id} to="/farms/$farmId" params={{ farmId: f.id }}>
                <Card interactive className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-md bg-brand-50 grid place-items-center text-brand-700 shrink-0"><Sprout /></div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="truncate">{f.name}</CardTitle>
                    <div className="text-xs text-text-muted mt-0.5">{f.location}</div>
                    <div className="mt-2"><Progress value={fZones.length ? (inSpec / fZones.length) * 100 : 100} /></div>
                    <div className="text-xs text-text-muted mt-1 font-mono">{inSpec}/{fZones.length} zones in spec</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-text-muted self-center" />
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export const Route = createFileRoute("/dashboard")({ component: Dashboard });
