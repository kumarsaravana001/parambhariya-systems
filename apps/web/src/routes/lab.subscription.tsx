import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Card, CardTitle, Button, Badge, Progress, Alert, Tag, FilterChip,
  FormField, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, EmptyState,
} from "@parambhariya/ui";
import { Zap, Check, Receipt } from "lucide-react";
import { plans } from "../data/lab";

const INR = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const STATES = ["Tamil Nadu", "Kerala", "Karnataka", "Maharashtra", "Delhi"];

function Subscription() {
  const [annual, setAnnual] = React.useState(false);
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Subscription &amp; Billing</h2>
        <p className="text-sm text-text-muted">Manage your plan, billing info, and download tax invoices.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card padding="lg">
          <div className="text-xs font-semibold uppercase tracking-[0.06em] text-text-muted mb-2">Current plan</div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-bold text-text-primary">Trial</span>
            <Badge tone="success">active</Badge>
          </div>
          <p className="text-sm text-text-muted mb-4">Trial ends 2 Jul 2026 · 15 days left</p>
          <Button size="sm" variant="danger" className="bg-warn-fg hover:opacity-90"><Zap className="h-4 w-4" /> Upgrade to unlock full features</Button>
        </Card>
        <Card padding="lg">
          <CardTitle className="mb-3">Storage Usage</CardTitle>
          <Progress value={12} className="mb-2" />
          <div className="flex items-center justify-between text-xs text-text-muted font-mono">
            <span>0.12 GB / 1 GB</span><span>12% used</span>
          </div>
        </Card>
      </div>

      {/* pricing */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <CardTitle>Plans</CardTitle>
          <div className="flex items-center gap-2">
            <FilterChip active={!annual} onClick={() => setAnnual(false)}>Monthly</FilterChip>
            <FilterChip active={annual} onClick={() => setAnnual(true)}>Annual <Tag tone="success" size="sm">SAVE</Tag></FilterChip>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {plans.map((p) => (
            <div key={p.id} className={`rounded-lg border p-4 flex flex-col gap-3 ${p.popular ? "border-brand-500 ring-1 ring-brand-500" : "border-border-default"}`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-text-primary">{p.name}</span>
                  {p.popular && <Tag tone="brand" size="sm">POPULAR</Tag>}
                </div>
                {p.enterprise ? (
                  <div className="text-lg font-bold text-text-primary mt-1">Custom</div>
                ) : (
                  <div className="mt-1">
                    <span className="text-lg font-bold text-text-primary font-mono">{INR(annual ? Math.round(p.priceMonthly * 10) : p.priceMonthly)}</span>
                    <span className="text-xs text-text-muted">/{annual ? "yr" : "mo"}</span>
                  </div>
                )}
              </div>
              <ul className="text-xs text-text-secondary flex flex-col gap-1.5 flex-1">
                <li className="font-mono text-text-muted">{p.cultures} cultures · {p.users} user{p.users === 1 ? "" : "s"} · {p.storage}</li>
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5"><Check className="h-3.5 w-3.5 text-brand-600 mt-0.5 shrink-0" />{f}</li>
                ))}
              </ul>
              <Button size="sm" variant={p.popular ? "primary" : "secondary"} className="w-full">
                {p.enterprise ? "Contact us" : "Choose"}
              </Button>
            </div>
          ))}
        </div>
        <p className="text-xs text-text-muted mt-4">GST-inclusive pricing: all prices include 18% GST (HSN 997331). A tax invoice is emailed after each payment. Issued by Agripie Agrosystem LLP · GSTIN 10ABTFA6794R1ZI.</p>
      </Card>

      {/* billing info */}
      <Card padding="lg">
        <CardTitle className="mb-3">Billing Information</CardTitle>
        <Alert tone="warn" className="mb-4">Please save your billing information before subscribing. This is required to generate tax invoices.</Alert>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Legal / Company Name" htmlFor="b-name" required><Input id="b-name" defaultValue="Agripie Agrosystem LLP" /></FormField>
          <FormField label="Billing Email" htmlFor="b-email" required><Input id="b-email" type="email" placeholder="billing@agripie.com" /></FormField>
          <FormField label="Country" htmlFor="b-country" required>
            <Select defaultValue="IN"><SelectTrigger id="b-country"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="IN">India</SelectItem></SelectContent></Select>
          </FormField>
          <FormField label="State" htmlFor="b-state" required>
            <Select defaultValue="Tamil Nadu"><SelectTrigger id="b-state"><SelectValue /></SelectTrigger><SelectContent>{STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
          </FormField>
          <FormField label="Address Line 1" htmlFor="b-a1" required><Input id="b-a1" /></FormField>
          <FormField label="Address Line 2" htmlFor="b-a2"><Input id="b-a2" /></FormField>
          <FormField label="City" htmlFor="b-city" required><Input id="b-city" defaultValue="Coimbatore" /></FormField>
          <FormField label="PIN Code" htmlFor="b-pin" required><Input id="b-pin" /></FormField>
          <FormField label="GSTIN" htmlFor="b-gst"><Input id="b-gst" defaultValue="10ABTFA6794R1ZI" /></FormField>
          <FormField label="PAN" htmlFor="b-pan"><Input id="b-pan" /></FormField>
        </div>
        <p className="text-xs text-text-muted mt-3">Prices are GST-inclusive (18%). A detailed CGST/SGST or IGST breakdown appears on your invoice.</p>
        <div className="mt-4"><Button size="sm">Save billing information</Button></div>
      </Card>

      <Card padding="lg">
        <CardTitle className="mb-3">Billing History</CardTitle>
        <EmptyState icon={<Receipt />} title="No invoices yet" description="Tax invoices will appear here after your first payment." />
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/lab/subscription")({ component: Subscription });
