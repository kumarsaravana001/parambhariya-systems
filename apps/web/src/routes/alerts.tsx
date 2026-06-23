import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  PageHeader, EmptyState, FilterChip, AlertRow,
} from "@parambhariya/ui";
import { BellOff } from "lucide-react";
import { alerts as seed, zones, rooms } from "../data/mock";

type Filter = "all" | "critical" | "warn" | "acked";

function AlertsScreen() {
  const [items, setItems] = React.useState(seed);
  const [filter, setFilter] = React.useState<Filter>("all");
  const navigate = useNavigate();

  const visible = items.filter((a) => {
    if (filter === "all") return !a.acknowledged;
    if (filter === "acked") return a.acknowledged;
    return !a.acknowledged && a.severity === filter;
  });

  const counts = {
    all:      items.filter((a) => !a.acknowledged).length,
    critical: items.filter((a) => !a.acknowledged && a.severity === "critical").length,
    warn:     items.filter((a) => !a.acknowledged && a.severity === "warn").length,
    acked:    items.filter((a) => a.acknowledged).length,
  };

  const ack = (id: string) =>
    setItems((xs) => xs.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));

  return (
    <div>
      <PageHeader
        title="Alerts"
        description={counts.all === 0 ? "All clear" : `${counts.all} open · ${counts.critical} critical`}
      />

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <FilterChip active={filter === "all"}      onClick={() => setFilter("all")}      count={counts.all}>Open</FilterChip>
        <FilterChip active={filter === "critical"} onClick={() => setFilter("critical")} count={counts.critical}>Critical</FilterChip>
        <FilterChip active={filter === "warn"}     onClick={() => setFilter("warn")}     count={counts.warn}>Warn</FilterChip>
        <FilterChip active={filter === "acked"}    onClick={() => setFilter("acked")}    count={counts.acked}>Acked</FilterChip>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<BellOff />}
          title={filter === "all" ? "No active alerts" : "Nothing here"}
          description={filter === "all"
            ? "Sensors are reading inside thresholds. We'll surface anything that drifts."
            : "Try a different filter to see other alerts."}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((a) => {
            const zone = zones.find((z) => z.id === a.zoneId);
            const room = rooms.find((r) => r.id === zone?.roomId);
            return (
              <AlertRow
                key={a.id}
                metric={a.metric}
                severity={a.severity}
                source={`${room?.name ?? ""} · ${zone?.name ?? a.zoneId}`}
                value={a.value}
                threshold={a.threshold}
                agoLabel={`${a.agoMin} min ago`}
                acknowledged={a.acknowledged}
                onView={() => navigate({ to: "/zone/$zoneId", params: { zoneId: a.zoneId } })}
                onAcknowledge={() => ack(a.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/alerts")({ component: AlertsScreen });
