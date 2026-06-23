import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  PageHeader, Breadcrumb, RoomCard, BagCard, MetricCard, Button, EmptyState,
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@parambhariya/ui";
import { Plus, MapPin, Package, DoorOpen, TriangleAlert } from "lucide-react";
import { farms, rooms, roomZones, roomAvg, farmBags, farmAlertCount, zones, strains } from "../data/mock";

function FarmDetail() {
  const { farmId } = Route.useParams();
  const farm = farms.find((f) => f.id === farmId);
  if (!farm) throw notFound();
  const farmRooms = rooms.filter((r) => r.farmId === farm.id);
  const allBags = farmBags(farm.id);

  return (
    <div>
      <Breadcrumb
        className="mb-2"
        items={[
          { label: "Farms", href: "/farms" },
          { label: farm.name },
        ]}
      />
      <PageHeader
        title={farm.name}
        description={farm.location}
        actions={
          <>
            <Button variant="secondary" size="sm"><Plus className="h-4 w-4" /> Add room</Button>
            <Button variant="primary" size="sm"><Plus className="h-4 w-4" /> Add bag</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Rooms"        value={farmRooms.length}    icon={<DoorOpen />} />
        <MetricCard label="Active bags"  value={allBags.filter(b => b.status !== "HARVESTED" && b.status !== "CONTAMINATED").length} icon={<Package />} />
        <MetricCard label="Open alerts"  value={farmAlertCount(farm.id)} icon={<TriangleAlert />}
                    tone={farmAlertCount(farm.id) > 0 ? "warn" : "default"} />
        <MetricCard label="Location"     value={farm.location.split(",")[0] ?? farm.location} icon={<MapPin />} />
      </div>

      <Tabs defaultValue="rooms">
        <TabsList>
          <TabsTrigger value="rooms">Rooms · {farmRooms.length}</TabsTrigger>
          <TabsTrigger value="bags">Bags · {allBags.length}</TabsTrigger>
        </TabsList>

        <TabsContent value="rooms">
          {farmRooms.length === 0 ? (
            <EmptyState icon={<DoorOpen />} title="No rooms yet" description="Add a room to start grouping zones and sensors." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {farmRooms.map((r) => {
                const avg = roomAvg(r.id);
                return (
                  <Link key={r.id} to="/room/$roomId" params={{ roomId: r.id }}>
                    <RoomCard
                      name={r.name}
                      purpose={r.purpose}
                      zones={roomZones(r.id).length}
                      tempC={avg.tempC}
                      rhPct={avg.rhPct}
                      status={avg.status}
                    />
                  </Link>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bags">
          {allBags.length === 0 ? (
            <EmptyState icon={<Package />} title="No bags yet" description="Bags will appear here as soon as you inoculate." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allBags.map((b) => {
                const z = zones.find((z) => z.id === b.zoneId);
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
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const Route = createFileRoute("/farms/$farmId")({ component: FarmDetail });
