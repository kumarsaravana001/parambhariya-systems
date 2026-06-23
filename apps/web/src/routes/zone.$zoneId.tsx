import * as React from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  PageHeader, Breadcrumb, BigReading, AlertBanner, BagCard, EmptyState, Card, CardTitle,
  Button, Slider, DetailSkeleton, ErrorState, EnvChart, Tag,
} from "@parambhariya/ui";
import { Thermometer, Droplets, Wind, Sun, Package, Gauge, RotateCcw } from "lucide-react";
import type { Zone } from "@parambhariya/types";
import {
  useZone, useRooms, useFarm, useBags, useStrains, useAlerts, useAckAlert,
  useZoneReadings, useSetSetpoint, useLiveReadings, driverMode,
} from "../lib/queries";
import { fmtAgo, bandTone } from "../lib/format";

function SetpointRow({ label, unit, value, min, max, step, onCommit }: {
  label: string; unit: string; value: number; min: number; max: number; step: number; onCommit: (v: number) => void;
}) {
  const [local, setLocal] = React.useState([value]);
  React.useEffect(() => { setLocal([value]); }, [value]);
  return (
    <div className="flex items-center gap-4">
      <div className="w-28 shrink-0 text-sm text-text-secondary">{label}</div>
      <Slider className="flex-1" value={local} min={min} max={max} step={step}
        onValueChange={setLocal} onValueCommit={(v) => onCommit(v[0]!)} showBubble formatValue={(v) => `${v} ${unit}`} />
      <div className="w-20 text-right font-mono text-sm text-text-primary">{local[0]} {unit}</div>
    </div>
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

  return (
    <div>
      <Breadcrumb className="mb-2" items={[
        { label: "Farms", href: "/farms" },
        { label: farm.data?.name ?? "Farm", href: room?.farmId ? `/farms/${room.farmId}` : undefined },
        { label: room?.name ?? "Room", href: room?.id ? `/room/${room.id}` : undefined },
        { label: z.name },
      ]} />
      <PageHeader title={z.name}
        description={`${zoneBags.length} bags · ${room?.name ?? ""}`}
        actions={<Tag tone={driverMode === "api" ? "success" : "info"} size="sm">{driverMode === "api" ? "● Live (API)" : "● Live (demo)"}</Tag>} />

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
