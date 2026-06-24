import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Card, SearchInput, Badge, IconButton, Table, THead, TBody, TR, TH, TD,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem, ListSkeleton, ErrorState, EmptyState,
} from "@parambhariya/ui";
import { RefreshCw, ScrollText } from "lucide-react";
import { useAudit } from "../lib/queries";

const ACTIONS = ["Created", "Updated", "Deleted"];
const actionTone: Record<string, "success" | "warn" | "danger"> = { Created: "success", Updated: "warn", Deleted: "danger" };

function Audit() {
  const audit = useAudit();
  const [query, setQuery] = React.useState("");
  const [action, setAction] = React.useState("all");

  if (audit.isLoading) return <ListSkeleton rows={5} />;
  if (audit.error) return <ErrorState title="Failed to load audit trail" onRetry={() => audit.refetch()} />;
  const rows = (audit.data ?? []).filter((e) => {
    if (action !== "all" && e.action !== action) return false;
    if (query && !`${e.user} ${e.detail} ${e.table}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <h2 className="text-lg font-semibold text-text-primary mb-4">Audit Trail</h2>
      <Card padding="md" className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-0 sm:min-w-[180px] basis-full sm:basis-auto"><SearchInput placeholder="Search audit entries…" value={query} onChange={(e) => setQuery(e.target.value)} onClear={() => setQuery("")} /></div>
        <Select value={action} onValueChange={setAction}>
          <SelectTrigger className="w-auto min-w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All actions</SelectItem>{ACTIONS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
        </Select>
        <span className="text-sm text-text-muted font-mono">{rows.length} entries</span>
        <IconButton aria-label="Refresh" variant="secondary" size="sm" onClick={() => audit.refetch()}><RefreshCw /></IconButton>
      </Card>

      {rows.length === 0 ? (
        <EmptyState icon={<ScrollText />} title="No audit entries yet" description="Create, edit, or delete any record and it appears here." />
      ) : (
        <Table>
          <THead><TR className="hover:bg-transparent"><TH>Timestamp</TH><TH>User</TH><TH>Table</TH><TH>Action</TH><TH>Detail</TH></TR></THead>
          <TBody>
            {rows.map((e) => (
              <TR key={e.id}>
                <TD className="font-mono text-xs whitespace-nowrap">{e.ts.replace("T", " ").slice(0, 16)}</TD>
                <TD>{e.user}</TD>
                <TD><Badge tone="neutral">{e.table}</Badge></TD>
                <TD><Badge tone={actionTone[e.action] ?? "neutral"}>{e.action}</Badge></TD>
                <TD className="text-text-secondary">{e.detail}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}

export const Route = createFileRoute("/lab/audit")({ component: Audit });
