import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  PageHeader, Breadcrumb, ZoneCard, BagCard, EmptyState, MetricCard,
  Tabs, TabsList, TabsTrigger, TabsContent, Button,
} from "@parambhariya/ui";
import { LayoutGrid, Package, Plus, Thermometer, Droplets } from "lucide-react";
import { rooms, farms, roomZones, bags, strains } from "../data/mock";

function RoomDetail() {
  const { roomId } = Route.useParams();
  const room = rooms.find((r) => r.id === roomId);
  if (!room) throw notFound();
  const farm = farms.find((f) => f.id === room.farmId);
  const zs = roomZones(room.id);
  const roomBags = bags.filter((b) => zs.some((z) => z.id === b.zoneId));

  const avgT = zs.length ? zs.reduce((s, z) => s + z.tempC, 0) / zs.length : undefined;
  const avgR = zs.length ? zs.reduce((s, z) => s + z.rhPct, 0) / zs.length : undefined;

  return (
    <div>
      <Breadcrumb
        className="mb-2"
        items={[
          { label: "Farms", href: "/farms" },
          { label: farm?.name ?? "Farm", href: `/farms/${room.farmId}` },
          { label: room.name },
        ]}
      />
      <PageHeader
        title={room.name}
        description={room.purpose}
        actions={<Button variant="secondary" size="sm"><Plus className="h-4 w-4" /> Add zone</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Zones"    value={zs.length} icon={<LayoutGrid />} />
        <MetricCard label="Bags"     value={roomBags.length} icon={<Package />} />
        <MetricCard label="Avg temp" value={avgT !== undefined ? avgT.toFixed(1) : "—"} unit="°C" icon={<Thermometer />} />
        <MetricCard label="Avg RH"   value={avgR !== undefined ? avgR.toFixed(1) : "—"} unit="%"  icon={<Droplets />} />
      </div>

      <Tabs defaultValue="zones">
        <TabsList>
          <TabsTrigger value="zones">Zones · {zs.length}</TabsTrigger>
          <TabsTrigger value="bags">Bags · {roomBags.length}</TabsTrigger>
        </TabsList>

        <TabsContent value="zones">
          {zs.length === 0 ? (
            <EmptyState icon={<LayoutGrid />} title="No zones in this room" description="Add a zone to start receiving sensor data." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {zs.map((z) => (
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
          )}
        </TabsContent>

        <TabsContent value="bags">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {roomBags.map((b) => {
              const z = zs.find((z) => z.id === b.zoneId);
              const strain = strains.find((s) => s.id === b.strainId);
              return (
                <Link key={b.id} to="/bag/$bagId" params={{ bagId: b.id }}>
                  <BagCard
                    code={b.code}
                    strain={strain?.name}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const Route = createFileRoute("/room/$roomId")({ component: RoomDetail });
