import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  PageHeader, Card, CardTitle, FormField, Input, Tag, Badge, AlertBanner,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  Table, THead, TBody, TR, TH, TD, EmptyState,
} from "@parambhariya/ui";
import { CalendarRange, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  SPAWN_STAGE_ORDER, SPAWN_STAGE_LABEL, type SpawnStage, backwardPlan,
} from "@parambhariya/types";
import { useStrains, useZones } from "../lib/queries";
import { SectionHelp } from "../lib/SectionHelp";
import { todayYMD } from "../lib/spawn";

const DAY = 86400000;
const addDays = (ymd: string, n: number) =>
  new Date(new Date(`${ymd}T00:00:00Z`).getTime() + n * DAY).toISOString().slice(0, 10);

function PlannerScreen() {
  const strains = useStrains();
  const zones = useZones();
  const today = todayYMD();

  const strainList = strains.data ?? [];
  const zoneList = zones.data ?? [];

  const [finalStage, setFinalStage] = React.useState<SpawnStage>("SUBSTRATE_F1");
  const [startStage, setStartStage] = React.useState<SpawnStage>("MOTHER_CULTURE");
  const [qty, setQty] = React.useState("200");
  const [deliverBy, setDeliverBy] = React.useState(() => addDays(today, 60));
  const [strainId, setStrainId] = React.useState("");
  const [zoneId, setZoneId] = React.useState("");

  // default the strain once data arrives
  React.useEffect(() => {
    if (!strainId && strainList[0]) setStrainId(strainList[0].id);
  }, [strainList, strainId]);

  const strain = strainList.find((s) => s.id === strainId);
  const zone = zoneList.find((z) => z.id === zoneId);

  // incubation temp: live reading → setpoint → strain optimum midpoint
  const tempC = zone?.tempC != null ? zone.tempC
    : zone ? zone.setpointTempC
    : strain ? (strain.optimalTempMin + strain.optimalTempMax) / 2
    : 24;
  const tempBasis = zone?.tempC != null ? "live reading" : zone ? "zone setpoint" : "strain optimum";

  // start stage can't be after the final stage
  const validStart = SPAWN_STAGE_ORDER.indexOf(startStage) <= SPAWN_STAGE_ORDER.indexOf(finalStage)
    ? startStage : "MOTHER_CULTURE";

  const plan = strain
    ? backwardPlan({
        finalStage, startStage: validStart,
        targetUnits: Math.max(1, Number(qty) || 1),
        targetReadyOn: deliverBy, today,
        optMin: strain.optimalTempMin, optMax: strain.optimalTempMax, tempC,
      })
    : null;

  return (
    <div>
      <PageHeader title="Delivery Planner" description="Work backward from a delivery date to the last safe day to start each step." />
      <SectionHelp id="planner" items={[
        { label: "What this is", body: "Enter what you need to deliver, how many, and by when — it back-calculates the latest day you can start each stage of the spawn ladder so the biology lands on time." },
        { label: "Climate-aware", body: "Durations use the incubation temperature (live reading, zone setpoint, or the strain's optimum), so a colder room pushes every start date earlier." },
        { label: "Reading it", body: "If a row is red ('past'), that step already needed to start — the order isn't feasible from a cold start. Pick an earlier deliver-by date or start from a stage you already have." },
      ]} />

      {strainList.length === 0 ? (
        <EmptyState icon={<CalendarRange />} title="No strains yet" description="Add a strain (with its optimal temperature band) before planning a delivery." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* inputs */}
          <Card padding="lg" className="lg:col-span-1 flex flex-col gap-4">
            <CardTitle>Order</CardTitle>
            <FormField label="Product (final stage)" htmlFor="pl-final">
              <Select value={finalStage} onValueChange={(v) => setFinalStage(v as SpawnStage)}>
                <SelectTrigger id="pl-final"><SelectValue /></SelectTrigger>
                <SelectContent>{SPAWN_STAGE_ORDER.map((s) => <SelectItem key={s} value={s}>{SPAWN_STAGE_LABEL[s]}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
            <FormField label="Quantity (units)" htmlFor="pl-qty">
              <Input id="pl-qty" type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} />
            </FormField>
            <FormField label="Deliver by" htmlFor="pl-date">
              <Input id="pl-date" type="date" value={deliverBy} onChange={(e) => setDeliverBy(e.target.value)} />
            </FormField>
            <FormField label="Strain" htmlFor="pl-strain">
              <Select value={strainId} onValueChange={setStrainId}>
                <SelectTrigger id="pl-strain"><SelectValue /></SelectTrigger>
                <SelectContent>{strainList.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
            <FormField label="Incubation zone" htmlFor="pl-zone" hint="Sets the temperature used for the timing.">
              <Select value={zoneId} onValueChange={setZoneId}>
                <SelectTrigger id="pl-zone"><SelectValue placeholder="Strain optimum" /></SelectTrigger>
                <SelectContent><SelectItem value="">— strain optimum —</SelectItem>{zoneList.map((z) => <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
            <FormField label="Starting from" htmlFor="pl-start" hint="The stage you already have on hand.">
              <Select value={validStart} onValueChange={(v) => setStartStage(v as SpawnStage)}>
                <SelectTrigger id="pl-start"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SPAWN_STAGE_ORDER.filter((s) => SPAWN_STAGE_ORDER.indexOf(s) <= SPAWN_STAGE_ORDER.indexOf(finalStage))
                    .map((s) => <SelectItem key={s} value={s}>{SPAWN_STAGE_LABEL[s]}</SelectItem>)}
                </SelectContent>
              </Select>
            </FormField>
          </Card>

          {/* schedule */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {plan && (
              <AlertBanner
                tone={plan.feasible ? "info" : "critical"}
                title={plan.feasible
                  ? `Feasible — start by ${plan.inoculateFirstBy}`
                  : `Behind schedule by ${Math.abs(plan.slackDays)} day${Math.abs(plan.slackDays) === 1 ? "" : "s"}`}
              >
                {plan.feasible ? (
                  <>You have <span className="font-mono">{plan.slackDays}</span> day{plan.slackDays === 1 ? "" : "s"} of slack. The whole chain takes ~<span className="font-mono">{plan.totalDays}</span> days at <span className="font-mono">{tempC.toFixed(1)} °C</span> ({tempBasis}).</>
                ) : (
                  <>A cold start would have needed to begin on <span className="font-mono">{plan.inoculateFirstBy}</span>. Move the deliver-by date later, or set "Starting from" to a stage you already hold.</>
                )}
              </AlertBanner>
            )}

            <Card padding="lg">
              <div className="flex items-center gap-2 mb-1"><CalendarRange className="h-5 w-5 text-brand-700" /><CardTitle>Production schedule</CardTitle></div>
              <p className="text-sm text-text-muted mb-4">Each step's latest safe inoculation date and the quantity it must yield, timed for the {SPAWN_STAGE_LABEL[finalStage].toLowerCase()} to be ready on {deliverBy}.</p>
              {!plan ? (
                <p className="text-sm text-text-muted">Pick a strain to compute the schedule.</p>
              ) : (
                <Table>
                  <THead>
                    <TR className="hover:bg-transparent">
                      <TH>Step</TH><TH>Inoculate by</TH><TH>Ready by</TH>
                      <TH className="text-right">Units</TH><TH className="text-right">Days</TH><TH className="text-right">Status</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {plan.stages.map((s) => (
                      <TR key={s.stage}>
                        <TD className="font-medium text-text-primary">{s.label}</TD>
                        <TD className={`font-mono ${s.late ? "text-danger-fg" : ""}`}>{s.startBy}</TD>
                        <TD className="font-mono text-text-secondary">{s.readyBy}</TD>
                        <TD className="text-right font-mono">{s.unitsNeeded}</TD>
                        <TD className="text-right font-mono text-text-muted">{s.days}</TD>
                        <TD className="text-right">
                          {s.late
                            ? <Tag tone="danger" size="sm"><AlertTriangle aria-hidden /> past</Tag>
                            : <Tag tone="success" size="sm"><CheckCircle2 aria-hidden /> on track</Tag>}
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              )}
              <p className="text-xs text-text-muted mt-3">Operational estimate from colonization models — confirm against your own line. Multiplication ratios are conservative defaults.</p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/planner")({ component: PlannerScreen });
