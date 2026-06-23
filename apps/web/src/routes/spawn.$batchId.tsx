import * as React from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import {
  PageHeader, Breadcrumb, Card, CardTitle, DataList, Badge, Tag, Button, Progress,
  DetailSkeleton, ErrorState, AlertBanner,
} from "@parambhariya/ui";
import {
  SPAWN_STAGE_LABEL, type SpawnBatch,
} from "@parambhariya/types";
import { Pencil, Trash2, GitBranch, ChevronRight, Thermometer, CalendarClock, Plus } from "lucide-react";
import { useSpawn, useStrains, useZones, useUpdate, useRemove } from "../lib/queries";
import { batchForecast, bandTone, statusTone } from "../lib/spawn";

function SpawnDetail() {
  const { batchId } = Route.useParams();
  const navigate = useNavigate();
  const spawn = useSpawn();
  const strains = useStrains();
  const zones = useZones();
  const update = useUpdate<SpawnBatch>("spawn");
  const remove = useRemove("spawn");

  if (spawn.isLoading || strains.isLoading) return <DetailSkeleton />;
  if (spawn.error) return <ErrorState title="Failed to load batch" onRetry={() => spawn.refetch()} />;

  const list = spawn.data ?? [];
  const b = list.find((x) => x.id === batchId);
  if (!b) throw notFound();

  const strain = (strains.data ?? []).find((s) => s.id === b.strainId);
  const zone = (zones.data ?? []).find((z) => z.id === b.zoneId);
  const f = batchForecast(b, strain, zone ?? undefined);

  // lineage: walk up parents, find direct children
  const ancestry: SpawnBatch[] = [];
  let cur: SpawnBatch | undefined = b.parentId ? list.find((x) => x.id === b.parentId) : undefined;
  let guard = 0;
  while (cur && guard++ < 20) { ancestry.unshift(cur); cur = cur.parentId ? list.find((x) => x.id === cur!.parentId) : undefined; }
  const children = list.filter((x) => x.parentId === b.id);

  const markReady = () => update.mutate({ id: b.id, body: { status: "READY" } });

  return (
    <div>
      <Breadcrumb className="mb-2" items={[{ label: "Spawn", href: "/spawn" }, { label: b.code }]} />
      <PageHeader
        title={b.label || b.code}
        description={`${b.code} · ${strain?.name ?? ""} · ${SPAWN_STAGE_LABEL[b.stage]}`}
        actions={
          <>
            <Badge tone={statusTone(b.status)}>{b.status}</Badge>
            <Button variant="ghost" size="sm" className="text-danger-fg" onClick={async () => { await remove.mutateAsync(b.id); navigate({ to: "/spawn" }); }}><Trash2 className="h-4 w-4" /> Delete</Button>
          </>
        }
      />

      {b.status === "CONTAMINATED" ? (
        <AlertBanner tone="critical" title="Batch contaminated" className="mb-6">Remove from the spawn chain — do not transfer or sell.</AlertBanner>
      ) : f && (
        <Card padding="lg" className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><CalendarClock className="h-5 w-5 text-brand-700" /><CardTitle>Colonization forecast</CardTitle></div>
            {!f.forecast.isReady ? (
              <Button variant="secondary" size="sm" onClick={markReady}>Mark ready</Button>
            ) : <Tag tone="success">Fully colonized</Tag>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-xs uppercase tracking-[0.06em] text-text-muted mb-1">Ready on</div>
              <div className="font-mono text-2xl font-semibold text-text-primary">{f.forecast.readyOn}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.06em] text-text-muted mb-1">Days remaining</div>
              <div className="font-mono text-2xl font-semibold text-text-primary">{f.forecast.isReady ? "0" : f.forecast.daysRemaining}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.06em] text-text-muted mb-1">Adjusted duration</div>
              <div className="font-mono text-2xl font-semibold text-text-primary">{f.estimate.estimatedDays} d <span className="text-sm text-text-muted">({b.expectedColonizationDays} base)</span></div>
            </div>
          </div>

          <Progress value={f.forecast.progress * 100} className="mb-2" />
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>Inoculated {b.inoculatedOn} · {f.forecast.daysElapsed} days in</span>
            <span className="font-mono">{Math.round(f.forecast.progress * 100)}%</span>
          </div>

          <div className="mt-4 pt-4 border-t border-border-default flex items-start gap-3">
            <Thermometer className="h-5 w-5 text-text-muted mt-0.5 shrink-0" />
            <div className="text-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-text-primary font-medium">{f.tempC.toFixed(1)} °C</span>
                <Tag tone="neutral" size="sm">{f.tempBasis === "live" ? "live reading" : f.tempBasis === "setpoint" ? "zone setpoint" : "strain optimum"}</Tag>
                {f.estimate.band !== "optimal" && <Tag tone={bandTone(f.estimate.band)} size="sm">{f.estimate.factor}× {f.estimate.band.replace("-", " ")}</Tag>}
                {strain && <span className="text-text-muted">optimum {strain.optimalTempMin}–{strain.optimalTempMax} °C</span>}
              </div>
              <p className="text-text-muted mt-1">{f.estimate.note}</p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* lineage */}
        <Card padding="lg">
          <CardTitle className="mb-4 flex items-center gap-2"><GitBranch className="h-4 w-4" /> Lineage</CardTitle>
          <ol className="flex flex-col gap-2">
            {ancestry.map((a) => (
              <li key={a.id}>
                <Link to="/spawn/$batchId" params={{ batchId: a.id }} className="flex items-center gap-2 text-sm text-text-secondary hover:text-brand-700">
                  <span className="font-mono text-xs w-24 shrink-0">{a.code}</span>
                  <span className="truncate">{a.label}</span>
                  <Tag tone="neutral" size="sm">{SPAWN_STAGE_LABEL[a.stage]}</Tag>
                </Link>
                <div className="pl-1 text-text-muted"><ChevronRight className="h-3 w-3 rotate-90" /></div>
              </li>
            ))}
            <li className="flex items-center gap-2 text-sm rounded-md bg-brand-50 px-2 py-1.5">
              <span className="font-mono text-xs w-24 shrink-0 text-brand-700">{b.code}</span>
              <span className="truncate font-medium text-text-primary">{b.label}</span>
              <Tag tone="brand" size="sm">{SPAWN_STAGE_LABEL[b.stage]}</Tag>
              <span className="ml-auto text-xs text-text-muted">this batch</span>
            </li>
            {children.map((c) => (
              <li key={c.id}>
                <div className="pl-1 text-text-muted"><ChevronRight className="h-3 w-3 rotate-90" /></div>
                <Link to="/spawn/$batchId" params={{ batchId: c.id }} className="flex items-center gap-2 text-sm text-text-secondary hover:text-brand-700">
                  <span className="font-mono text-xs w-24 shrink-0">{c.code}</span>
                  <span className="truncate">{c.label}</span>
                  <Tag tone="neutral" size="sm">{SPAWN_STAGE_LABEL[c.stage]}</Tag>
                </Link>
              </li>
            ))}
          </ol>
          {ancestry.length === 0 && children.length === 0 && <p className="text-sm text-text-muted">No lineage links yet. Set 'Transferred from' on a child batch to build the chain.</p>}
        </Card>

        {/* details */}
        <Card padding="lg">
          <CardTitle className="mb-4">Batch details</CardTitle>
          <DataList layout="inline" items={[
            { label: "Strain", value: strain?.name ?? "—" },
            { label: "Stage", value: SPAWN_STAGE_LABEL[b.stage] },
            { label: "Substrate", value: b.substrate || "—" },
            { label: "Container", value: b.container || "—" },
            { label: "Quantity", value: b.quantity ? `${b.quantity}` : "—", mono: true },
            { label: "Incubation zone", value: zone ? <Link to="/zone/$zoneId" params={{ zoneId: zone.id }} className="text-brand-700 hover:underline">{zone.name}</Link> : "—" },
            { label: "Inoculated", value: b.inoculatedOn || "—", mono: true },
            { label: "Buyer / order", value: b.buyer || "—" },
          ]} />
          {b.notes && <p className="text-sm text-text-muted mt-4 pt-4 border-t border-border-default">{b.notes}</p>}
        </Card>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/spawn/$batchId")({ component: SpawnDetail });
