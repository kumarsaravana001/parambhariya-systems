import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  PageHeader, Card, CardTitle, Button, Badge, Tag, Pipeline, EmptyState,
  Progress, ListSkeleton, ErrorState, LIFECYCLE_ORDER,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Input, FormField,
} from "@parambhariya/ui";
import {
  Sprout, Package, TriangleAlert, Gauge, Thermometer, ChevronRight,
  TrendingUp, CheckCircle2, CalendarClock, TestTubes,
} from "lucide-react";
import {
  type LifecycleStage, SPAWN_STAGE_ORDER, SPAWN_STAGE_LABEL, SPAWN_STAGE_BASE_DAYS,
  estimateColonization, colonizationForecast,
} from "@parambhariya/types";
import {
  useSummary, useZones, useRooms, useFarms, useBags, useStrains, useSpawn, useAlerts, useAckAlert, useLiveReadings, driverMode,
} from "../lib/queries";
import { SectionHelp } from "../lib/SectionHelp";
import { batchForecast, bandTone, todayYMD } from "../lib/spawn";

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

/* Climate-aware inoculation planner: "if I inoculate today, when is it ready?" */
function InoculationPlanner({ strains, zones }: { strains: any[]; zones: any[] }) {
  const [strainId, setStrainId] = React.useState(strains[0]?.id ?? "");
  const [stage, setStage] = React.useState<string>("GRAIN_G1");
  const [zoneId, setZoneId] = React.useState<string>(zones[0]?.id ?? "");
  const [date, setDate] = React.useState(todayYMD());

  const strain = strains.find((s) => s.id === strainId);
  const zone = zones.find((z) => z.id === zoneId);
  const baseDays = SPAWN_STAGE_BASE_DAYS[stage as keyof typeof SPAWN_STAGE_BASE_DAYS];

  let result = null as null | { readyOn: string; days: number; tempC: number; basis: string; band: string; factor: number; note: string };
  if (strain) {
    const tempC = zone?.tempC != null ? zone.tempC : zone ? zone.setpointTempC : (strain.optimalTempMin + strain.optimalTempMax) / 2;
    const basis = zone?.tempC != null ? "live reading" : zone ? "zone setpoint" : "strain optimum";
    const est = estimateColonization(baseDays, strain.optimalTempMin, strain.optimalTempMax, tempC);
    const fc = colonizationForecast(date, est.estimatedDays, date);
    result = { readyOn: fc.readyOn, days: est.estimatedDays, tempC, basis, band: est.band, factor: est.factor, note: est.note };
  }

  return (
    <Card padding="lg">
      <div className="flex items-center gap-2 mb-1"><CalendarClock className="h-5 w-5 text-brand-700" /><CardTitle>Inoculation Planner</CardTitle></div>
      <p className="text-sm text-text-muted mb-4">Pick what you'll inoculate and where — get a ready date adjusted for that zone's live climate.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <FormField label="Strain" htmlFor="ip-strain">
          <Select value={strainId} onValueChange={setStrainId}><SelectTrigger id="ip-strain"><SelectValue /></SelectTrigger>
            <SelectContent>{strains.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select>
        </FormField>
        <FormField label="Spawn stage" htmlFor="ip-stage">
          <Select value={stage} onValueChange={setStage}><SelectTrigger id="ip-stage"><SelectValue /></SelectTrigger>
            <SelectContent>{SPAWN_STAGE_ORDER.map((s) => <SelectItem key={s} value={s}>{SPAWN_STAGE_LABEL[s]}</SelectItem>)}</SelectContent></Select>
        </FormField>
        <FormField label="Incubation zone" htmlFor="ip-zone">
          <Select value={zoneId} onValueChange={setZoneId}><SelectTrigger id="ip-zone"><SelectValue placeholder="Strain optimum" /></SelectTrigger>
            <SelectContent><SelectItem value="">— strain optimum —</SelectItem>{zones.map((z) => <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>)}</SelectContent></Select>
        </FormField>
        <FormField label="Inoculate on" htmlFor="ip-date"><Input id="ip-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></FormField>
      </div>
      {result && (
        <div className="rounded-lg bg-brand-50 p-4">
          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <div>
              <div className="text-xs uppercase tracking-[0.06em] text-text-muted">Estimated ready</div>
              <div className="font-mono text-2xl font-semibold text-brand-900">{result.readyOn}</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-lg font-semibold text-text-primary">~{result.days} days</div>
              <div className="text-xs text-text-muted">{result.tempC.toFixed(1)} °C · {result.basis}</div>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {result.band !== "optimal" && <Tag tone={bandTone(result.band)} size="sm">{result.factor}× {result.band.replace("-", " ")}</Tag>}
            <span className="text-xs text-text-muted">{result.note}</span>
          </div>
        </div>
      )}
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
  const strains = useStrains();
  const spawn = useSpawn();
  const alerts = useAlerts(true);
  const ack = useAckAlert();

  if (summary.isLoading || zones.isLoading || rooms.isLoading || farms.isLoading || bags.isLoading || strains.isLoading || spawn.isLoading)
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

      <SectionHelp id="dashboard" items={[
        { label: "Operations at a glance", body: "Live KPIs, every zone's current climate, open alerts, and your production pipeline — all updating in real time." },
        { label: "Inoculation Planner", body: "Below: pick a strain, spawn stage and zone to see when it'll finish colonizing, adjusted for that zone's live temperature. Use it to quote ready dates to buyers." },
        { label: "Spawn readiness", body: "Tracks your active spawn batches and flags the ones finishing soon. Open Spawn for the full ladder and lineage." },
      ]} />

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi icon={<Package />} label="Active bags" value={s.bagsActive} sub={`${s.bagsTotal} total · ${s.bagsHarvested} harvested`} />
        <Kpi icon={<TrendingUp />} label="Yield (cycle)" value={s.yieldKg.toFixed(1)} unit="kg" tone="success" sub={`${s.successRate}% non-contaminated`} />
        <Kpi icon={<Gauge />} label="Zones in spec" value={`${s.zones - s.zonesAlarm - s.zonesWarn}/${s.zones}`} tone={s.zonesAlarm ? "danger" : s.zonesWarn ? "warn" : "success"} sub={`${s.zonesAlarm} alarm · ${s.zonesWarn} warning`} />
        <Kpi icon={<TriangleAlert />} label="Open alerts" value={s.openAlerts} tone={s.criticalAlerts ? "danger" : s.openAlerts ? "warn" : "default"} sub={`${s.criticalAlerts} critical`} />
      </div>

      {/* inoculation planner + spawn readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <InoculationPlanner strains={strains.data ?? []} zones={zones.data ?? []} />
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><TestTubes className="h-5 w-5 text-brand-700" /><CardTitle>Spawn readiness</CardTitle></div>
            <Link to="/spawn" className="text-sm text-brand-700 hover:underline">Open Spawn</Link>
          </div>
          {(() => {
            const active = (spawn.data ?? []).filter((b) => b.status === "INOCULATED" || b.status === "COLONIZING");
            const rows = active
              .map((b) => ({ b, f: batchForecast(b, (strains.data ?? []).find((s) => s.id === b.strainId), (zones.data ?? []).find((z) => z.id === b.zoneId)) }))
              .filter((x) => x.f)
              .sort((a, b) => a.f!.forecast.daysRemaining - b.f!.forecast.daysRemaining);
            if (rows.length === 0) return <EmptyState icon={<TestTubes />} title="No active spawn" description="Start a batch in the Spawn section." />;
            return (
              <ul className="flex flex-col gap-2">
                {rows.slice(0, 5).map(({ b, f }) => (
                  <li key={b.id} className="flex items-center gap-3">
                    <Link to="/spawn/$batchId" params={{ batchId: b.id }} className="font-mono text-xs text-brand-700 hover:underline w-24 shrink-0">{b.code}</Link>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-text-primary truncate">{b.label}</div>
                      <Progress value={f!.forecast.progress * 100} className="mt-1" />
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono text-text-secondary">{f!.forecast.readyOn}</div>
                      <Tag tone={f!.forecast.isReady ? "success" : f!.forecast.daysRemaining <= 5 ? "warn" : "neutral"} size="sm">{f!.forecast.isReady ? "ready" : `${f!.forecast.daysRemaining}d`}</Tag>
                    </div>
                  </li>
                ))}
              </ul>
            );
          })()}
        </Card>
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
