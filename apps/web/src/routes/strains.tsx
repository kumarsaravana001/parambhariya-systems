import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  PageHeader, StrainCard, Button, ListSkeleton, ErrorState, EmptyState, IconButton, ConfirmDialog,
} from "@parambhariya/ui";
import { Plus, Dna, Pencil, Trash2 } from "lucide-react";
import type { Strain } from "@parambhariya/types";
import { useStrains, useCreate, useUpdate, useRemove } from "../lib/queries";
import { EntityForm } from "../lib/EntityForm";

const fields = [
  { name: "name", label: "Name", required: true, placeholder: "Pearl Oyster" },
  { name: "scientific", label: "Scientific name", placeholder: "Pleurotus ostreatus" },
  { name: "optimalTempMin", label: "Temp min (°C)", type: "number" as const, step: 0.5 },
  { name: "optimalTempMax", label: "Temp max (°C)", type: "number" as const, step: 0.5 },
  { name: "optimalRhMin", label: "RH min (%)", type: "number" as const },
  { name: "optimalRhMax", label: "RH max (%)", type: "number" as const },
  { name: "optimalCo2Max", label: "CO₂ max (ppm)", type: "number" as const, step: 50 },
  { name: "colonizationDays", label: "Colonization (days)", type: "number" as const },
  { name: "fruitingDays", label: "Fruiting (days)", type: "number" as const },
  { name: "cycleDays", label: "Total cycle (days)", type: "number" as const, required: true },
  { name: "yieldKg", label: "Yield / cycle (kg)", type: "number" as const, step: 0.1 },
  { name: "supplier", label: "Spawn supplier", placeholder: "Parambhariya spawn lab" },
  { name: "notes", label: "Notes", type: "textarea" as const },
];

function StrainsScreen() {
  const strains = useStrains();
  const create = useCreate<Strain>("strains");
  const update = useUpdate<Strain>("strains");
  const remove = useRemove("strains");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Strain | null>(null);
  const [deleting, setDeleting] = React.useState<Strain | null>(null);

  if (strains.isLoading) return <><PageHeader title="Strain Catalog" /><ListSkeleton rows={4} /></>;
  if (strains.error) return <ErrorState title="Failed to load strains" onRetry={() => strains.refetch()} />;
  const list = strains.data ?? [];

  return (
    <div>
      <PageHeader title="Strain Catalog" description="Optimal ranges and cycle durations for every strain you grow."
        actions={<Button variant="primary" size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}><Plus className="h-4 w-4" /> Add strain</Button>} />

      {list.length === 0 ? (
        <EmptyState icon={<Dna />} title="No strains yet" description="Add a strain to track its optimal climate and cycle."
          action={<Button onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" /> Add strain</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((s) => (
            <div key={s.id} className="relative group">
              <StrainCard name={s.name} scientific={s.scientific}
                optimalTempC={[s.optimalTempMin, s.optimalTempMax]} optimalRhPct={[s.optimalRhMin, s.optimalRhMax]}
                cycleDays={s.cycleDays} yieldKg={s.yieldKg} />
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <IconButton aria-label="Edit" variant="secondary" size="sm" onClick={() => { setEditing(s); setFormOpen(true); }}><Pencil /></IconButton>
                <IconButton aria-label="Delete" variant="secondary" size="sm" className="text-danger-fg" onClick={() => setDeleting(s)}><Trash2 /></IconButton>
              </div>
            </div>
          ))}
        </div>
      )}

      <EntityForm
        open={formOpen} onOpenChange={setFormOpen}
        title={editing ? "Edit strain" : "Add strain"} submitLabel={editing ? "Save changes" : "Add strain"}
        busy={create.isPending || update.isPending} initial={editing ?? { optimalTempMin: 22, optimalTempMax: 26, optimalRhMin: 85, optimalRhMax: 95, optimalCo2Max: 1000, colonizationDays: 14, fruitingDays: 8, cycleDays: 22, yieldKg: 0 }}
        fields={fields}
        onSubmit={async (v) => {
          if (editing) await update.mutateAsync({ id: editing.id, body: v });
          else await create.mutateAsync(v);
          setFormOpen(false);
        }}
      />
      <ConfirmDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${deleting?.name}?`} destructive confirmLabel="Delete"
        onConfirm={async () => { if (deleting) await remove.mutateAsync(deleting.id); setDeleting(null); }} />
    </div>
  );
}

export const Route = createFileRoute("/strains")({ component: StrainsScreen });
