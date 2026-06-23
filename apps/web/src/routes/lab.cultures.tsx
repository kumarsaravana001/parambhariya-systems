import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Card, MetricCard, Button, SearchInput, Badge, Checkbox, FilterChip,
  Table, THead, TBody, TR, TH, TD,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
  Tabs, TabsList, TabsTrigger, TabsContent,
  FormField, Input, Textarea, Switch, Label,
} from "@parambhariya/ui";
import { FlaskConical, CheckCircle2, AlertTriangle, RefreshCw, Plus, Upload } from "lucide-react";
import {
  cultures, cultureStats, statusTone, CULTURE_STATUSES, KINGDOMS, CULTURE_FORMATS,
} from "../data/lab";

const TABS = ["Basic", "Isolation", "Revival", "Transfers", "Observations", "Inventory", "Storage", "Logs"] as const;

function AddCultureModal() {
  const [remind, setRemind] = React.useState(true);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4" /> Add Culture</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add New Culture</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="Basic">
          <TabsList className="overflow-x-auto">
            {TABS.map((t) => <TabsTrigger key={t} value={t}>{t}</TabsTrigger>)}
          </TabsList>

          <TabsContent value="Basic">
            <div className="max-h-[55vh] overflow-y-auto pr-1 flex flex-col gap-6">
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-[0.06em] text-text-muted mb-3">Identity</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Culture ID" htmlFor="c-id" required hint="Auto-generated">
                    <Input id="c-id" defaultValue="CB-009" />
                  </FormField>
                  <FormField label="Status" htmlFor="c-status" required>
                    <Select defaultValue="active">
                      <SelectTrigger id="c-status"><SelectValue /></SelectTrigger>
                      <SelectContent>{CULTURE_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Culture Format" htmlFor="c-fmt" required>
                    <Select defaultValue={CULTURE_FORMATS[0]}>
                      <SelectTrigger id="c-fmt"><SelectValue /></SelectTrigger>
                      <SelectContent>{CULTURE_FORMATS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Common / Strain Name" htmlFor="c-name" required>
                    <Input id="c-name" placeholder="White Button Mushroom LC" />
                  </FormField>
                  <FormField label="Strain Code" htmlFor="c-code">
                    <Input id="c-code" placeholder="WB-2023-A" />
                  </FormField>
                  <FormField label="Acquisition Date" htmlFor="c-acq">
                    <Input id="c-acq" type="date" />
                  </FormField>
                  <FormField label="Genus" htmlFor="c-genus" required>
                    <Input id="c-genus" placeholder="Agaricus" />
                  </FormField>
                  <FormField label="Species" htmlFor="c-species" required>
                    <Input id="c-species" placeholder="bisporus" />
                  </FormField>
                  <FormField label="Kingdom" htmlFor="c-kingdom">
                    <Select>
                      <SelectTrigger id="c-kingdom"><SelectValue placeholder="Select kingdom" /></SelectTrigger>
                      <SelectContent>{KINGDOMS.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Category" htmlFor="c-cat">
                    <Select>
                      <SelectTrigger id="c-cat"><SelectValue placeholder="Pick category" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basidio">Fungi › Basidiomycetes</SelectItem>
                        <SelectItem value="asco">Fungi › Ascomycetes</SelectItem>
                        <SelectItem value="bact">Bacteria</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
                <div className="mt-4">
                  <FormField label="Source" htmlFor="c-src">
                    <Textarea id="c-src" placeholder="Wild specimen, soil sample, Supplier XYZ…" />
                  </FormField>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-[0.06em] text-text-muted mb-3">Transfer Schedule</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Subculture Interval (days)" htmlFor="c-int" hint="Auto-calculates next transfer">
                    <Input id="c-int" type="number" defaultValue={15} />
                  </FormField>
                  <FormField label="Next Transfer Date" htmlFor="c-next">
                    <Input id="c-next" type="date" />
                  </FormField>
                  <div className="flex items-center justify-between sm:col-span-2 py-2">
                    <Label htmlFor="c-remind">Enable transfer reminders</Label>
                    <Switch id="c-remind" checked={remind} onCheckedChange={setRemind} />
                  </div>
                  <FormField label="Notify me X days before due date" htmlFor="c-notify">
                    <Input id="c-notify" type="number" defaultValue={3} disabled={!remind} />
                  </FormField>
                </div>
              </section>

              <FormField label="Notes" htmlFor="c-notes">
                <Textarea id="c-notes" placeholder="General notes about this culture…" />
              </FormField>
            </div>
          </TabsContent>

          {TABS.slice(1).map((t) => (
            <TabsContent key={t} value={t}>
              <div className="max-h-[55vh] grid place-items-center text-center py-12 px-6 rounded-lg border-2 border-dashed border-border-default">
                <div>
                  <FlaskConical className="h-8 w-8 text-text-muted mx-auto mb-2" aria-hidden />
                  <div className="text-sm font-medium text-text-primary">{t}</div>
                  <p className="text-xs text-text-muted mt-1 max-w-sm">{TAB_HINT[t]}</p>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
        <DialogFooter>
          <DialogClose asChild><Button variant="secondary" size="sm">Cancel</Button></DialogClose>
          <Button size="sm">Create Culture</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const TAB_HINT: Record<string, string> = {
  Isolation: "How and where the culture was isolated — isolation date, method, environment details.",
  Revival: "Revival protocol — how to bring this culture back from storage.",
  Transfers: "Subculture / passage logging — transfer history and generation tracking.",
  Observations: "Visual and phenotypic observations, growth notes, contamination flags.",
  Inventory: "Stock count management and quantity tracking.",
  Storage: "Storage location assignment, format, and viability tracking.",
  Logs: "Activity logs specific to this culture record.",
};

function Cultures() {
  const s = cultureStats();
  const [query, setQuery] = React.useState("");
  const [overdue, setOverdue] = React.useState(false);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const rows = cultures.filter((c) => {
    if (overdue && !c.nextTransfer) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return c.id.toLowerCase().includes(q) || `${c.genus} ${c.species}`.toLowerCase().includes(q) || c.commonName.toLowerCase().includes(q);
  });

  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allChecked = rows.length > 0 && rows.every((r) => selected.has(r.id));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="flex-1"><SearchInput placeholder="Search cultures…" value={query} onChange={(e) => setQuery(e.target.value)} onClear={() => setQuery("")} /></div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm"><Upload className="h-4 w-4" /> Import</Button>
          <AddCultureModal />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <MetricCard label="Total Cultures" value={s.total} icon={<FlaskConical />} />
        <MetricCard label="Active" value={s.active} tone="success" icon={<CheckCircle2 />} />
        <MetricCard label="Contaminated" value={s.contaminated} tone={s.contaminated ? "danger" : "default"} icon={<AlertTriangle />} />
        <MetricCard label="With Storage" value={s.withStorage} tone="warn" icon={<RefreshCw />} />
      </div>

      <Card padding="md" className="mb-4 flex flex-wrap items-center gap-3">
        {["Status", "Category", "Contamination", "Location"].map((f) => (
          <Select key={f}>
            <SelectTrigger className="w-auto min-w-[150px]"><SelectValue placeholder={`All ${f.toLowerCase()}`} /></SelectTrigger>
            <SelectContent><SelectItem value="all">All {f.toLowerCase()}</SelectItem></SelectContent>
          </Select>
        ))}
        <FilterChip active={overdue} onClick={() => setOverdue((v) => !v)}>Overdue only</FilterChip>
        <span className="ml-auto text-sm text-text-muted font-mono">{rows.length} cultures</span>
      </Card>

      <Table>
        <THead>
          <TR className="hover:bg-transparent">
            <TH className="w-10"><Checkbox checked={allChecked} onCheckedChange={(v) => setSelected(v ? new Set(rows.map((r) => r.id)) : new Set())} aria-label="Select all" /></TH>
            <TH>Culture ID</TH><TH>Organism</TH><TH>Kingdom</TH><TH>Status</TH>
            <TH className="text-right">Gen</TH><TH className="text-right">Stock</TH><TH>Storage</TH><TH>Next Transfer</TH>
          </TR>
        </THead>
        <TBody>
          {rows.map((c) => (
            <TR key={c.id}>
              <TD><Checkbox checked={selected.has(c.id)} onCheckedChange={() => toggle(c.id)} aria-label={`Select ${c.id}`} /></TD>
              <TD className="font-mono">{c.id}</TD>
              <TD><span className="italic">{c.genus} {c.species}</span><div className="text-xs text-text-muted not-italic">{c.commonName}</div></TD>
              <TD className="text-text-secondary">{c.kingdom}</TD>
              <TD>
                <div className="flex items-center gap-1.5">
                  <Badge tone={statusTone[c.status]}>{c.status}</Badge>
                  {c.contaminated && <Badge tone="danger">contam</Badge>}
                </div>
              </TD>
              <TD className="text-right font-mono">{c.gen}</TD>
              <TD className="text-right font-mono">{c.stock}</TD>
              <TD className="text-text-muted text-xs">{c.storage ?? "—"}</TD>
              <TD className="font-mono text-xs">{c.nextTransfer ?? "—"}</TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}

export const Route = createFileRoute("/lab/cultures")({ component: Cultures });
