import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  PageHeader, Card, CardTitle, Button, Badge, Tag, Progress, MetricCard,
  ListSkeleton, ErrorState, EmptyState, ConfirmDialog, IconButton,
} from "@parambhariya/ui";
import {
  SPAWN_STAGE_ORDER, SPAWN_STAGE_LABEL, SPAWN_STAGE_BASE_DAYS, type SpawnStage, type SpawnBatch,
} from "@parambhariya/types";
import { FlaskConical, Plus, Pencil, Trash2, GitBranch, Clock, CheckCircle2, Thermometer } from "lucide-react";
import { useSpawn, useStrains, useZones, useCreate, useUpdate, useRemove } from "../lib/queries";
import { EntityForm, type FieldSpec } from "../lib/EntityForm";
import { SectionHelp } from "../lib/SectionHelp";
import { batchForecast, bandTone, statusTone, todayYMD } from "../lib/spawn";

const STATUSES = ["INOCULATED", "COLONIZING", "READY", "SOLD", "USED", "CONTAMINATED"];

function Spawn() {
  const spawn = useSpawn();
  const strains = useStrains();
  const zones = useZones();
  const create = useCreate<SpawnBatch>("spawn");
  const update = useUpdate<SpawnBatch>("spawn");
  const remove = useRemove("spawn");

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SpawnBatch | null>(null);
  const [deleting, setDeleting] = React.useState<SpawnBatch | null>(null);
  const [preStage, setPreStage] = React.useState<SpawnStage | null>(null);

  if (spawn.isLoading || strains.isLoading) return <><PageHeader title="Spawn Production" /><ListSkeleton rows={4} /></>;
  if (spawn.error) return <ErrorState title="Failed to load spawn" onRetry={() => spawn.refetch()} />;

  const list = spawn.data ?? [];
  const strainOf = (id: string) => (strains.data ?? []).find((s) => s.id === id);
  const zoneOf = (id?: string | null) => (zones.data ?? []).find((z) => z.id === id);
  const labelOf = (id?: string | null) => list.find((b) => b.id === id)?.label || list.find((b) => b.id === id)?.code || "";

  const fc = (b: SpawnBatch) => batchForecast(b, strainOf(b.strainId), zoneOf(b.zoneId) ?? undefined);

  const active = list.filter((b) => b.status === "INOCULATED" || b.status === "COLONIZING");
  const readySoon = active
    .map((b) => ({ b, f: fc(b) }))
    .filter((x) => x.f && x.f.forecast.daysRemaining <= 5)
    .sort((a, b) => (a.f!.forecast.daysRemaining - b.f!.forecast.daysRemaining));

  const fields: FieldSpec[] = [
    { name: "code", label: "Batch code", required: true, placeholder: "MC-OYS-001" },
    { name: "label", label: "Name / label", placeholder: "Culture A" },
    { name: "strainId", label: "Strain", type: "select", required: true, options: (strains.data ?? []).map((s) => ({ value: s.id, label: s.name })) },
    { name: "stage", label: "Stage", type: "select", required: true, options: SPAWN_STAGE_ORDER.map((s) => ({ value: s, label: SPAWN_STAGE_LABEL[s] })) },
    { name: "parentId", label: "Transferred from (lineage)", type: "select", options: [{ value: "", label: "— none (new culture) —" }, ...list.map((b) => ({ value: b.id, label: `${b.label || b.code} · ${SPAWN_STAGE_LABEL[b.stage]}` }))] },
    { name: "substrate", label: "Substrate", placeholder: "PDA agar / Sorghum grain / Sawdust" },
    { name: "container", label: "Container", placeholder: "Petri dish / Jar / Spawn bag" },
    { name: "quantity", label: "Quantity (units)", type: "number" },
    { name: "zoneId", label: "Incubation zone (for climate ETA)", type: "select", options: [{ value: "", label: "— none —" }, ...(zones.data ?? []).map((z) => ({ value: z.id, label: z.name }))] },
    { name: "inoculatedOn", label: "Inoculated on", type: "date", required: true },
    { name: "expectedColonizationDays", label: "Expected colonization (days, at optimum)", type: "number", hint: "Used as the base; the system adjusts it for the zone's climate" },
    { name: "status", label: "Status", type: "select", options: STATUSES.map((s) => ({ value: s, label: s })) },
    { name: "buyer", label: "Buyer / order (optional)", placeholder: "Who ordered this spawn" },
  ];

  const openCreate = (stage?: SpawnStage) => {
    setEditing(null);
    setPreStage(stage ?? null);
    setFormOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Spawn Production"
        eyebrow="Lab → Spawn"
        description="Track each spawn batch from inoculation to full colonization — with a climate-adjusted ready date."
        actions={
          <>
            <Link to="/lab/cultures"><Button variant="secondary" size="sm"><FlaskConical className="h-4 w-4" /> Lab cultures</Button></Link>
            <Button variant="primary" size="sm" onClick={() => openCreate()}><Plus className="h-4 w-4" /> New batch</Button>
          </>
        }
      />

      <SectionHelp
        id="spawn"
        items={[
          { label: "What this is", body: "Your spawn ladder — mother culture → grain G1/G2 → master spawn → substrate block. Each batch tracks its passage and lineage." },
          { label: "Lineage", body: "Set 'Transferred from' to record where a batch came from (e.g. Culture B was transferred from Culture A). The chain shows on each batch." },
          { label: "Ready date", body: "Enter the expected colonization days at optimum. If you assign an incubation zone, the system adjusts the ready date using that zone's LIVE temperature — colder = slower, hotter = slower + risk." },
          { label: "Selling", body: "The estimated ready date is what you quote a buyer who ordered spawn. 'Ready soon' below flags batches finishing within 5 days." },
        ]}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Active batches" value={active.length} icon={<FlaskConical />} />
        <MetricCard label="Ready soon (≤5d)" value={readySoon.length} tone={readySoon.length ? "warn" : "default"} icon={<Clock />} />
        <MetricCard label="Ready now" value={list.filter((b) => { const f = fc(b); return f?.forecast.isReady && (b.status === "COLONIZING" || b.status === "INOCULATED"); }).length} tone="success" icon={<CheckCircle2 />} />
        <MetricCard label="On order" value={list.filter((b) => b.buyer).length} icon={<GitBranch />} />
      </div>

      {readySoon.length > 0 && (
        <Card padding="lg" className="mb-6">
          <CardTitle className="mb-3">Ready soon</CardTitle>
          <ul className="flex flex-col gap-2">
            {readySoon.slice(0, 5).map(({ b, f }) => (
              <li key={b.id} className="flex items-center gap-3">
                <Link to="/spawn/$batchId" params={{ batchId: b.id }} className="font-mono text-sm text-brand-700 hover:underline w-28">{b.code}</Link>
                <span className="text-sm text-text-primary flex-1 truncate">{b.label} · {strainOf(b.strainId)?.name}</span>
                <span className="text-xs text-text-muted font-mono">ready {f!.forecast.readyOn}</span>
                <Tag tone={f!.forecast.daysRemaining === 0 ? "success" : "warn"} size="sm">{f!.forecast.daysRemaining === 0 ? "ready" : `${f!.forecast.daysRemaining}d`}</Tag>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {list.length === 0 ? (
        <EmptyState icon={<FlaskConical />} title="No spawn batches yet" description="Start your spawn ladder with a mother culture, then transfer down the chain."
          action={<Button onClick={() => openCreate()}><Plus className="h-4 w-4" /> New batch</Button>} />
      ) : (
        <div className="flex flex-col gap-6">
          {SPAWN_STAGE_ORDER.map((stage) => {
            const items = list.filter((b) => b.stage === stage);
            if (items.length === 0) return null;
            return (
              <section key={stage}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-semibold text-text-primary">{SPAWN_STAGE_LABEL[stage]} <span className="text-text-muted font-mono text-sm">· {items.length}</span></h2>
                  <span className="text-xs text-text-muted">base ~{SPAWN_STAGE_BASE_DAYS[stage]}d</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((b) => {
                    const f = fc(b);
                    const strain = strainOf(b.strainId);
                    return (
                      <Card key={b.id} className="flex flex-col gap-3 group relative">
                        <div className="flex items-start justify-between gap-2">
                          <Link to="/spawn/$batchId" params={{ batchId: b.id }} className="min-w-0">
                            <div className="font-mono text-sm text-text-secondary">{b.code}</div>
                            <div className="text-md font-semibold text-text-primary truncate">{b.label || strain?.name}</div>
                          </Link>
                          <Badge tone={statusTone(b.status)}>{b.status}</Badge>
                        </div>
                        <div className="text-xs text-text-muted flex items-center gap-2 flex-wrap">
                          <span>{strain?.name}</span>
                          {b.parentId && <Tag tone="neutral" size="sm"><GitBranch className="h-3 w-3" /> from {labelOf(b.parentId)}</Tag>}
                          {b.quantity > 0 && <span className="font-mono">{b.quantity} {b.container || "units"}</span>}
                        </div>
                        {f && b.status !== "CONTAMINATED" && (
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-text-muted">{f.forecast.isReady ? "Colonized" : `Ready ~${f.forecast.readyOn}`}</span>
                              <span className="font-mono text-text-secondary">{Math.round(f.forecast.progress * 100)}%</span>
                            </div>
                            <Progress value={f.forecast.progress * 100} />
                            <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                              <Thermometer className="h-3 w-3" /> {f.tempC.toFixed(1)} °C ({f.tempBasis})
                              {f.estimate.band !== "optimal" && <Tag tone={bandTone(f.estimate.band)} size="sm">{f.estimate.factor}× {f.estimate.band.replace("-", " ")}</Tag>}
                            </div>
                          </div>
                        )}
                        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <IconButton aria-label="Edit" variant="secondary" size="sm" onClick={() => { setEditing(b); setFormOpen(true); }}><Pencil /></IconButton>
                          <IconButton aria-label="Delete" variant="secondary" size="sm" className="text-danger-fg" onClick={() => setDeleting(b)}><Trash2 /></IconButton>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <EntityForm
        open={formOpen} onOpenChange={setFormOpen}
        title={editing ? `Edit ${editing.code}` : "New spawn batch"}
        submitLabel={editing ? "Save changes" : "Create batch"}
        busy={create.isPending || update.isPending}
        initial={editing ?? { stage: preStage ?? "MOTHER_CULTURE", status: "INOCULATED", inoculatedOn: todayYMD(), expectedColonizationDays: preStage ? SPAWN_STAGE_BASE_DAYS[preStage] : 8, quantity: 1 }}
        fields={fields}
        onSubmit={async (v) => {
          const body = { ...v, parentId: v.parentId || null, zoneId: v.zoneId || null };
          if (editing) await update.mutateAsync({ id: editing.id, body });
          else await create.mutateAsync(body);
          setFormOpen(false);
        }}
      />
      <ConfirmDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)} title={`Delete ${deleting?.code}?`} destructive confirmLabel="Delete"
        onConfirm={async () => { if (deleting) await remove.mutateAsync(deleting.id); setDeleting(null); }} />
    </div>
  );
}

export const Route = createFileRoute("/spawn/")({ component: Spawn });
