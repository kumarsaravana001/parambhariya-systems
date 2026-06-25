import * as React from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  PageHeader, Breadcrumb, BigReading, AlertBanner, BagCard, EmptyState, Card, CardTitle,
  Button, Slider, DetailSkeleton, ErrorState, EnvChart, Tag,
} from "@parambhariya/ui";
import { Thermometer, Droplets, Wind, Sun, Package, Gauge, RotateCcw, Sprout, AlertTriangle, Check } from "lucide-react";
import type { Zone, Room, Strain, Bag, CultivationStage } from "@parambhariya/types";
import {
  stageTargetForStrain, setpointsForTarget, climateFit, purposeToStage, dominantCropStage,
  CULTIVATION_STAGE_ORDER, STAGE_CLIMATE,
} from "@parambhariya/types";
import {
  useZone, useRooms, useFarm, useBags, useStrains, useAlerts, useAckAlert,
  useZoneReadings, useSetSetpoint, useLiveReadings, driverMode,
} from "../lib/queries";
import { fmtAgo, bandTone } from "../lib/format";
import { SectionHelp } from "../lib/SectionHelp";

function SetpointRow({ label, unit, value, min, max, step, onCommit }: {
  label: string; unit: string; value: number; min: number; max: number; step: number; onCommit: (v: number) => void;
}) {
  const [local, setLocal] = React.useState([value]);
  React.useEffect(() => { setLocal([value]); }, [value]);
  return (
    <div className="flex items-center gap-4">
      <div className="w-28 shrink-0 text-sm text-text-secondary">{label}</div>
      <Slider className="flex-1" value={local} min={min} max={max} step={step} aria-label={`${label} setpoint (${unit})`}
        onValueChange={setLocal} onValueCommit={(v) => onCommit(v[0]!)} showBubble formatValue={(v) => `${v} ${unit}`} />
      <div className="w-20 text-right font-mono text-sm text-text-primary">{local[0]} {unit}</div>
    </div>
  );
}

const STAGE_TONE: Record<CultivationStage, "info" | "warn" | "success"> = {
  colonization: "info", pinning: "warn", fruiting: "success",
};
const VERDICT_TEXT = { ok: "text-success-fg", warn: "text-warn-fg", off: "text-danger-fg" } as const;
const METRIC_LABEL = { temp: "Temp", rh: "Humidity", co2: "CO₂" } as const;
const METRIC_UNIT = { temp: "°C", rh: "%", co2: "ppm" } as const;

