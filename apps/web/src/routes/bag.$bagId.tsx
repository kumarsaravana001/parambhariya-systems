import * as React from "react";
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import {
  PageHeader, Breadcrumb, Card, CardTitle, DataList, LifeBadge, LifecycleStepper, Button, Progress,
  DetailSkeleton, ErrorState,
} from "@parambhariya/ui";
import { Pencil, Trash2 } from "lucide-react";
import type { Bag, LifecycleStage } from "@parambhariya/types";
import { useBag, useZones, useRooms, useFarm, useStrains, useUpdate, useRemove } from "../lib/queries";
import { EntityForm } from "../lib/EntityForm";
import { useNavigate } from "@tanstack/react-router";

function BagDetail() {
  const { bagId } = Route.useParams();
  const navigate = useNavigate();
  const bag = useBag(bagId);
  const zones = useZones();
  const rooms = useRooms();
  const strains = useStrains();
  const update = useUpdate<Bag>("bags");
  const remove = useRemove("bags");
  const [editOpen, setEditOpen] = React.useState(false);

  const zone = (zones.data ?? []).find((z) => z.id === bag.data?.zoneId);
  const room = (rooms.data ?? []).find((r) => r.id === zone?.roomId);
  const farm = useFarm(room?.farmId);

  if (bag.isLoading) return <DetailSkeleton />;
  if (bag.error) return <ErrorState title="Failed to load bag" onRetry={() => bag.refetch()} />;
  if (!bag.data) throw notFound();

  const b = bag.data;
  const strain = (strains.data ?? []).find((s) => s.id === b.strainId);
  const isTerminal = b.status === "CONTAMINATED" || b.status === "DISPOSED";

  return (
    <div>
      <Breadcrumb className="mb-2" items={[
        { label: "Farms", href: "/farms" },
        { label: farm.data?.name ?? "Farm", href: room?.farmId ? `/farms/${room.farmId}` : undefined },
        { label: room?.name ?? "Room", href: room?.id ? `/room/${room.id}` : undefined },
        { label: zone?.name ?? "Zone", href: zone?.id ? `/zone/${zone.id}` : undefined },
        { label: b.code },
      ]} />
      <PageHeader title={b.code} description={`${strain?.name ?? ""} · ${zone?.name ?? ""}`}
        actions={
          <>
            <LifeBadge stage={b.status} progress={b.stageProgress} />
            <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}><Pencil className="h-4 w-4" /> Edit</Button>
            <Button variant="ghost" size="sm" className="text-danger-fg" onClick={async () => { await remove.mutateAsync(b.id); navigate({ to: "/farms" }); }}>
              <Trash2 className="h-4 w-4" /> Discard
            </Button>
          </>
        } />

      <Card padding="lg" className="mb-6">
        <CardTitle className="mb-4">Lifecycle</CardTitle>
        <LifecycleStepper current={b.status} intraProgress={b.stageProgress} />
        {!isTerminal && (
          <div className="mt-6 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span className="uppercase tracking-[0.06em] font-semibold">{b.status} progress</span>
              <span className="font-mono">{Math.round(b.stageProgress * 100)} %</span>
            </div>
            <Progress value={b.stageProgress * 100} stage={b.status} />
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card padding="lg">
          <CardTitle className="mb-4">Details</CardTitle>
          <DataList layout="inline" items={[
            { label: "Strain", value: strain?.name ?? "—" },
            { label: "Scientific", value: strain?.scientific ?? "—" },
            { label: "Zone", value: <Link to="/zone/$zoneId" params={{ zoneId: zone?.id ?? "" }} className="text-brand-700 hover:underline">{zone?.name}</Link> },
            { label: "Stage", value: b.status, mono: true },
            { label: "Created", value: b.createdAt.slice(0, 10), mono: true },
            { label: "Cycle est.", value: strain ? `${strain.cycleDays} days` : "—", mono: true },
          ]} />
        </Card>
        <Card padding="lg">
          <CardTitle className="mb-4">Production</CardTitle>
          <DataList layout="inline" items={[
            { label: "Substrate", value: b.substrate || "—" },
            { label: "Substrate weight", value: b.substrateWeightKg ? `${b.substrateWeightKg} kg` : "—", mono: true },
            { label: "Inoculated", value: b.inoculatedOn || "—", mono: true },
            { label: "Expected harvest", value: b.expectedHarvest || "—", mono: true },
            { label: "Harvest weight", value: b.weightG ? `${b.weightG} g` : "—", mono: true },
            { label: "Flushes", value: String(b.flushCount ?? 0), mono: true },
          ]} />
          {b.notes && <p className="text-sm text-text-muted mt-4 pt-4 border-t border-border-default">{b.notes}</p>}
        </Card>
      </div>

      <EntityForm
        open={editOpen} onOpenChange={setEditOpen} title={`Edit ${b.code}`} submitLabel="Save changes" busy={update.isPending}
        initial={{ status: b.status, stageProgress: b.stageProgress, weightG: b.weightG ?? "", zoneId: b.zoneId, substrate: b.substrate, substrateWeightKg: b.substrateWeightKg, inoculatedOn: b.inoculatedOn, expectedHarvest: b.expectedHarvest, flushCount: b.flushCount, notes: b.notes }}
        fields={[
          { name: "status", label: "Stage", type: "select", required: true, options: ["CREATED", "COLONIZING", "PINNING", "FRUITING", "HARVESTED", "CONTAMINATED", "DISPOSED"].map((v) => ({ value: v, label: v })) },
          { name: "stageProgress", label: "Stage progress (0–1)", type: "number", step: 0.05, min: 0, max: 1 },
          { name: "zoneId", label: "Zone", type: "select", options: (zones.data ?? []).map((z) => ({ value: z.id, label: z.name })) },
          { name: "substrate", label: "Substrate", type: "select", options: ["Supplemented sawdust", "Hardwood sawdust", "Sawdust + bran", "Paddy straw", "Coir pith", "Wheat straw"].map((v) => ({ value: v, label: v })) },
          { name: "substrateWeightKg", label: "Substrate weight (kg)", type: "number", step: 0.1 },
          { name: "inoculatedOn", label: "Inoculated on", type: "date" },
          { name: "expectedHarvest", label: "Expected harvest", type: "date" },
          { name: "weightG", label: "Harvest weight (g)", type: "number" },
          { name: "flushCount", label: "Flushes harvested", type: "number" },
          { name: "notes", label: "Notes", type: "textarea" },
        ]}
        onSubmit={async (v) => { await update.mutateAsync({ id: b.id, body: v }); setEditOpen(false); }}
      />
    </div>
  );
}

export const Route = createFileRoute("/bag/$bagId")({ component: BagDetail });
