import { createFileRoute } from "@tanstack/react-router";
import {
  PageHeader, Card, CardTitle, MetricCard, Spark, LifeBadge, Progress,
  LIFECYCLE_ORDER,
} from "@parambhariya/ui";
import { bags, strains } from "../data/mock";

function ReportsScreen() {
  const total = bags.length;
  const harvested = bags.filter((b) => b.status === "HARVESTED").length;
  const contam = bags.filter((b) => b.status === "CONTAMINATED").length;
  const yieldKg = bags.reduce((sum, b) => sum + (b.weightG ?? 0), 0) / 1000;
  const successRate = total > 0 ? Math.round(((total - contam) / total) * 100) : 0;

  const byStrain = strains.map((s) => ({
    strain: s,
    total: bags.filter((b) => b.strainId === s.id).length,
    contam: bags.filter((b) => b.strainId === s.id && b.status === "CONTAMINATED").length,
    yieldKg: s.yieldKg ?? 0,
  }));

  const byStage = LIFECYCLE_ORDER.map((stage) => ({
    stage,
    count: bags.filter((b) => b.status === stage).length,
  }));
  const stageMax = Math.max(1, ...byStage.map((b) => b.count));

  // Fake 14-day trend (deterministic)
  const trend = Array.from({ length: 14 }, (_, i) =>
    3 + Math.sin(i / 2) * 1.2 + ((i * 17) % 7) / 6
  );

  return (
    <div>
      <PageHeader title="Reports" description="Production at a glance." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Bags this cycle" value={total} />
        <MetricCard label="Harvested"       value={harvested} tone="success" />
        <MetricCard label="Yield"           value={yieldKg.toFixed(2)} unit="kg" tone="success" />
        <MetricCard label="Success rate"    value={`${successRate}`} unit="%" tone={successRate >= 90 ? "success" : "warn"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card padding="lg">
          <div className="flex items-end justify-between mb-3">
            <CardTitle>Harvest, last 14 days</CardTitle>
            <span className="text-xs text-text-muted font-mono">kg/day</span>
          </div>
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
          {byStrain.map(({ strain, total, contam, yieldKg }) => (
            <li key={strain.id} className="py-3 grid grid-cols-2 md:grid-cols-4 gap-2 items-baseline">
              <div className="text-sm font-medium text-text-primary truncate">{strain.name}</div>
              <div className="text-xs text-text-muted font-mono">{total} bags</div>
              <div className="text-xs text-text-muted font-mono">
                {contam > 0 ? <span className="text-danger-fg">{contam} contaminated</span> : "0 contaminated"}
              </div>
              <div className="text-xs text-text-muted font-mono text-right">{yieldKg.toFixed(1)} kg</div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/reports")({ component: ReportsScreen });