/** Stage-appropriate climate: what the crop in this zone needs vs what's set, with one-click apply. */
function ClimateProfileCard({ zone, room, strain, bags, onApply, busy }: {
  zone: Zone; room?: Room; strain?: Strain; bags: Bag[];
  onApply: (body: { setpointTempC: number; setpointRhPct: number; setpointCo2Ppm: number }) => void; busy: boolean;
}) {
  const cropStage = dominantCropStage(bags.map((b) => b.status));
  const intendedStage = room ? purposeToStage(room.purpose) : null;
  const activeStage: CultivationStage = cropStage ?? intendedStage ?? "colonization";
  const target = stageTargetForStrain(strain, activeStage);
  const fit = climateFit(
    { setpointTempC: zone.setpointTempC, setpointRhPct: zone.setpointRhPct, setpointCo2Ppm: zone.setpointCo2Ppm },
    target,
  );
  const off = fit.metrics.filter((m) => m.verdict !== "ok");
  const source = cropStage ? "from the bags growing here" : intendedStage ? `from this ${room?.purpose.toLowerCase()} room` : "default";

  return (
    <Card padding="lg" className="mb-6">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2"><Sprout className="h-5 w-5 text-brand-700" /><CardTitle>Climate profile</CardTitle></div>
        <Tag tone={STAGE_TONE[activeStage]} size="sm">{target.label} stage · {source}</Tag>
      </div>
      <p className="text-sm text-text-muted mb-4">{target.why}</p>

      {off.length > 0 ? (
        <AlertBanner tone={fit.worst === "off" ? "critical" : "warning"} title={`Setpoints don't match the ${target.label.toLowerCase()} stage`} className="mb-4">
          {off.map((m) => <span key={m.metric}>{METRIC_LABEL[m.metric]} {m.message}. </span>)}
          {" "}Apply the {target.label.toLowerCase()} profile below to fix it.
        </AlertBanner>
      ) : (
        <div className="flex items-center gap-2 text-sm text-success-fg mb-4"><Check className="h-4 w-4" /> Setpoints match the {target.label.toLowerCase()} stage.</div>
      )}

      {/* current vs target per metric */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {fit.metrics.map((m) => (
          <div key={m.metric} className="rounded-lg border border-border-default p-3">
            <div className="text-xs text-text-muted mb-1">{METRIC_LABEL[m.metric]}</div>
            <div className="font-mono text-sm">
              <span className={VERDICT_TEXT[m.verdict]}>{m.current}</span>
              <span className="text-text-muted"> → {m.target} {METRIC_UNIT[m.metric]}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-text-muted mb-2 uppercase tracking-[0.06em] font-semibold">Apply a stage profile{strain ? ` · tuned for ${strain.name}` : ""}</div>
      <div className="flex flex-wrap gap-2">
        {CULTIVATION_STAGE_ORDER.map((stage) => {
          const st = stageTargetForStrain(strain, stage);
          const sp = setpointsForTarget(st);
          const isActive = stage === activeStage;
          return (
            <Button key={stage} variant={isActive ? "primary" : "secondary"} size="sm" disabled={busy}
              onClick={() => onApply(sp)} title={`${st.tempC} °C · ${st.rhPct} % · ${sp.setpointCo2Ppm} ppm`}>
              {isActive && <AlertTriangle className="h-3.5 w-3.5" />}
              {st.label} <span className="font-mono text-xs opacity-70">{st.tempC}° · {sp.setpointCo2Ppm}ppm</span>
            </Button>
          );
        })}
      </div>
      <p className="text-xs text-text-muted mt-3">{STAGE_CLIMATE[activeStage].summary} Targets anchor to {strain ? `${strain.name}'s optimum` : "Oyster reference"}; CO₂ and light follow the stage.</p>
    </Card>
  );
}

function ZoneDetail() {
  const { zoneId } = Route.useParams();
  useLiveReadings();
  const zone = useZone(zoneId);
  const rooms = useRooms();
  const room = (rooms.data ?? []).find((r) => r.id === zone.data?.roomId);
  const farm = useFarm(room?.farmId);
  const bags = useBags();
  const strains = useStrains();
  const alerts = useAlerts(true);
  const ack = useAckAlert();
  const readings = useZoneReadings(zoneId, 60);
  const setSetpoint = useSetSetpoint();

  if (zone.isLoading || rooms.isLoading) return <DetailSkeleton />;
  if (zone.error) return <ErrorState title="Failed to load zone" onRetry={() => zone.refetch()} />;
  if (!zone.data) throw notFound();

  const z = zone.data;
  const zoneBags = (bags.data ?? []).filter((b) => b.zoneId === z.id);
  const zoneAlerts = (alerts.data ?? []).filter((a) => a.zoneId === z.id);
  const ageSec = z.updatedAt ? Math.max(0, Math.round((Date.now() - new Date(z.updatedAt).getTime()) / 1000)) : undefined;
  const fresh = ageSec === undefined ? "—" : fmtAgo(ageSec);

  const tempTone = bandTone(z.tempC ?? undefined, [z.setpointTempC - 2, z.setpointTempC + 2]);
  const rhTone = bandTone(z.rhPct ?? undefined, [z.setpointRhPct - 5, z.setpointRhPct + 5]);
  const co2Tone = bandTone(z.co2Ppm ?? undefined, [0, z.setpointCo2Ppm + 400]);

  const rd = readings.data ?? [];
  const commit = (body: any) => setSetpoint.mutate({ zoneId: z.id, body });

  // dominant strain in this zone → anchor the climate targets to it
  const strainCount = new Map<string, number>();
  for (const b of zoneBags) strainCount.set(b.strainId, (strainCount.get(b.strainId) ?? 0) + 1);
  const topStrainId = [...strainCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const zoneStrain = (strains.data ?? []).find((s) => s.id === topStrainId) ?? (strains.data ?? [])[0];

  return (
    <div>
      <Breadcrumb className="mb-2" items={[
        { label: "Farms", href: "/farms" },
        { label: farm.data?.name ?? "Farm", href: room?.farmId ? `/farms/${room.farmId}` : undefined },
        { label: room?.name ?? "Room", href: room?.id ? `/room/${room.id}` : undefined },
        { label: z.name },
      ]} />
      <PageHeader title={z.name}
        description={[
          z.bagCapacity ? `${zoneBags.length} / ${z.bagCapacity} bags` : `${zoneBags.length} bags`,
          room?.name,
          z.deviceId,
        ].filter(Boolean).join(" · ")}
        actions={<Tag tone={driverMode === "api" ? "success" : "info"} size="sm">{driverMode === "api" ? "● Live (API)" : "● Live (demo)"}</Tag>} />

      <SectionHelp id="zone" items={[
        { label: "Live readings", body: "The four tiles stream live temperature, humidity, CO₂ and light, with a sparkline trend and 'last reading' age." },
        { label: "Environment control", body: "Drag a setpoint slider — it's sent to the backend controller, which drives the reading toward your target and raises an alert if it can't hold it." },
        { label: "Why temperature matters", body: "Colonization speed depends on temperature. Holding the right setpoint here is what makes the Spawn ready-dates accurate." },
        { label: "Climate profile", body: "Each growing stage needs a different climate. The card reads the stage your bags are actually in and warns if the setpoints still match a different stage — the classic 'colonized but won't fruit' trap. One click applies the right profile, tuned to the zone's strain." },
      ]} />

      {zoneAlerts.length > 0 && (
        <div className="flex flex-col gap-3 mb-6">
          {zoneAlerts.map((a) => (
            <AlertBanner key={a.id} tone={a.severity === "critical" ? "critical" : "warning"}
              title={`${a.metric.toUpperCase()} out of range`}>
              Current <span className="font-mono">{a.value}</span> · Threshold <span className="font-mono">{a.threshold}</span>.
              {" "}<Button variant="link" className="text-inherit underline" onClick={() => ack.mutate(a.id)}>Acknowledge</Button>
            </AlertBanner>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <BigReading label="Temperature" icon={<Thermometer />} value={z.tempC?.toFixed(1) ?? "—"} unit="°C" range={`${z.setpointTempC} °C ± 2`} freshness={fresh} tone={tempTone} trend={rd.map((r) => r.tempC)} />
        <BigReading label="Humidity" icon={<Droplets />} value={z.rhPct?.toFixed(1) ?? "—"} unit="%" range={`${z.setpointRhPct} % ± 5`} freshness={fresh} tone={rhTone} trend={rd.map((r) => r.rhPct)} />
        <BigReading label="CO₂" icon={<Wind />} value={z.co2Ppm != null ? String(Math.round(z.co2Ppm)) : "—"} unit="ppm" range={`≤ ${z.setpointCo2Ppm + 400} ppm`} freshness={fresh} tone={co2Tone} trend={rd.map((r) => r.co2Ppm)} />
        <BigReading label="Light" icon={<Sun />} value={z.lightLux != null ? String(Math.round(z.lightLux)) : "—"} unit="lx" freshness={fresh} trend={rd.map((r) => r.lightLux)} />
      </div>

      {/* setpoint control — writes to the backend control loop */}
      <Card padding="lg" className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-brand-700" />
            <CardTitle>Environment Control</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={() => commit({ setpointTempC: 24, setpointRhPct: 88, setpointCo2Ppm: 1000 })}>
            <RotateCcw className="h-4 w-4" /> Reset defaults
          </Button>
        </div>
        <p className="text-sm text-text-muted mb-4">
          Setpoints are sent to the backend controller, which drives each reading toward target and raises an alert on deviation.
        </p>
        <div className="flex flex-col gap-5 max-w-2xl">
          <SetpointRow label="Temperature" unit="°C" value={z.setpointTempC} min={10} max={35} step={0.5} onCommit={(v) => commit({ setpointTempC: v })} />
          <SetpointRow label="Humidity" unit="%" value={z.setpointRhPct} min={60} max={99} step={1} onCommit={(v) => commit({ setpointRhPct: v })} />
          <SetpointRow label="CO₂" unit="ppm" value={z.setpointCo2Ppm} min={400} max={2000} step={50} onCommit={(v) => commit({ setpointCo2Ppm: v })} />
        </div>
      </Card>

      <ClimateProfileCard zone={z} room={room} strain={zoneStrain} bags={zoneBags}
        onApply={(body) => commit(body)} busy={setSetpoint.isPending} />

      {rd.length > 1 && (
        <Card padding="lg" className="mb-6">
          <CardTitle className="mb-3">Environment trend</CardTitle>
          <EnvChart
            series={[
              { key: "t", label: "Temp", unit: "°C", optimal: [z.setpointTempC - 2, z.setpointTempC + 2], data: rd.map((r) => r.tempC) },
              { key: "h", label: "RH", unit: "%", colorClass: "text-info-fg", data: rd.map((r) => r.rhPct) },
              { key: "c", label: "CO₂", unit: "ppm", colorClass: "text-warn-fg", data: rd.map((r) => r.co2Ppm) },
            ]}
          />
        </Card>
      )}

      <section>
        <h2 className="text-lg font-semibold text-text-primary mb-3">Bags in this zone</h2>
        {zoneBags.length === 0 ? (
          <EmptyState icon={<Package />} title="No bags in this zone" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {zoneBags.map((b) => {
              const strain = (strains.data ?? []).find((s) => s.id === b.strainId);
              return (
                <Link key={b.id} to="/bag/$bagId" params={{ bagId: b.id }}>
                  <BagCard code={b.code} strain={strain?.name} zoneName={z.name} stage={b.status} progress={b.stageProgress} weightG={b.weightG ?? undefined} />
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export const Route = createFileRoute("/zone/$zoneId")({ component: ZoneDetail });
