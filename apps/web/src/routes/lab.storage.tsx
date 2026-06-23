import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card, Button, EmptyState, ListSkeleton, ErrorState } from "@parambhariya/ui";
import { Database, Plus, Building2, DoorOpen, Snowflake, Refrigerator, Grid3x3, Package, Box, Thermometer } from "lucide-react";
import type { StorageLocation } from "@parambhariya/types";
import { useStorage, useCreate } from "../lib/queries";
import { EntityForm } from "../lib/EntityForm";
import { HierarchyTree } from "../lab/HierarchyTree";
import { buildTree } from "../lib/tree";

const TYPES = ["building", "room", "incubator", "refrigerator", "freezer", "ultra low freezer", "rack", "box", "shelf", "position"];
const ICON: Record<string, React.ReactNode> = { building: <Building2 />, room: <DoorOpen />, incubator: <Thermometer />, refrigerator: <Refrigerator />, freezer: <Snowflake />, "ultra low freezer": <Snowflake />, rack: <Grid3x3 />, box: <Box />, shelf: <Package />, position: <Package /> };

function Storage() {
  const storage = useStorage();
  const create = useCreate<StorageLocation>("storage");
  const [open, setOpen] = React.useState(false);

  if (storage.isLoading) return <ListSkeleton rows={4} />;
  if (storage.error) return <ErrorState title="Failed to load storage" onRetry={() => storage.refetch()} />;
  const rows = storage.data ?? [];
  const roots = rows.filter((r) => !r.parentId).length;
  const typeOf = new Map(rows.map((r) => [r.id, r.type]));

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Storage Locations</h2>
          <p className="text-sm text-text-muted">{rows.length} locations · {roots} root node{roots !== 1 ? "s" : ""}</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New location</Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={<Database />} title="No storage locations yet" description="Add buildings, rooms, freezers, racks and boxes to track where cultures are stored."
          action={<Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add first location</Button>} />
      ) : (
        <Card padding="md">
          <HierarchyTree items={buildTree(rows, (r) => r.tempRange || undefined)} icon={(it) => ICON[typeOf.get(it.id) ?? ""] ?? null} />
        </Card>
      )}

      <EntityForm
        open={open} onOpenChange={setOpen} title="New location" submitLabel="Create" busy={create.isPending}
        fields={[
          { name: "name", label: "Name", required: true, placeholder: "Freezer A, Rack 3…", span: 2 },
          { name: "type", label: "Type", type: "select", required: true, options: TYPES.map((t) => ({ value: t, label: t })) },
          { name: "tempRange", label: "Temperature range", placeholder: "-80 °C, 4 °C, 37 °C" },
          { name: "parentId", label: "Parent (optional)", type: "select", options: rows.map((r) => ({ value: r.id, label: r.name })), span: 2 },
        ]}
        initial={{ type: "box" }}
        onSubmit={async (v) => { await create.mutateAsync({ ...v, parentId: v.parentId || null }); setOpen(false); }}
      />
    </div>
  );
}

export const Route = createFileRoute("/lab/storage")({ component: Storage });
