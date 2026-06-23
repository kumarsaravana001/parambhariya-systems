import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card, Button, EmptyState, ListSkeleton, ErrorState } from "@parambhariya/ui";
import { FolderTree, Plus } from "lucide-react";
import type { Category } from "@parambhariya/types";
import { useCategories, useCreate } from "../lib/queries";
import { EntityForm } from "../lib/EntityForm";
import { HierarchyTree } from "../lab/HierarchyTree";
import { buildTree } from "../lib/tree";

function Categories() {
  const categories = useCategories();
  const create = useCreate<Category>("categories");
  const [open, setOpen] = React.useState(false);

  if (categories.isLoading) return <ListSkeleton rows={4} />;
  if (categories.error) return <ErrorState title="Failed to load categories" onRetry={() => categories.refetch()} />;
  const rows = categories.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Categories</h2>
          <p className="text-sm text-text-muted">{rows.length} categories</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New category</Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={<FolderTree />} title="No categories yet" description="Group cultures by taxonomy or experiment type using a hierarchical tree."
          action={<Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Create first category</Button>} />
      ) : (
        <Card padding="md"><HierarchyTree items={buildTree(rows)} icon={() => <FolderTree />} /></Card>
      )}

      <EntityForm
        open={open} onOpenChange={setOpen} title="New category" submitLabel="Create" busy={create.isPending}
        fields={[
          { name: "name", label: "Category name", required: true, placeholder: "Bacteria, Fungi, Control strains…", span: 2 },
          { name: "parentId", label: "Parent (optional)", type: "select", options: rows.map((r) => ({ value: r.id, label: r.name })), span: 2 },
        ]}
        onSubmit={async (v) => { await create.mutateAsync({ ...v, parentId: v.parentId || null }); setOpen(false); }}
      />
    </div>
  );
}

export const Route = createFileRoute("/lab/categories")({ component: Categories });
