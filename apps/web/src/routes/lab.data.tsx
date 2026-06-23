import { createFileRoute } from "@tanstack/react-router";
import {
  Card, CardTitle, FileInput, Alert, Table, THead, TBody, TR, TH, TD, Badge,
} from "@parambhariya/ui";
import { FileSpreadsheet, FileText, Database, Download } from "lucide-react";

const EXPORTS = [
  { icon: <FileSpreadsheet />, tone: "text-success-fg", title: "Excel Workbook", desc: "5 sheets: Cultures, Transfers, Storage, Categories, Locations." },
  { icon: <FileText />, tone: "text-danger-fg", title: "Culture Report", desc: "Printable PDF with all culture details and storage summary." },
  { icon: <Database />, tone: "text-info-fg", title: "Full Backup", desc: "Complete JSON snapshot of all lab data — use for restore." },
];

const FORMAT = [
  { col: "Culture ID", req: true, notes: "Unique identifier, e.g. MC-001" },
  { col: "Name", req: true, notes: "Display name of the culture" },
  { col: "Genus", req: true, notes: "Genus name (capitalised)" },
  { col: "Species", req: true, notes: "Species name (lower case)" },
  { col: "Status", req: true, notes: "active · inactive · archived · quarantine · extinct" },
  { col: "Kingdom", req: false, notes: "Archaebacteria · Eubacteria · Protista · Fungi · Plantae · Animalia" },
  { col: "Common Name", req: false, notes: "Informal name" },
  { col: "Strain Code", req: false, notes: "Internal strain code" },
  { col: "Contaminated", req: false, notes: "Yes or No" },
  { col: "Notes", req: false, notes: "Free text" },
];

function DataBackup() {
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-text-primary">Data &amp; Backup</h2>
        <p className="text-sm text-text-muted">Export and import lab data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
        {EXPORTS.map((e) => (
          <Card key={e.title} padding="lg" className="flex flex-col gap-2">
            <span className={`${e.tone} [&_svg]:h-7 [&_svg]:w-7`} aria-hidden>{e.icon}</span>
            <CardTitle className="text-base">{e.title}</CardTitle>
            <p className="text-sm text-text-muted flex-1">{e.desc}</p>
            <button className="inline-flex items-center gap-1 text-sm text-brand-700 hover:underline self-start mt-1">
              <Download className="h-4 w-4" /> Download
            </button>
          </Card>
        ))}
      </div>
      <p className="text-xs text-text-muted mb-8">Exports include only active (non-deleted) data for your lab.</p>

      <Card padding="lg" className="mb-8">
        <CardTitle className="mb-3">Import</CardTitle>
        <FileInput accept=".xlsx,.json" label="Drop your file here, or click to browse" hint="Supported formats: .xlsx and .json" onFiles={() => {}} />
      </Card>

      <Card padding="lg">
        <CardTitle className="mb-1">Format Guide — Cultures Sheet</CardTitle>
        <p className="text-sm text-text-muted mb-4">Required columns marked <span className="text-danger-fg">*</span>. Rows missing required fields are skipped. Existing cultures (by Culture ID) are skipped — no overwrite.</p>
        <Table>
          <THead><TR className="hover:bg-transparent"><TH>Column</TH><TH>Required</TH><TH>Notes</TH></TR></THead>
          <TBody>
            {FORMAT.map((f) => (
              <TR key={f.col}>
                <TD className="font-mono">{f.col}</TD>
                <TD>{f.req ? <Badge tone="danger">Required</Badge> : <span className="text-text-muted text-xs">Optional</span>}</TD>
                <TD className="text-text-secondary">{f.notes}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/lab/data")({ component: DataBackup });
