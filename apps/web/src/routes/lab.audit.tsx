import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Card, SearchInput, Badge, IconButton, Input,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  Table, THead, TBody, TR, TH, TD,
} from "@parambhariya/ui";
import { RefreshCw } from "lucide-react";
import { auditLog, auditActionTone } from "../data/lab";

const TABLES = ["Cultures", "Isolation", "Revival", "Transfers", "Storage"];
const ACTIONS = ["Created", "Updated", "Deleted"];

function Audit() {
  const [query, setQuery] = React.useState("");
  const [table, setTable] = React.useState("all");
  const [action, setAction] = React.useState("all");

  const rows = auditLog.filter((e) => {
    if (table !== "all" && e.table !== table) return false;
    if (action !== "all" && e.action !== action) return false;
    if (query && !`${e.user} ${e.detail} ${e.table}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <h2 className="text-lg font-semibold text-text-primary mb-4">Audit Trail</h2>

      <Card padding="md" className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[180px]"><SearchInput placeholder="Search audit entries…" value={query} onChange={(e) => setQuery(e.target.value)} onClear={() => setQuery("")} /></div>
        <Select value={table} onValueChange={setTable}>
          <SelectTrigger className="w-auto min-w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All tables</SelectItem>{TABLES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={action} onValueChange={setAction}>
          <SelectTrigger className="w-auto min-w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All actions</SelectItem>{ACTIONS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
        </Select>
        <Input type="date" className="w-auto" aria-label="From date" />
        <Input type="date" className="w-auto" aria-label="To date" />
        <span className="text-sm text-text-muted font-mono">{rows.length} entries</span>
        <IconButton aria-label="Refresh" variant="secondary" size="sm"><RefreshCw /></IconButton>
      </Card>

      <Table>
        <THead><TR className="hover:bg-transparent"><TH>Timestamp</TH><TH>User</TH><TH>Table</TH><TH>Action</TH><TH>Detail</TH></TR></THead>
        <TBody>
          {rows.map((e) => (
            <TR key={e.id}>
              <TD className="font-mono text-xs whitespace-nowrap">{e.ts}</TD>
              <TD>{e.user}</TD>
              <TD><Badge tone="neutral">{e.table}</Badge></TD>
              <TD><Badge tone={auditActionTone[e.action]}>{e.action}</Badge></TD>
              <TD className="text-text-secondary">{e.detail}</TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}

export const Route = createFileRoute("/lab/audit")({ component: Audit });
