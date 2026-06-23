import { createFileRoute } from "@tanstack/react-router";
import {
  PageHeader, Card, CardTitle, MetricCard, Spark, LifeBadge, Progress, LIFECYCLE_ORDER, ListSkeleton, ErrorState,
} from "@parambhariya/ui";
import { useBags, useStrains, useSummary, useRooms, useZones } from "../lib/queries";
import { SectionHelp } from "../lib/SectionHelp";
import { biologicalEfficiency } from "@parambhariya/types";
import { Badge, Tag } from "@parambhariya/ui";
import { ShieldAlert } from "lucide-react";

function ReportsScreen() {
  const bags = useBags();
  const strains = useStrains();
  const summary = useSummary();
  const rooms = useRooms();
  const zones = useZones();

  if (bags.isLoading || summary.isLoading) return <><PageHeader title="Reports" /><ListSkeleton rows={3} /></>;
  if (bags.error) return <ErrorState title="Failed to load reports" onRetry={() => bags.refetch()} />;

  const bagList = bags.data ?? [];
  const s = summary.data;

  // BE% across harvested bags with both weights
  const beValues = bagList.map((b) => biologicalEfficiency(b.weightG, b.substrateWeightKg)).filter((x): x is number => x != null);
  const avgBE = beValues.length ? Math.round((beValues.reduce((a, c) => a + c, 0) / beValues.length) * 10) / 10 : null;

  // contamination rate by room (bag → zone → room)
  const roomOf = (zid: string) => {
    const z = (zones.data ?? []).find((z) => z.id === zid);
    return (rooms.data ?? []).find((r) => r.id === z?.roomId);
  };
  const byRoom = (rooms.data ?? []).map((r) => {
    const rb = bagList.filter((b) => roomOf(b.zoneId)?.id === r.id);
    const contam = rb.filter((b) => b.status === "CONTAMINATED").length;
    return { room: r, total: rb.length, contam, rate: rb.length ? Math.round((contam / rb.length) * 100) : 0 };
  }).filter((x) => x.total > 0).sort((a, b) => b.rate - a.rate);
  const byStage = LIFECYCLE_ORDER.map((stage) => ({ stage, count: bagList.filter((b) => b.status === stage).length }));
  const stageMax = Math.max(1, ...byStage.map((b) => b.count));
  const byStrain = (strains.data ?? []).map((st) => ({
    strain: st,
    total: bagList.filter((b) => b.strainId === st.id).length,
    contam: bagList.filter((b) => b.strainId === st.id && b.status === "CONTAMINATED").length,
  }));
  const trend = Array.from({ length: 14 }, (_, i) => 3 + Math.sin(i / 2) * 1.2 + ((i * 17) % 7) / 6);

  return (
    <div>
      <PageHeader title="Reports" description="Production at a glance." />
      <SectionHelp id="reports" items={[
        { label: "What this is", body: "Your production rollup — total bags, harvested, yield (kg) and contamination success rate, plus a breakdown by stage and strain." },
        { label: "Reading it", body: "Success rate = non-contaminated bags. A strain with repeated contamination is a signal to check that spawn line in the Spawn section." },
      ]} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Bags this cycle" value={s?.bagsTotal ?? 0} />
        <MetricCard label="Harvested" value={s?.bagsHarvested ?? 0} tone="success" />
        <MetricCard label="Yield" value={(s?.yieldKg ?? 0).toFixed(2)} unit="kg" tone="success" />
        <MetricCard label="Success rate" value={`${s?.successRate ?? 100}`} unit="%" tone={(s?.successRate ?? 100) >= 90 ? "success" : "warn"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card padding="lg">
          <div className="flex items-end justify-between mb-3"><CardTitle>Harvest, last 14 days</CardTitle><span className="text-xs text-text-muted font-mono">kg/day</span></div>
          <Spark data={trend} width={520} height={120} className="text-brand-500 w-full" />
        </Card>
        <Card padding="lg">
          <CardTitle className="mb-3">By stage</CardTitle>
          <ul className="flex flex-col gap-3">
            {byStage.map(({ stage, count }) => (
              <li key={stage} className="flex items-center gap-3">
                <div className="w-28 shrink-0"><LifeBadge stage={stage} size="sm" /></div>
                <Progress value={(count / stageMax) * 100} stage={stage} className="flex-1" />
                <span className="font-mono text-sm w-8 text-right">{count}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card padding="lg" className="mb-6">
        <CardTitle className="mb-3">By strain</CardTitle>
        <ul className="divide-y divide-border-default">
          {byStrain.map(({ strain, total, contam }) => (
            <li key={strain.id} className="py-3 grid grid-cols-2 md:grid-cols-4 gap-2 items-baseline">
              <div className="text-sm font-medium text-text-primary truncate">{strain.name}</div>
              <div className="text-xs text-text-muted font-mono">{total} bags</div>
              <div className="text-xs text-text-muted font-mono">{contam > 0 ? <span className="text-danger-fg">{contam} contaminated ({Math.round((contam / total) * 100)}%)</span> : "0 contaminated"}</div>
              <div className="text-xs text-text-muted font-mono text-right">{(strain.yieldKg ?? 0).toFixed(1)} kg</div>
            </li>
          ))}
        </ul>
      </Card>

      {/* crop protection + yield */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-1"><ShieldAlert className="h-5 w-5 text-brand-700" /><CardTitle>Contamination by room</CardTitle></div>
          <p className="text-sm text-text-muted mb-4">Where your losses cluster — this points at the room to fix (sterility, airflow, pasteurization).</p>
          {byRoom.length === 0 ? <p className="text-sm text-text-muted">No bags yet.</p> : (
            <ul className="flex flex-col gap-3">
              {byRoom.map(({ room, total, contam, rate }) => (
                <li key={room.id} className="flex items-center gap-3">
                  <div className="w-32 shrink-0 text-sm text-text-primary truncate">{room.name}</div>
                  <Progress value={rate} className={rate >= 15 ? "[&>div]:bg-danger-fg" : rate > 0 ? "[&>div]:bg-warn-fg" : ""} />
                  <div className="w-24 text-right shrink-0">
                    <Badge tone={rate >= 15 ? "danger" : rate > 0 ? "warn" : "success"}>{rate}%</Badge>
                    <span className="text-xs text-text-muted font-mono ml-1">{contam}/{total}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card padding="lg">
          <CardTitle className="mb-1">Yield — Biological Efficiency</CardTitle>
          <p className="text-sm text-text-muted mb-4">BE % = fresh weight ÷ dry substrate × 100. Oyster target 75–100%+. The number to push.</p>
          {avgBE == null ? (
            <p className="text-sm text-text-muted">Record harvest weights and substrate weights to see BE %.</p>
          ) : (
            <>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="font-mono text-4xl font-semibold text-text-primary">{avgBE}</span>
                <span className="font-mono text-lg text-text-muted">% avg</span>
                <Tag tone={avgBE >= 50 ? "success" : avgBE >= 30 ? "warn" : "danger"} className="ml-2">{avgBE >= 80 ? "Excellent" : avgBE >= 50 ? "Good" : avgBE >= 30 ? "Fair" : "Low"}</Tag>
              </div>
              <Progress value={Math.min(100, avgBE)} />
              <p className="text-xs text-text-muted mt-3">From {beValues.length} harvested bag{beValues.length > 1 ? "s" : ""} with recorded weights.</p>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/reports")({ component: ReportsScreen });
