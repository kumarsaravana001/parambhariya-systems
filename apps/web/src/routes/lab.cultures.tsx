import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Card, MetricCard, Button, SearchInput, Badge, IconButton, FilterChip,
  Table, THead, TBody, TR, TH, TD, ListSkeleton, ErrorState, EmptyState, ConfirmDialog,
} from "@parambhariya/ui";
import { FlaskConical, CheckCircle2, AlertTriangle, RefreshCw, Plus, Pencil, Trash2 } from "lucide-react";
import type { Culture, CultureStatus } from "@parambhariya/types";
import { useCultures, useStorage, useCategories, useCreate, useUpdate, useRemove } from "../lib/queries";
import { EntityForm, type FieldSpec } from "../lib/EntityForm";
import { SectionHelp } from "../lib/SectionHelp";

const STATUSES: CultureStatus[] = ["active", "inactive", "archived", "quarantine", "extinct"];
const KINGDOMS = ["Archaebacteria", "Eubacteria", "Protista", "Fungi", "Plantae", "Animalia"];
const tone: Record<CultureStatus, "success" | "neutral" | "warn" | "danger"> = { active: "success", inactive: "neutral", archived: "neutral", quarantine: "warn", extinct: "danger" };

function Cultures() {
  const cultures = useCultures();
  const storage = useStorage();
  const categories = useCategories();
  const create = useCreate<Culture>("cultures");
  const update = useUpdate<Culture>("cultures");
  const remove = useRemove("cultures");

  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | CultureStatus | "contam">("all");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Culture | null>(null);
  const [deleting, setDeleting] = React.useState<Culture | null>(null);

  if (cultures.isLoading) return <ListSkeleton rows={5} />;
  if (cultures.error) return <ErrorState title="Failed to load cultures" onRetry={() => cultures.refetch()} />;
  const list = cultures.data ?? [];

  const stats = {
    total: list.length, active: list.filter((c) => c.status === "active").length,
    contaminated: list.filter((c) => c.contaminated).length, withStorage: list.filter((c) => c.storageId).length,
  };
  const rows = list.filter((c) => {
    if (statusFilter === "contam" && !c.contaminated) return false;
    if (statusFilter !== "all" && statusFilter !== "contam" && c.status !== statusFilter) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return c.code.toLowerCase().includes(q) || `${c.genus} ${c.species}`.toLowerCase().includes(q) || c.commonName.toLowerCase().includes(q);
  });

  const fields: FieldSpec[] = [
    { name: "code", label: "Culture ID", required: true, placeholder: "CB-009" },
    { name: "status", label: "Status", type: "select", required: true, options: STATUSES.map((s) => ({ value: s, label: s })) },
    { name: "commonName", label: "Common / strain name", placeholder: "Pearl Oyster MC", span: 2 },
    { name: "genus", label: "Genus", required: true, placeholder: "Pleurotus" },
    { name: "species", label: "Species", required: true, placeholder: "ostreatus" },
    { name: "kingdom", label: "Kingdom", type: "select", required: true, options: KINGDOMS.map((k) => ({ value: k, label: k })) },
    { name: "strainCode", label: "Strain code", placeholder: "PO-2024-A" },
    { name: "gen", label: "Generation", type: "number" },
    { name: "stock", label: "Stock", type: "number" },
    { name: "storageId", label: "Storage", type: "select", options: (storage.data ?? []).map((s) => ({ value: s.id, label: s.name })) },
    { name: "categoryId", label: "Category", type: "select", options: (categories.data ?? []).map((c) => ({ value: c.id, label: c.name })) },
    { name: "intervalDays", label: "Subculture interval (days)", type: "number" },
  ];

  return (
    <div>
      <SectionHelp id="lab-cultures" items={[
        { label: "What this is", body: "Your microbial culture bank — every strain you keep on agar, with status, generation and stock." },
        { label: "Spawn link", body: "Cultures here are the start of the spawn ladder. Use the Spawn section (Spawn → in the sub-nav) to multiply a culture into grain and substrate spawn with ready dates." },
        { label: "Quarantine", body: "Flag anything suspect as contaminated/quarantine so it never enters a spawn transfer." },
      ]} />
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="flex-1"><SearchInput placeholder="Search cultures…" value={query} onChange={(e) => setQuery(e.target.value)} onClear={() => setQuery("")} /></div>
        <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}><Plus className="h-4 w-4" /> Add Culture</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <MetricCard label="Total Cultures" value={stats.total} icon={<FlaskConical />} />
        <MetricCard label="Active" value={stats.active} tone="success" icon={<CheckCircle2 />} />
        <MetricCard label="Contaminated" value={stats.contaminated} tone={stats.contaminated ? "danger" : "default"} icon={<AlertTriangle />} />
        <MetricCard label="With Storage" value={stats.withStorage} tone="warn" icon={<RefreshCw />} />
      </div>

      <Card padding="md" className="mb-4 flex flex-wrap items-center gap-2">
        <FilterChip active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>All</FilterChip>
        {STATUSES.map((s) => <FilterChip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>{s}</FilterChip>)}
        <FilterChip active={statusFilter === "contam"} onClick={() => setStatusFilter("contam")}>contaminated</FilterChip>
        <span className="ml-auto text-sm text-text-muted font-mono">{rows.length} cultures</span>
      </Card>

      {rows.length === 0 ? (
        <EmptyState icon={<FlaskConical />} title="No cultures" description="Add your first microbial culture to start tracking." action={<Button size="sm" onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" /> Add Culture</Button>} />
      ) : (
        <Table>
          <THead><TR className="hover:bg-transparent"><TH>Culture ID</TH><TH>Organism</TH><TH>Kingdom</TH><TH>Status</TH><TH className="text-right">Gen</TH><TH className="text-right">Stock</TH><TH className="text-right">Actions</TH></TR></THead>
          <TBody>
            {rows.map((c) => (
              <TR key={c.id}>
                <TD className="font-mono">{c.code}</TD>
                <TD><span className="italic">{c.genus} {c.species}</span><div className="text-xs text-text-muted not-italic">{c.commonName}</div></TD>
                <TD className="text-text-secondary">{c.kingdom}</TD>
                <TD><div className="flex items-center gap-1.5"><Badge tone={tone[c.status]}>{c.status}</Badge>{c.contaminated && <Badge tone="danger">contam</Badge>}</div></TD>
                <TD className="text-right font-mono">{c.gen}</TD>
                <TD className="text-right font-mono">{c.stock}</TD>
                <TD className="text-right">
                  <div className="inline-flex gap-1">
                    <IconButton aria-label="Edit" variant="ghost" size="sm" onClick={() => { setEditing(c); setFormOpen(true); }}><Pencil /></IconButton>
                    <IconButton aria-label="Delete" variant="ghost" size="sm" className="text-danger-fg" onClick={() => setDeleting(c)}><Trash2 /></IconButton>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      <EntityForm
        open={formOpen} onOpenChange={setFormOpen}
        title={editing ? `Edit ${editing.code}` : "Add Culture"} submitLabel={editing ? "Save changes" : "Create Culture"}
        busy={create.isPending || update.isPending}
        initial={editing ?? { status: "active", kingdom: "Fungi", gen: 1, stock: 0, intervalDays: 15 }}
        fields={fields}
        onSubmit={async (v) => {
          const body = { ...v, storageId: v.storageId || null, categoryId: v.categoryId || null };
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

export const Route = createFileRoute("/lab/cultures")({ component: Cultures });
