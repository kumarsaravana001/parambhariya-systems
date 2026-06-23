import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StrainCard, Button } from "@parambhariya/ui";
import { Plus } from "lucide-react";
import { strains } from "../data/mock";

function StrainsScreen() {
  return (
    <div>
      <PageHeader
        title="Strain Catalog"
        description="Optimal ranges and cycle durations for every strain you grow."
        actions={<Button variant="primary" size="sm"><Plus className="h-4 w-4" /> Add strain</Button>}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {strains.map((s) => (
          <StrainCard
            key={s.id}
            name={s.name}
            scientific={s.scientific}
            optimalTempC={s.optimalTempC}
            optimalRhPct={s.optimalRhPct}
            cycleDays={s.cycleDays}
            yieldKg={s.yieldKg}
          />
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/strains")({ component: StrainsScreen });
