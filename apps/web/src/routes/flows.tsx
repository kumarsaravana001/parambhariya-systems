import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, KanbanColumn, BagCard, LifeBadge, LIFECYCLE_ORDER, ListSkeleton, ErrorState } from "@parambhariya/ui";
import { useBags, useStrains, useZones } from "../lib/queries";
import { SectionHelp } from "../lib/SectionHelp";

function FlowsScreen() {
  const bags = useBags();
  const strains = useStrains();
  const zones = useZones();

  if (bags.isLoading) return <><PageHeader title="Flows" /><ListSkeleton rows={3} /></>;
  if (bags.error) return <ErrorState title="Failed to load pipeline" onRetry={() => bags.refetch()} />;
  const list = bags.data ?? [];

  return (
    <div>
      <PageHeader title="Flows" description="Bag pipeline by lifecycle stage." />
      <SectionHelp id="flows" items={[
        { label: "What this is", body: "Every fruiting bag laid out by lifecycle stage — Created → Colonizing → Pinning → Fruiting → Harvested." },
        { label: "How to use", body: "Scan the columns to see where your crop is bunched up. Click any bag to update its stage, weight, or flush count." },
      ]} />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {LIFECYCLE_ORDER.map((stage) => {
          const items = list.filter((b) => b.status === stage);
          return (
            <KanbanColumn key={stage} header={<LifeBadge stage={stage} size="sm" />} count={items.length}
              empty={<span className="text-xs text-text-muted italic">No bags here</span>}>
              {items.map((b) => {
                const strain = (strains.data ?? []).find((s) => s.id === b.strainId);
                const z = (zones.data ?? []).find((z) => z.id === b.zoneId);
                return (
                  <Link key={b.id} to="/bag/$bagId" params={{ bagId: b.id }}>
                    <BagCard code={b.code} strain={strain?.name} zoneName={z?.name} stage={b.status} progress={b.stageProgress} weightG={b.weightG ?? undefined} />
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
