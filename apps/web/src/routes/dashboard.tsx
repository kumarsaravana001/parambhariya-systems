import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  PageHeader, MetricCard, Card, CardTitle, Button, LifeBadge, BagCard, ZoneCard, Spark,
} from "@parambhariya/ui";
import { Thermometer, Sprout, ChevronRight, Plus, Package } from "lucide-react";
import { farms, zones, bags, alerts, farmAlertCount, rooms } from "../data/mock";

function Dashboard() {
  const activeBags = bags.filter((b) => b.status !== "HARVESTED" && b.status !== "CONTAMINATED" && b.status !== "DISPOSED").length;
  const harvested = bags.filter((b) => b.status === "HARVESTED").length;
  const contam = bags.filter((b) => b.status === "CONTAMINATED").length;
  const openAlerts = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div>
      <PageHeader
        title="Your Farms"
        eyebrow="Today"
        description={`${farms.length} farms · ${rooms.length} rooms · ${zones.length} zones · ${activeBags} active bags`}
        actions={<Button variant="primary" size="sm"><Plus className="h-4 w-4" /> New farm</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Active bags"   value={activeBags} hint="Across all zones" icon={<Package />} />
        <MetricCard label="Harvested"     value={harvested} unit="bags" tone="success" />
        <MetricCard label="Contamination" value={contam} unit="bags" tone={contam > 0 ? "danger" : "default"} />
        <MetricCard label="Open alerts"   value={openAlerts} tone={openAlerts > 0 ? "warn" : "default"}
                    hint={openAlerts ? "Needs acknowledgment" : "All clear"} />
      </div>

      <section className="mb-8">
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-lg font-semibold text-text-primary">Farms</h2>
          <Link to="/farms" className="text-sm text-brand-700 hover:underline">All farms</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {farms.map((f) => {
            const farmRoomCount = rooms.filter((r) => r.farmId === f.id).length;
            const farmBagCount  = bags.filter((b) => {
              const z = zones.find((z) => z.id === b.zoneId);
              const r = rooms.find((r) => r.id === z?.roomId);
              return r?.farmId === f.id;
            }).length;
            return (
              <Link key={f.id} to="/farms/$farmId" params={{ farmId: f.id }}>
                <Card interactive className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-md bg-brand-50 grid place-items-center text-brand-700 shrink-0" aria-hidden>
                    <Sprout />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="truncate">{f.name}</CardTitle>
                    <div className="text-xs text-text-muted mt-0.5">{f.location}</div>
                    <div className="mt-3 flex items-center gap-3 text-xs text-text-muted font-mono">
                      <span>{farmRoomCount} rooms</span>
                      <span aria-hidden>·</span>
                      <span>{farmBagCount} bags</span>
                      {farmAlertCount(f.id) > 0 && (
                        <>
                          <span aria-hidden>·</span>
                          <span className="text-danger-fg">{farmAlertCount(f.id)} alert{farmAlertCount(f.id) > 1 ? "s" : ""}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-text-muted self-center" aria-hidden />
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mb-8">
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-lg font-semibold text-text-primary">Zones at a glance</h2>
          <Link to="/farms" className="text-sm text-brand-700 hover:underline">View by farm</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {zones.slice(0, 6).map((z) => (
            <Link key={z.id} to="/zone/$zoneId" params={{ zoneId: z.id }}>
              <ZoneCard
                name={z.name}
                bags={bags.filter((b) => b.zoneId === z.id).length}
                reading={{ tempC: z.tempC, rhPct: z.rhPct, co2Ppm: z.co2Ppm, lightLux: z.lightLux }}
                status={z.status}
              />
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-lg font-semibold text-text-primary">Recent bags</h2>
          <Link to="/flows" className="text-sm text-brand-700 hover:underline">Open pipeline</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bags.slice(0, 6).map((b) => {
            const z = zones.find((z) => z.id === b.zoneId);
            return (
              <Link key={b.id} to="/bag/$bagId" params={{ bagId: b.id }}>
                <BagCard
                  code={b.code}
                  strain={b.strainId.replace("s-", "")}
                  zoneName={z?.name}
                  stage={b.status}
                  progress={b.stageProgress}
                  ageDays={b.ageDays}
                  weightG={b.weightG}
                />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export const Route = createFileRoute("/dashboard")({ component: Dashboard });
