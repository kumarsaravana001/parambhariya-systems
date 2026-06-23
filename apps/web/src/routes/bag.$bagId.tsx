import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import {
  PageHeader, Breadcrumb, Card, CardTitle, DataList, LifeBadge, LifecycleStepper, Timeline, Button, Progress,
} from "@parambhariya/ui";
import { Pencil, Trash2 } from "lucide-react";
import { bags, zones, strains, farms, rooms, bagTimeline } from "../data/mock";
import { fmtRange } from "../lib/format";

function BagDetail() {
  const { bagId } = Route.useParams();
  const bag = bags.find((b) => b.id === bagId);
  if (!bag) throw notFound();
  const zone   = zones.find((z) => z.id === bag.zoneId);
  const room   = rooms.find((r) => r.id === zone?.roomId);
  const farm   = farms.find((f) => f.id === room?.farmId);
  const strain = strains.find((s) => s.id === bag.strainId);

  return (
    <div>
      <Breadcrumb
        className="mb-2"
        items={[
          { label: "Farms", href: "/farms" },
          { label: farm?.name ?? "Farm", href: `/farms/${room?.farmId}` },
          { label: room?.name ?? "Room", href: `/room/${room?.id}` },
          { label: zone?.name ?? "Zone", href: `/zone/${zone?.id}` },
          { label: bag.code },
        ]}
      />
      <PageHeader
        title={bag.code}
        description={`${strain?.name} · ${zone?.name}`}
        actions={
          <>
            <LifeBadge stage={bag.status} progress={bag.stageProgress} />
            <Button variant="secondary" size="sm"><Pencil className="h-4 w-4" /> Edit</Button>
            <Button variant="ghost" size="sm" className="text-danger-fg"><Trash2 className="h-4 w-4" /> Discard</Button>
          </>
        }
      />

      <Card padding="lg" className="mb-6">
        <CardTitle className="mb-4">Lifecycle</CardTitle>
        <LifecycleStepper current={bag.status} intraProgress={bag.stageProgress} />
        {bag.status !== "CONTAMINATED" && bag.status !== "DISPOSED" && (
          <div className="mt-6 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span className="uppercase tracking-[0.06em] font-semibold">{bag.status} progress</span>
              <span className="font-mono">{Math.round(bag.stageProgress * 100)} %</span>
            </div>
            <Progress value={bag.stageProgress * 100} stage={bag.status} />
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card padding="lg">
          <CardTitle className="mb-4">Details</CardTitle>
          <DataList
            layout="inline"
            items={[
              { label: "Strain",     value: strain?.name ?? "—" },
              { label: "Scientific", value: strain?.scientific ?? "—" },
              { label: "Zone",       value: <Link to="/zone/$zoneId" params={{ zoneId: zone?.id ?? "" }} className="text-brand-700 hover:underline">{zone?.name}</Link> },
              { label: "Room",       value: <Link to="/room/$roomId" params={{ roomId: room?.id ?? "" }} className="text-brand-700 hover:underline">{room?.name}</Link> },
              { label: "Farm",       value: farm?.name ?? "—" },
              { label: "Created",    value: bag.createdISO, mono: true },
              { label: "Age",        value: `${bag.ageDays} days`, mono: true },
              { label: "Weight",     value: bag.weightG ? `${bag.weightG} g` : "—", mono: true },
              { label: "Cycle est.", value: strain ? `${strain.cycleDays} days` : "—", mono: true },
              { label: "Optimal T",  value: strain ? fmtRange(strain.optimalTempC, "°C") : "—", mono: true },
              { label: "Optimal RH", value: strain ? fmtRange(strain.optimalRhPct, "%")  : "—", mono: true },
            ]}
          />
        </Card>

        <Card padding="lg">
          <CardTitle className="mb-4">History</CardTitle>
          <Timeline events={bagTimeline(bag.id)} />
        </Card>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/bag/$bagId")({ component: BagDetail });
