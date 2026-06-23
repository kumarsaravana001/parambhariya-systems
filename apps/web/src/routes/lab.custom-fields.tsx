import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Card, Button, Alert, Tag, Checkbox, Label, Input, FormField, IconButton,
  Table, THead, TBody, TR, TH, TD, ListSkeleton, ErrorState, EmptyState,
} from "@parambhariya/ui";
import { Plus, Type, Hash, Calendar, List, AlignLeft, Trash2 } from "lucide-react";
import type { CustomField, CustomFieldType } from "@parambhariya/types";
import { useCustomFields, useCreate, useRemove } from "../lib/queries";

const TYPES: { type: CustomFieldType; icon: React.ReactNode; use: string }[] = [
  { type: "Text", icon: <Type />, use: "Short text input, single line" },
  { type: "Number", icon: <Hash />, use: "Numeric value" },
  { type: "Date", icon: <Calendar />, use: "Date picker" },
  { type: "Dropdown", icon: <List />, use: "Fixed choice list" },
  { type: "Long Text", icon: <AlignLeft />, use: "Multi-line text area" },
];

function CustomFields() {
  const fields = useCustomFields();
  const create = useCreate<CustomField>("custom-fields");
  const remove = useRemove("custom-fields");
  const [adding, setAdding] = React.useState(false);
  const [label, setLabel] = React.useState("");
  const [type, setType] = React.useState<CustomFieldType>("Text");
  const [required, setRequired] = React.useState(false);

  if (fields.isLoading) return <ListSkeleton rows={3} />;
  if (fields.error) return <ErrorState title="Failed to load custom fields" onRetry={() => fields.refetch()} />;
  const list = fields.data ?? [];

  const save = async () => {
    if (!label.trim()) return;
    await create.mutateAsync({ label: label.trim(), type, required });
    setLabel(""); setType("Text"); setRequired(false); setAdding(false);
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-text-primary">Custom Fields</h2>
        <p className="text-sm text-text-muted">Define extra fields that appear on every culture in your lab.</p>
      </div>

      <Alert tone="info" title="Custom fields appear on all cultures in your lab" className="mb-6">
        Fields you define here appear in the Basic tab of every culture, in the import template, and in data exports. Deleting a field does not erase its existing values.
      </Alert>

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-primary">{list.length} custom fields</h3>
        <Button size="sm" variant={adding ? "secondary" : "primary"} onClick={() => setAdding((a) => !a)}><Plus className="h-4 w-4" /> Add field</Button>
      </div>

      {adding && (
        <Card padding="lg" className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Label" htmlFor="cf-label" required><Input id="cf-label" placeholder="Collection Site" value={label} onChange={(e) => setLabel(e.target.value)} /></FormField>
            <div className="flex flex-col gap-1.5">
              <Label>Field Type</Label>
              <div className="flex flex-wrap gap-2">
                {TYPES.map((t) => (
                  <button key={t.type} type="button" onClick={() => setType(t.type)}
                    className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-md border text-sm font-medium [&_svg]:h-4 [&_svg]:w-4 ${type === t.type ? "bg-brand-500 text-white border-brand-500" : "bg-surface-card border-border-default text-text-secondary hover:bg-surface-muted"}`}>
                    {t.icon}{t.type}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <label className="flex items-center gap-2 mt-4"><Checkbox checked={required} onCheckedChange={(v) => setRequired(!!v)} /> <span className="text-sm text-text-secondary">Required field — users must fill this in before saving a culture</span></label>
          <div className="flex justify-end gap-2 mt-4"><Button variant="secondary" size="sm" onClick={() => setAdding(false)}>Cancel</Button><Button size="sm" onClick={save} loading={create.isPending}>Save field</Button></div>
        </Card>
      )}

      {list.length === 0 ? (
        <EmptyState icon={<Plus />} title="No custom fields yet" description="Add fields that are specific to your lab's workflow." />
      ) : (
        <Table>
          <THead><TR className="hover:bg-transparent"><TH>Label</TH><TH>Type</TH><TH>Required</TH><TH className="text-right">Actions</TH></TR></THead>
          <TBody>
            {list.map((f) => (
              <TR key={f.id}>
                <TD className="font-medium">{f.label}</TD>
                <TD><Tag tone="neutral" size="sm">{f.type}</Tag></TD>
                <TD>{f.required ? <Tag tone="warn" size="sm">Required</Tag> : <span className="text-text-muted text-xs">Optional</span>}</TD>
                <TD className="text-right"><IconButton aria-label="Delete" variant="ghost" size="sm" className="text-danger-fg" onClick={() => remove.mutate(f.id)}><Trash2 /></IconButton></TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      <Card padding="lg" className="mt-6">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Field Types</h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TYPES.map((t) => (
            <li key={t.type} className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-md bg-surface-muted grid place-items-center text-text-secondary [&_svg]:h-4 [&_svg]:w-4" aria-hidden>{t.icon}</span>
              <div><div className="text-sm font-medium text-text-primary">{t.type}</div><div className="text-xs text-text-muted">{t.use}</div></div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/lab/custom-fields")({ component: CustomFields });
