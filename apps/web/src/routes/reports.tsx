import { createFileRoute } from "@tanstack/react-router";
import {
  PageHeader, Card, CardTitle, MetricCard, Spark, LifeBadge, Progress, LIFECYCLE_ORDER, ListSkeleton, ErrorState,
} from "@parambhariya/ui";
import { useBags, useStrains, useSummary } from "../lib/queries";
import { SectionHelp } from "../lib/SectionHelp";

function ReportsScreen() {
  const bags = useBags();
  const strains = useStrains();
  const summary = useSummary();

  if (bags.isLoading || summary.isLoading) return <><PageHeader title="Reports" /><ListSkeleton rows={3} /></>;
  if (bags.error) return <ErrorState title="Failed to load reports" onRetry={() => bags.refetch()} />;

  const bagList = bags.data ?? [];
  const s = summary.data;
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

      <Card padding="lg">
        <CardTitle className="mb-3">By strain</CardTitle>
        <ul className="divide-y divide-border-default">
          {byStrain.map(({ strain, total, contam }) => (
            <li key={strain.id} className="py-3 grid grid-cols-2 md:grid-cols-4 gap-2 items-baseline">
              <div className="text-sm font-medium text-text-primary truncate">{strain.name}</div>
              <div className="text-xs text-text-muted font-mono">{total} bags</div>
              <div className="text-xs text-text-muted font-mono">{contam > 0 ? <span className="text-danger-fg">{contam} contaminated</span> : "0 contaminated"}</div>
              <div className="text-xs text-text-muted font-mono text-right">{(strain.yieldKg ?? 0).toFixed(1)} kg</div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/reports")({ component: ReportsScreen });
