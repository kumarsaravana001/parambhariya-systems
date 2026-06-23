import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, FarmCard, EmptyState, Button } from "@parambhariya/ui";
import { Sprout, Plus } from "lucide-react";
import { farms, farmRooms, farmBags, farmAlertCount } from "../data/mock";

function FarmsScreen() {
  if (farms.length === 0) {
    return (
      <EmptyState
        icon={<Sprout />}
        title="No farms yet"
        description="Create your first farm to start monitoring your mushroom production."
        action={<Button variant="primary"><Plus className="h-4 w-4" /> Create Your First Farm</Button>}
      />
    );
  }
  return (
    <div>
      <PageHeader
        title="Your Farms"
        actions={<Button variant="primary" size="sm"><Plus className="h-4 w-4" /> Create farm</Button>}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {farms.map((f) => (
          <Link key={f.id} to="/farms/$farmId" params={{ farmId: f.id }}>
            <FarmCard
              name={f.name}
              location={f.location}
              rooms={farmRooms(f.id).length}
              bags={farmBags(f.id).length}
              alerts={farmAlertCount(f.id)}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/farms/")({ component: FarmsScreen });
