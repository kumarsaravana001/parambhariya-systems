import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  PageHeader, FarmCard, EmptyState, Button, ListSkeleton, ErrorState, IconButton,
  ConfirmDialog,
} from "@parambhariya/ui";
import { Sprout, Plus, Pencil, Trash2 } from "lucide-react";
import type { Farm, Room, Bag, Zone } from "@parambhariya/types";
import { useFarms, useRooms, useBags, useZones, useAlerts, useCreate, useUpdate, useRemove } from "../lib/queries";
import { EntityForm } from "../lib/EntityForm";
import { SectionHelp } from "../lib/SectionHelp";

const HELP = [
  { label: "What this is", body: "Your farms — each holds rooms → zones → bags. Capacity and area let you track how full each site is." },
  { label: "Add a farm", body: "Click Create farm and fill in area (m²), total bag capacity, manager and contact. Capacity drives the utilization bar on the farm page." },
  { label: "Edit / delete", body: "Hover a farm card to edit or remove it. Open a farm to manage its rooms and bags." },
];

function FarmsScreen() {
  const farms = useFarms();
  const rooms = useRooms();
  const bags = useBags();
  const zones = useZones();
  const alerts = useAlerts(true);

  const create = useCreate<Farm>("farms");
  const update = useUpdate<Farm>("farms");
  const remove = useRemove("farms");

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Farm | null>(null);
  const [deleting, setDeleting] = React.useState<Farm | null>(null);

  if (farms.isLoading) return <><PageHeader title="Your Farms" /><ListSkeleton rows={3} /></>;
  if (farms.error) return <ErrorState title="Failed to load farms" description={String(farms.error)} onRetry={() => farms.refetch()} />;

  const list = farms.data ?? [];
  const roomCount = (fid: string) => (rooms.data ?? []).filter((r) => r.farmId === fid).length;
  const bagCount = (fid: string) => (bags.data ?? []).filter((b) => {
    const z = (zones.data ?? []).find((z) => z.id === b.zoneId);
    const r = (rooms.data ?? []).find((r) => r.id === z?.roomId);
    return r?.farmId === fid;
  }).length;
  const alertCount = (fid: string) => (alerts.data ?? []).filter((a) => {
    const z = (zones.data ?? []).find((z) => z.id === a.zoneId);
    const r = (rooms.data ?? []).find((r) => r.id === z?.roomId);
    return r?.farmId === fid;
  }).length;

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (f: Farm) => { setEditing(f); setFormOpen(true); };

  return (
    <div>
      <PageHeader
        title="Your Farms"
        actions={<Button variant="primary" size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> Create farm</Button>}
      />
      <SectionHelp id="farms" items={HELP} />
      {list.length === 0 ? (
        <EmptyState icon={<Sprout />} title="No farms yet"
          description="Create your first farm to start monitoring your mushroom production."
          action={<Button variant="primary" onClick={openCreate}><Plus className="h-4 w-4" /> Create Your First Farm</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map((f) => (
            <div key={f.id} className="relative group">
              <Link to="/farms/$farmId" params={{ farmId: f.id }}>
                <FarmCard name={f.name} location={f.location} rooms={roomCount(f.id)} bags={bagCount(f.id)} alerts={alertCount(f.id)} />
              </Link>
              <div className="absolute top-3 right-12 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <IconButton aria-label="Edit farm" variant="secondary" size="sm" onClick={() => openEdit(f)}><Pencil /></IconButton>
                <IconButton aria-label="Delete farm" variant="secondary" size="sm" className="text-danger-fg" onClick={() => setDeleting(f)}><Trash2 /></IconButton>
              </div>
            </div>
          ))}
        </div>
      )}

      <EntityForm
        open={formOpen} onOpenChange={setFormOpen}
        title={editing ? "Edit farm" : "Create farm"}
        submitLabel={editing ? "Save changes" : "Create farm"}
        busy={create.isPending || update.isPending}
        initial={editing ?? undefined}
        fields={[
          { name: "name", label: "Farm name", required: true, placeholder: "Anaimalai Block A", span: 2 },
          { name: "location", label: "Location", placeholder: "Anaimalai, Tamil Nadu", span: 2 },
          { name: "areaSqM", label: "Cultivation area (m²)", type: "number", step: 10 },
          { name: "bagCapacity", label: "Total bag capacity", type: "number", step: 50 },
          { name: "manager", label: "Manager", placeholder: "Who runs this farm" },
          { name: "phone", label: "Contact phone", placeholder: "+91 …" },
          { name: "establishedOn", label: "Established on", type: "date", span: 2 },
        ]}
        onSubmit={async (v) => {
          if (editing) await update.mutateAsync({ id: editing.id, body: v });
          else await create.mutateAsync(v);
          setFormOpen(false);
        }}
      />

      <ConfirmDialog
        open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${deleting?.name}?`}
        description="This removes the farm. Rooms, zones, and bags under it are not auto-deleted."
        destructive confirmLabel="Delete"
        onConfirm={async () => { if (deleting) await remove.mutateAsync(deleting.id); setDeleting(null); }}
      />
    </div>
  );
}

export const Route = createFileRoute("/farms/")({ component: FarmsScreen });
