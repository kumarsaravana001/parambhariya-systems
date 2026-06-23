import * as React from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  PageHeader, Breadcrumb, ZoneCard, BagCard, EmptyState, MetricCard,
  Tabs, TabsList, TabsTrigger, TabsContent, Button, DetailSkeleton, ErrorState,
} from "@parambhariya/ui";
import { LayoutGrid, Package, Plus, Thermometer, Droplets } from "lucide-react";
import type { Zone } from "@parambhariya/types";
import { useRoom, useFarm, useZones, useBags, useStrains, useCreate, useLiveReadings } from "../lib/queries";
import { EntityForm } from "../lib/EntityForm";

function RoomDetail() {
  const { roomId } = Route.useParams();
  useLiveReadings();
  const room = useRoom(roomId);
  const farm = useFarm(room.data?.farmId);
  const zones = useZones();
  const bags = useBags();
  const strains = useStrains();
  const createZone = useCreate<Zone>("zones");
  const [zoneOpen, setZoneOpen] = React.useState(false);

  if (room.isLoading) return <DetailSkeleton />;
  if (room.error) return <ErrorState title="Failed to load room" onRetry={() => room.refetch()} />;
  if (!room.data) throw notFound();

  const r = room.data;
  const zs = (zones.data ?? []).filter((z) => z.roomId === r.id);
  const roomBags = (bags.data ?? []).filter((b) => zs.some((z) => z.id === b.zoneId));
  const withT = zs.filter((z) => z.tempC != null);
  const avgT = withT.length ? withT.reduce((s, z) => s + (z.tempC ?? 0), 0) / withT.length : undefined;
  const avgR = withT.length ? withT.reduce((s, z) => s + (z.rhPct ?? 0), 0) / withT.length : undefined;

  return (
    <div>
      <Breadcrumb className="mb-2" items={[
        { label: "Farms", href: "/farms" },
        { label: farm.data?.name ?? "Farm", href: `/farms/${r.farmId}` },
        { label: r.name },
      ]} />
      <PageHeader title={r.name} description={r.purpose}
        actions={<Button variant="secondary" size="sm" onClick={() => setZoneOpen(true)}><Plus className="h-4 w-4" /> Add zone</Button>} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Zones" value={zs.length} icon={<LayoutGrid />} />
        <MetricCard label="Bags" value={roomBags.length} icon={<Package />} />
        <MetricCard label="Avg temp" value={avgT !== undefined ? avgT.toFixed(1) : "—"} unit="°C" icon={<Thermometer />} />
        <MetricCard label="Avg RH" value={avgR !== undefined ? avgR.toFixed(1) : "—"} unit="%" icon={<Droplets />} />
      </div>

      <Tabs defaultValue="zones">
        <TabsList>
          <TabsTrigger value="zones">Zones · {zs.length}</TabsTrigger>
          <TabsTrigger value="bags">Bags · {roomBags.length}</TabsTrigger>
        </TabsList>
        <TabsContent value="zones">
          {zs.length === 0 ? (
            <EmptyState icon={<LayoutGrid />} title="No zones in this room" description="Add a zone to start receiving sensor data."
              action={<Button size="sm" onClick={() => setZoneOpen(true)}><Plus className="h-4 w-4" /> Add zone</Button>} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {zs.map((z) => (
                <Link key={z.id} to="/zone/$zoneId" params={{ zoneId: z.id }}>
                  <ZoneCard name={z.name} bags={(bags.data ?? []).filter((b) => b.zoneId === z.id).length}
                    reading={{ tempC: z.tempC ?? undefined, rhPct: z.rhPct ?? undefined, co2Ppm: z.co2Ppm ?? undefined, lightLux: z.lightLux ?? undefined }}
                    status={z.status} />
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="bags">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {roomBags.map((b) => {
              const z = zs.find((z) => z.id === b.zoneId);
              const strain = (strains.data ?? []).find((s) => s.id === b.strainId);
              return (
                <Link key={b.id} to="/bag/$bagId" params={{ bagId: b.id }}>
                  <BagCard code={b.code} strain={strain?.name} zoneName={z?.name} stage={b.status} progress={b.stageProgress} weightG={b.weightG ?? undefined} />
                </Link>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      <EntityForm
        open={zoneOpen} onOpenChange={setZoneOpen} title="Add zone" submitLabel="Add zone" busy={createZone.isPending}
        fields={[
          { name: "name", label: "Zone name", required: true, placeholder: "Fruiting Chamber 1", span: 2 },
          { name: "setpointTempC", label: "Temp setpoint (°C)", type: "number", step: 0.5, min: 0, max: 45 },
          { name: "setpointRhPct", label: "Humidity setpoint (%)", type: "number", step: 1, min: 0, max: 100 },
          { name: "setpointCo2Ppm", label: "CO₂ setpoint (ppm)", type: "number", step: 50, min: 0, max: 5000 },
        ]}
        initial={{ roomId: r.id, setpointTempC: 24, setpointRhPct: 88, setpointCo2Ppm: 1000 }}
        onSubmit={async (v) => { await createZone.mutateAsync({ ...v, roomId: r.id }); setZoneOpen(false); }}
      />
    </div>
  );
}

export const Route = createFileRoute("/room/$roomId")({ component: RoomDetail });
