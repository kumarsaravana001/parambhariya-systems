import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  PageHeader, Card, CardTitle, Heading, Text, Caption, Code,
  Button, IconButton, Badge, Tag, LifeBadge, Avatar, Spinner, Progress, Link as UILink,
  Input, SearchInput, Textarea, Checkbox, Radio, RadioGroup, Switch, Slider, Label,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  Combobox, DatePicker, FileInput, FormField,
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
  Tooltip, TooltipTrigger, TooltipContent,
  Tabs, TabsList, TabsTrigger, TabsContent,
  Alert, AlertBanner, MetricCard, BigReading, EmptyState, Spark, EnvChart, Pipeline, Timeline,
  LIFECYCLE_ORDER, type DateRange,
} from "@parambhariya/ui";
import { Plus, Settings, Thermometer, Droplets, Wind, Sprout, MoreVertical } from "lucide-react";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <Heading level={2} className="mb-4 pb-2 border-b border-border-default">{title}</Heading>
      {children}
    </section>
  );
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 mb-4">
      <Caption>{label}</Caption>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

const TOKENS = {
  brand: ["50","100","300","500","600","700","900"].map((k) => ({ k, v: `var(--brand-${k})` })),
  surface: ["bg","card","muted","sunken"].map((k) => ({ k, v: `var(--surface-${k})` })),
  status: ["success","warn","danger","info","neutral"],
};

