import * as React from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  PageHeader, Breadcrumb, RoomCard, BagCard, MetricCard, Button, EmptyState,
  Tabs, TabsList, TabsTrigger, TabsContent, DetailSkeleton, ErrorState,
  Card, CardTitle, DataList, Progress,
} from "@parambhariya/ui";
import { Plus, MapPin, Package, DoorOpen, Boxes } from "lucide-react";
import type { Room, Zone, Bag, Strain } from "@parambhariya/types";
import { useFarm, useRooms, useZones, useBags, useStrains, useCreate } from "../lib/queries";
import { EntityForm } from "../lib/EntityForm";

function FarmDetail() {
  const { farmId } = Route.useParams();
  const farm = useFarm(farmId);
  const rooms = useRooms();
  const zones = useZones();
  const bags = useBags();
  const strains = useStrains();
  const createRoom = useCreate<Room>("rooms");
  const createBag = useCreate<Bag>("bags");

  const [roomOpen, setRoomOpen] = React.useState(false);
  const [bagOpen, setBagOpen] = React.useState(false);

  if (farm.isLoading || rooms.isLoading || zones.isLoading || bags.isLoading) return <DetailSkeleton />;
  if (farm.error) return <ErrorState title="Failed to load farm" onRetry={() => farm.refetch()} />;
  if (rooms.error || zones.error || bags.error) return <ErrorState title="Failed to load farm data" onRetry={() => { rooms.refetch(); zones.refetch(); bags.refetch(); }} />;
  if (!farm.data) throw notFound();

  const f = farm.data;
  const farmRooms = (rooms.data ?? []).filter((r) => r.farmId === f.id);
  const farmZones = (zones.data ?? []).filter((z) => farmRooms.some((r) => r.id === z.roomId));
  const farmBags = (bags.data ?? []).filter((b) => farmZones.some((z) => z.id === b.zoneId));
  const activeBags = farmBags.filter((b) => !["HARVESTED", "CONTAMINATED", "DISPOSED"].includes(b.status)).length;
  const occupancy = activeBags; // bags currently occupying capacity

  const zonesOfRoom = (rid: string) => farmZones.filter((z) => z.roomId === rid);
  const roomAvg = (rid: string) => {
    const zs = zonesOfRoom(rid);
    if (!zs.length) return { tempC: undefined, rhPct: undefined, status: "OK" as const };
    const withReadings = zs.filter((z) => z.tempC != null);
    const t = withReadings.length ? withReadings.reduce((s, z) => s + (z.tempC ?? 0), 0) / withReadings.length : undefined;
    const h = withReadings.length ? withReadings.reduce((s, z) => s + (z.rhPct ?? 0), 0) / withReadings.length : undefined;
    const status = zs.some((z) => z.status === "ALARM") ? "ALARM" : zs.some((z) => z.status === "WARN") ? "WARN" : "OK";
    return { tempC: t, rhPct: h, status: status as "OK" | "WARN" | "ALARM" };
  };

  return (
    <div>
      <Breadcrumb className="mb-2" items={[{ label: "Farms", href: "/farms" }, { label: f.name }]} />
      <PageHeader
        title={f.name}
        description={f.location}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setRoomOpen(true)}><Plus className="h-4 w-4" /> Add room</Button>
            <Button variant="primary" size="sm" onClick={() => setBagOpen(true)} disabled={farmZones.length === 0}><Plus className="h-4 w-4" /> Add bag</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Rooms" value={farmRooms.length} icon={<DoorOpen />} />
        <MetricCard label="Active bags" value={activeBags} icon={<Package />} />
        <MetricCard label="Capacity used" value={f.bagCapacity ? `${Math.round((occupancy / f.bagCapacity) * 100)}` : "—"} unit={f.bagCapacity ? "%" : ""} icon={<Boxes />} tone={f.bagCapacity && occupancy / f.bagCapacity > 0.9 ? "warn" : "default"} hint={f.bagCapacity ? `${occupancy} / ${f.bagCapacity} bags` : "Set a capacity"} />
        <MetricCard label="Cultivation area" value={f.areaSqM ? String(f.areaSqM) : "—"} unit={f.areaSqM ? "m²" : ""} icon={<MapPin />} />
      </div>

      <Card padding="lg" className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <CardTitle>Farm details</CardTitle>
          {f.bagCapacity > 0 && <span className="text-xs text-text-muted font-mono">{occupancy} / {f.bagCapacity} bags</span>}
        </div>
        {f.bagCapacity > 0 && <Progress value={Math.min(100, (occupancy / f.bagCapacity) * 100)} className="mb-4" />}
        <DataList layout="inline" items={[
          { label: "Location", value: f.location || "—" },
          { label: "Manager", value: f.manager || "—" },
          { label: "Phone", value: f.phone || "—", mono: true },
          { label: "Established", value: f.establishedOn || "—", mono: true },
          { label: "Area", value: f.areaSqM ? `${f.areaSqM} m²` : "—", mono: true },
          { label: "Bag capacity", value: f.bagCapacity ? `${f.bagCapacity}` : "—", mono: true },
        ]} />
      </Card>

      <Tabs defaultValue="rooms">
        <TabsList>
          <TabsTrigger value="rooms">Rooms · {farmRooms.length}</TabsTrigger>
          <TabsTrigger value="bags">Bags · {farmBags.length}</TabsTrigger>
        </TabsList>

        <TabsContent value="rooms">
          {farmRooms.length === 0 ? (
            <EmptyState icon={<DoorOpen />} title="No rooms yet" description="Add a room to start grouping zones and sensors."
              action={<Button size="sm" onClick={() => setRoomOpen(true)}><Plus className="h-4 w-4" /> Add room</Button>} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {farmRooms.map((r) => {
                const avg = roomAvg(r.id);
                return (
                  <Link key={r.id} to="/room/$roomId" params={{ roomId: r.id }}>
                    <RoomCard name={r.name} purpose={r.purpose} zones={zonesOfRoom(r.id).length} tempC={avg.tempC} rhPct={avg.rhPct} status={avg.status} />
                  </Link>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bags">
          {farmBags.length === 0 ? (
            <EmptyState icon={<Package />} title="No bags yet" description="Bags appear here as soon as you inoculate." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {farmBags.map((b) => {
                const z = farmZones.find((z) => z.id === b.zoneId);
                const strain = (strains.data ?? []).find((s) => s.id === b.strainId);
                return (
                  <Link key={b.id} to="/bag/$bagId" params={{ bagId: b.id }}>
                    <BagCard code={b.code} strain={strain?.name} zoneName={z?.name} stage={b.status} progress={b.stageProgress} weightG={b.weightG ?? undefined} />
                  </Link>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <EntityForm
        open={roomOpen} onOpenChange={setRoomOpen} title="Add room" submitLabel="Add room" busy={createRoom.isPending}
        fields={[
          { name: "name", label: "Room name", required: true, placeholder: "Room A-1" },
          { name: "purpose", label: "Purpose", type: "select", required: true, options: ["Colonization", "Pinning", "Fruiting", "Storage"].map((v) => ({ value: v, label: v })) },
          { name: "sizeSqM", label: "Room size (m²)", type: "number", step: 5 },
          { name: "bagCapacity", label: "Total bag capacity", type: "number", step: 50 },
          { name: "rackCount", label: "Number of racks", type: "number" },
          { name: "notes", label: "Notes", type: "textarea" },
        ]}
        initial={{ farmId: f.id }}
        onSubmit={async (v) => { await createRoom.mutateAsync({ ...v, farmId: f.id }); setRoomOpen(false); }}
      />

      <EntityForm
        open={bagOpen} onOpenChange={setBagOpen} title="Add bag" submitLabel="Add bag" busy={createBag.isPending}
        fields={[
          { name: "code", label: "Bag code", required: true, placeholder: "AN-0142" },
          { name: "strainId", label: "Strain", type: "select", required: true, options: (strains.data ?? []).map((s) => ({ value: s.id, label: s.name })) },
          { name: "zoneId", label: "Zone", type: "select", required: true, options: farmZones.map((z) => ({ value: z.id, label: z.name })) },
          { name: "status", label: "Stage", type: "select", required: true, options: ["CREATED", "COLONIZING", "PINNING", "FRUITING", "HARVESTED", "CONTAMINATED"].map((v) => ({ value: v, label: v })) },
          { name: "substrate", label: "Substrate", type: "select", options: ["Supplemented sawdust", "Hardwood sawdust", "Sawdust + bran", "Paddy straw", "Coir pith", "Wheat straw"].map((v) => ({ value: v, label: v })) },
          { name: "substrateWeightKg", label: "Substrate weight (kg)", type: "number", step: 0.1 },
          { name: "inoculatedOn", label: "Inoculated on", type: "date" },
          { name: "expectedHarvest", label: "Expected harvest", type: "date" },
          { name: "weightG", label: "Harvest weight (g)", type: "number" },
          { name: "flushCount", label: "Flushes harvested", type: "number" },
        ]}
        initial={{ status: "CREATED" }}
        onSubmit={async (v) => { await createBag.mutateAsync(v); setBagOpen(false); }}
      />
    </div>
  );
}

export const Route = createFileRoute("/farms/$farmId")({ component: FarmDetail });
