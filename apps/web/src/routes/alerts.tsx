import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader, EmptyState, FilterChip, AlertRow, ListSkeleton, ErrorState } from "@parambhariya/ui";
import { BellOff } from "lucide-react";
import { useAlerts, useAckAlert, useZones, useRooms, useLiveReadings } from "../lib/queries";
import { SectionHelp } from "../lib/SectionHelp";

type Filter = "open" | "critical" | "warn" | "acked";

function AlertsScreen() {
  useLiveReadings();
  const all = useAlerts(false);
  const zones = useZones();
  const rooms = useRooms();
  const ack = useAckAlert();
  const navigate = useNavigate();
  const [filter, setFilter] = React.useState<Filter>("open");

  if (all.isLoading) return <><PageHeader title="Alerts" /><ListSkeleton rows={3} /></>;
  if (all.error) return <ErrorState title="Failed to load alerts" onRetry={() => all.refetch()} />;
  const items = all.data ?? [];

  const open = items.filter((a) => a.acknowledgedAt == null);
  const counts = {
    open: open.length,
    critical: open.filter((a) => a.severity === "critical").length,
    warn: open.filter((a) => a.severity === "warn").length,
    acked: items.filter((a) => a.acknowledgedAt != null).length,
  };
  const visible = items.filter((a) => {
    if (filter === "acked") return a.acknowledgedAt != null;
    if (filter === "open") return a.acknowledgedAt == null;
    return a.acknowledgedAt == null && a.severity === filter;
  });

  const zoneName = (zid: string) => {
    const z = (zones.data ?? []).find((z) => z.id === zid);
    const r = (rooms.data ?? []).find((r) => r.id === z?.roomId);
    return `${r?.name ?? ""} · ${z?.name ?? zid}`;
  };

  return (
    <div>
      <PageHeader title="Alerts" description={counts.open === 0 ? "All clear" : `${counts.open} open · ${counts.critical} critical`} />
      <SectionHelp id="alerts" items={[
        { label: "What this is", body: "Every time a zone drifts off its setpoint, the controller raises an alert here automatically — warn for small drift, critical for large." },
        { label: "Acknowledge", body: "Click Acknowledge to clear an alert you've handled. Alerts also auto-resolve once the controller pulls the zone back into spec." },
        { label: "Filter", body: "Use the chips to focus on critical-only or review acknowledged history." },
      ]} />
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <FilterChip active={filter === "open"} onClick={() => setFilter("open")} count={counts.open}>Open</FilterChip>
        <FilterChip active={filter === "critical"} onClick={() => setFilter("critical")} count={counts.critical}>Critical</FilterChip>
        <FilterChip active={filter === "warn"} onClick={() => setFilter("warn")} count={counts.warn}>Warn</FilterChip>
        <FilterChip active={filter === "acked"} onClick={() => setFilter("acked")} count={counts.acked}>Acked</FilterChip>
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={<BellOff />} title={filter === "open" ? "No active alerts" : "Nothing here"}
          description={filter === "open" ? "Sensors are inside thresholds. Anything that drifts shows up here automatically." : "Try a different filter."} />
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((a) => {
            const agoMin = Math.max(0, Math.round((Date.now() - new Date(a.createdAt).getTime()) / 60000));
            return (
              <AlertRow key={a.id} metric={a.metric} severity={a.severity} source={zoneName(a.zoneId)}
                value={a.value} threshold={a.threshold} agoLabel={`${agoMin} min ago`} acknowledged={a.acknowledgedAt != null}
                onView={() => navigate({ to: "/zone/$zoneId", params: { zoneId: a.zoneId } })}
                onAcknowledge={() => ack.mutate(a.id)} />
            );
          })}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/alerts")({ component: AlertsScreen });
