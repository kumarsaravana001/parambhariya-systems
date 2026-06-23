import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, KanbanColumn, BagCard, LifeBadge, LIFECYCLE_ORDER } from "@parambhariya/ui";
import { bags, strains, zones } from "../data/mock";

function FlowsScreen() {
  return (
    <div>
      <PageHeader title="Flows" description="Bag pipeline by lifecycle stage." />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {LIFECYCLE_ORDER.map((stage) => {
          const items = bags.filter((b) => b.status === stage);
          return (
            <KanbanColumn
              key={stage}
              header={<LifeBadge stage={stage} size="sm" />}
              count={items.length}
              empty={<span className="text-xs text-text-muted italic">No bags here</span>}
            >
              {items.map((b) => {
                const strain = strains.find((s) => s.id === b.strainId);
                const z = zones.find((zz) => zz.id === b.zoneId);
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
            </KanbanColumn>
          );
        })}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/flows")({ component: FlowsScreen });
