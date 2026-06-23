import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  PageHeader, Breadcrumb, BigReading, AlertBanner, BagCard, EmptyState, Card, CardTitle,
} from "@parambhariya/ui";
import { Thermometer, Droplets, Wind, Sun, Package } from "lucide-react";
import { zones, rooms, farms, bags, alerts, strains } from "../data/mock";
import { fmtAgo, bandTone } from "../lib/format";

function ZoneDetail() {
  const { zoneId } = Route.useParams();
  const z = zones.find((zz) => zz.id === zoneId);
  if (!z) throw notFound();
  const room = rooms.find((r) => r.id === z.roomId);
  const farm = farms.find((f) => f.id === room?.farmId);
  const zoneBags = bags.filter((b) => b.zoneId === z.id);
  const zoneAlerts = alerts.filter((a) => a.zoneId === z.id && !a.acknowledged);

  // Domain bands (illustrative — real values would come from strain optimum)
  const tempTone  = bandTone(z.tempC,  [22, 26]);
  const rhTone    = bandTone(z.rhPct,  [85, 95]);
  const co2Tone   = bandTone(z.co2Ppm, [600, 1200]);
  const lightTone = bandTone(z.lightLux, [50, 250]);

  return (
    <div>
      <Breadcrumb
        className="mb-2"
        items={[
          { label: "Farms", href: "/farms" },
          { label: farm?.name ?? "Farm", href: `/farms/${room?.farmId}` },
          { label: room?.name ?? "Room", href: `/room/${room?.id}` },
          { label: z.name },
        ]}
      />
      <PageHeader title={z.name} description={`${zoneBags.length} bags · ${room?.name}`} />

      {zoneAlerts.length > 0 && (
        <div className="flex flex-col gap-3 mb-6">
          {zoneAlerts.map((a) => (
            <AlertBanner
              key={a.id}
              tone={a.severity === "critical" ? "critical" : "warning"}
              title={`${a.metric.toUpperCase()} out of range`}
            >
              Current <span className="font-mono">{a.value}</span> · Threshold{" "}
              <span className="font-mono">{a.threshold}</span> · {a.agoMin} min ago.
              Acknowledge to dismiss.
            </AlertBanner>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <BigReading label="Temperature" icon={<Thermometer />} value={z.tempC.toFixed(1)} unit="°C"
          range="22 – 26 °C" freshness={fmtAgo(z.ageSec)} tone={tempTone} trend={z.trendTemp} />
        <BigReading label="Humidity"    icon={<Droplets />}    value={z.rhPct.toFixed(1)} unit="%"
          range="85 – 95 %" freshness={fmtAgo(z.ageSec)} tone={rhTone} trend={z.trendRh} />
        <BigReading label="CO₂"         icon={<Wind />}        value={String(z.co2Ppm)} unit="ppm"
          range="600 – 1200 ppm" freshness={fmtAgo(z.ageSec)} tone={co2Tone} trend={z.trendCo2} />
        <BigReading label="Light"       icon={<Sun />}         value={String(z.lightLux)} unit="lx"
          range="50 – 250 lx" freshness={fmtAgo(z.ageSec)} tone={lightTone} trend={z.trendLight} />
      </div>

      <section>
        <h2 className="text-lg font-semibold text-text-primary mb-3">Bags in this zone</h2>
        {zoneBags.length === 0 ? (
          <EmptyState icon={<Package />} title="No bags in this zone" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {zoneBags.map((b) => {
              const strain = strains.find((s) => s.id === b.strainId);
              return (
                <Link key={b.id} to="/bag/$bagId" params={{ bagId: b.id }}>
                  <BagCard
                    code={b.code}
                    strain={strain?.name}
                    zoneName={z.name}
                    stage={b.status}
                    progress={b.stageProgress}
                    ageDays={b.ageDays}
                    weightG={b.weightG}
                  />
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export const Route = createFileRoute("/zone/$zoneId")({ component: ZoneDetail });