function Gallery() {
  const [combo, setCombo] = React.useState<string | null>(null);
  const [multi, setMulti] = React.useState<string[]>(["s-pleurotus"]);
  const [date, setDate] = React.useState<Date | null>(null);
  const [range, setRange] = React.useState<DateRange>({ from: null, to: null });
  const [checked, setChecked] = React.useState(true);
  const [radio, setRadio] = React.useState("a");
  const [sw, setSw] = React.useState(true);
  const [slider, setSlider] = React.useState([40]);
  const [files, setFiles] = React.useState<{ name: string; sizeLabel?: string; status?: "success" }[]>([
    { name: "spore-print-01.jpg", sizeLabel: "1.2 MB", status: "success" },
  ]);

  const strainOpts = [
    { value: "s-pleurotus", label: "Pearl Oyster" },
    { value: "s-lentinula", label: "Shiitake" },
    { value: "s-ganoderma", label: "Reishi" },
    { value: "s-hericium", label: "Lion's Mane" },
  ];

  const trend = Array.from({ length: 24 }, (_, i) => 24 + Math.sin(i / 3) * 1.5);

  return (
    <div>
      <PageHeader
        title="Component Gallery"
        eyebrow="Design System"
        description="Every primitive and pattern in @parambhariya/ui, rendered from the locked token set."
      />

      <Section title="Tokens">
        <Row label="Brand ramp (background-only; brand-700 for text)">
          {TOKENS.brand.map((t) => (
            <div key={t.k} className="flex flex-col items-center gap-1">
              <span className="h-12 w-12 rounded-md border border-border-default" style={{ background: t.v }} />
              <Caption>{t.k}</Caption>
            </div>
          ))}
        </Row>
        <Row label="Surfaces">
          {TOKENS.surface.map((t) => (
            <div key={t.k} className="flex flex-col items-center gap-1">
              <span className="h-12 w-12 rounded-md border border-border-default" style={{ background: t.v }} />
              <Caption>{t.k}</Caption>
            </div>
          ))}
        </Row>
        <Row label="Status pairs">
          {TOKENS.status.map((t) => (
            <Badge key={t} tone={t as "success"}>{t}</Badge>
          ))}
        </Row>
        <Row label="Lifecycle palette (the domain signature · red = contamination only)">
          {[...LIFECYCLE_ORDER, "CONTAMINATED" as const].map((s) => (
            <LifeBadge key={s} stage={s} />
          ))}
        </Row>
      </Section>

      <Section title="Typography">
        <div className="flex flex-col gap-2">
          <Heading level={1}>Heading 1 — page title</Heading>
          <Heading level={2}>Heading 2 — card title</Heading>
          <Heading level={3}>Heading 3 — list row</Heading>
          <Heading eyebrow as="h4">Eyebrow label</Heading>
          <Text>Body text. The quick brown fox jumps over the lazy dog while sensors hum.</Text>
          <Text tone="secondary">Secondary text — descriptions and supporting copy.</Text>
          <Text tone="muted" size="sm">Muted small text — hints and captions.</Text>
          <div className="flex items-center gap-2"><Text>Inline code:</Text> <Code>26.3 °C</Code> <Code>A-4127</Code></div>
          <Caption>Caption — the smallest functional text.</Caption>
        </div>
      </Section>

      <Section title="Buttons">
        <Row label="Variants">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="link">Link</Button>
        </Row>
        <Row label="Sizes & states">
          <Button size="xs">XS</Button>
          <Button size="sm">SM</Button>
          <Button size="md">MD</Button>
          <Button size="lg">LG</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
          <Button><Plus /> With icon</Button>
        </Row>
        <Row label="IconButton">
          <IconButton aria-label="Add"><Plus /></IconButton>
          <IconButton aria-label="Settings" variant="secondary"><Settings /></IconButton>
          <IconButton aria-label="More" variant="ghost" size="sm"><MoreVertical /></IconButton>
        </Row>
      </Section>

      <Section title="Tags, badges, avatars, feedback">
        <Row label="Tag tones">
          {(["success","warn","danger","info","neutral","brand"] as const).map((t) => (
            <Tag key={t} tone={t}>{t}</Tag>
          ))}
          <Tag tone="brand" onRemove={() => {}}>removable</Tag>
        </Row>
        <Row label="Avatar">
          <Avatar initials="SK" />
          <Avatar initials="VS" status="online" />
          <Avatar icon={<Sprout className="h-4 w-4" />} status="busy" />
          <Avatar size="lg" initials="DG" status="away" />
        </Row>
        <Row label="Spinner & Progress">
          <Spinner />
          <div className="w-40"><Progress value={62} /></div>
          <div className="w-40"><Progress value={40} stage="COLONIZING" /></div>
        </Row>
        <Row label="Link">
          <UILink href="#">Default link</UILink>
          <UILink href="#" variant="subtle">Subtle</UILink>
          <UILink href="#" external>External</UILink>
        </Row>
      </Section>

      <Section title="Form controls">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
          <FormField label="Input" htmlFor="g-input" hint="Standard text input">
            <Input id="g-input" placeholder="Type here…" />
          </FormField>
          <FormField label="Search" htmlFor="g-search">
            <SearchInput placeholder="Search bags…" />
          </FormField>
          <FormField label="Select (native, Radix)" htmlFor="g-select">
            <Select>
              <SelectTrigger id="g-select"><SelectValue placeholder="Pick a room" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="a1">Room A-1</SelectItem>
                <SelectItem value="a2">Room A-2</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Combobox (single, searchable)" htmlFor="g-combo">
            <Combobox id="g-combo" options={strainOpts} value={combo} onChange={setCombo} placeholder="Pick strain" />
          </FormField>
          <FormField label="Combobox (multi-select chips)" htmlFor="g-multi">
            <Combobox multiple options={strainOpts} value={multi} onChange={setMulti} placeholder="Pick strains" />
          </FormField>
          <FormField label="Date (single + quick-select)" htmlFor="g-date">
            <DatePicker value={date} onChange={setDate} />
          </FormField>
          <FormField label="Date range" htmlFor="g-range">
            <DatePicker mode="range" value={range} onChange={setRange} />
          </FormField>
          <FormField label="Textarea" htmlFor="g-ta">
            <Textarea id="g-ta" placeholder="Notes…" />
          </FormField>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-8">
          <label className="flex items-center gap-2"><Checkbox checked={checked} onCheckedChange={(v) => setChecked(!!v)} /> <Text size="sm">Checkbox</Text></label>
          <label className="flex items-center gap-2"><Checkbox checked="indeterminate" /> <Text size="sm">Indeterminate</Text></label>
          <RadioGroup value={radio} onValueChange={setRadio} orientation="horizontal">
            <Label className="flex items-center gap-2"><Radio value="a" /> Option A</Label>
            <Label className="flex items-center gap-2"><Radio value="b" /> Option B</Label>
          </RadioGroup>
          <label className="flex items-center gap-2"><Switch checked={sw} onCheckedChange={setSw} /> <Text size="sm">Switch</Text></label>
          <div className="w-48"><Slider value={slider} onValueChange={setSlider} showBubble formatValue={(v) => `${v}s`} /></div>
        </div>

        <div className="mt-6 max-w-md">
          <FileInput files={files} onFiles={() => {}} onRemove={(i) => setFiles((f) => f.filter((_, x) => x !== i))} />
        </div>
      </Section>

      <Section title="Overlays">
        <Row label="Dialog · Dropdown · Tooltip">
          <Dialog>
            <DialogTrigger asChild><Button variant="secondary">Open dialog</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Discard bag AN-0210?</DialogTitle>
                <DialogDescription>This bag is flagged contaminated. Discarding removes it from rotation.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild><Button variant="secondary" size="sm">Cancel</Button></DialogClose>
                <Button variant="danger" size="sm">Discard</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="secondary">Menu</Button></DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Bag actions</DropdownMenuLabel>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Move zone</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive>Discard</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild><Button variant="ghost">Hover me</Button></TooltipTrigger>
            <TooltipContent>Last reading 18s ago</TooltipContent>
          </Tooltip>
        </Row>
        <div className="max-w-md">
          <Tabs defaultValue="t1">
            <TabsList>
              <TabsTrigger value="t1">Zones</TabsTrigger>
              <TabsTrigger value="t2">Bags</TabsTrigger>
            </TabsList>
            <TabsContent value="t1"><Text size="sm" tone="muted">Zone list goes here.</Text></TabsContent>
            <TabsContent value="t2"><Text size="sm" tone="muted">Bag list goes here.</Text></TabsContent>
          </Tabs>
        </div>
      </Section>

      <Section title="Alerts">
        <div className="flex flex-col gap-3 max-w-2xl">
          <Alert tone="success" title="Saved">Settings updated.</Alert>
          <AlertBanner tone="critical" title="Temperature out of range — Room A-2">
            Current 27.9 °C · Threshold ≤ 25 °C · 3 min ago. Critical banners are not dismissible.
          </AlertBanner>
          <AlertBanner tone="warning" title="Humidity drifting" onDismiss={() => {}}>
            91.4 % · Threshold ≤ 90 %.
          </AlertBanner>
        </div>
      </Section>

      <Section title="Data patterns">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <MetricCard label="Active bags" value={412} />
          <MetricCard label="Yield" value="12.4" unit="kg" tone="success" />
          <MetricCard label="Contam" value={1} tone="danger" />
          <MetricCard label="Open alerts" value={2} tone="warn" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <BigReading label="Temperature" icon={<Thermometer />} value="24.2" unit="°C" range="22 – 26 °C" freshness="18s ago" trend={trend} />
          <BigReading label="Humidity" icon={<Droplets />} value="88.1" unit="%" range="85 – 95 %" freshness="18s ago" tone="success" trend={trend} />
          <BigReading label="CO₂" icon={<Wind />} value="1480" unit="ppm" range="600 – 1200 ppm" freshness="18s ago" tone="warn" trend={trend} />
        </div>
        <Card padding="lg" className="mb-6">
          <CardTitle className="mb-3">EnvChart — multi-series</CardTitle>
          <EnvChart
            xLabels={["−6h","−4h","−2h","now"]}
            series={[
              { key: "t", label: "Temp", unit: "°C", optimal: [22, 26], data: Array.from({length:24},(_,i)=>24+Math.sin(i/3)*2) },
              { key: "h", label: "RH", unit: "%", colorClass: "text-info-fg", data: Array.from({length:24},(_,i)=>88+Math.cos(i/4)*3) },
              { key: "c", label: "CO₂", unit: "ppm", colorClass: "text-warn-fg", data: Array.from({length:24},(_,i)=>1400+Math.sin(i/2)*120) },
            ]}
          />
        </Card>
        <Card padding="lg" className="mb-6">
          <CardTitle className="mb-3">Pipeline</CardTitle>
          <Pipeline data={LIFECYCLE_ORDER.map((stage, i) => ({ stage, count: [7,4,2,5,3][i]! }))} />
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card padding="lg">
            <CardTitle className="mb-3">Sparkline</CardTitle>
            <Spark data={trend} width={320} height={60} className="text-brand-500 w-full" />
          </Card>
          <Card padding="lg">
            <CardTitle className="mb-3">Timeline</CardTitle>
            <Timeline events={[
              { id: "1", title: "Bag created", time: "24d ago" },
              { id: "2", title: "Colonization complete", time: "8d ago", tone: "success" },
              { id: "3", title: "Moved to fruiting", time: "7d ago", tone: "info" },
            ]} />
          </Card>
        </div>
        <div className="mt-6">
          <EmptyState title="No farms yet" description="Create your first farm to start monitoring your mushroom production." action={<Button><Plus /> Create Your First Farm</Button>} />
        </div>
      </Section>
    </div>
  );
}

export const Route = createFileRoute("/components")({ component: Gallery });
