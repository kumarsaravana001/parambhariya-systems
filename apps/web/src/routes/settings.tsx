import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  PageHeader, Card, CardTitle, Tabs, TabsList, TabsTrigger, TabsContent,
  TenantCard, ToggleRow, Switch, Slider, RadioGroup, Radio, Label, FormField, Input, Button,
  Badge, DataList, Alert,
  applyTenantTheme, applyColorScheme, storedThemeChoice, TENANT_PRESETS, type TenantId, type ThemeChoice,
} from "@parambhariya/ui";
import { Building2, Palette, Ruler, Bell, Gauge, Database, Info, Download, RotateCcw } from "lucide-react";
import { SectionHelp } from "../lib/SectionHelp";
import { useSettings } from "../lib/settings";
import { driverMode } from "../lib/queries";
import { resetLocalDb } from "../lib/local-driver";

function SettingsScreen() {
  const { settings, update } = useSettings();
  const [tenant, setTenant] = React.useState<TenantId>((document.documentElement.dataset.tenant as TenantId) ?? "mushroomai");
  const [scheme, setScheme] = React.useState<ThemeChoice>(() => storedThemeChoice());
  const [sampleRate, setSampleRate] = React.useState([30]);

  const pickTenant = (id: TenantId) => { setTenant(id); applyTenantTheme(id); };
  const pickScheme = (v: ThemeChoice) => { setScheme(v); applyColorScheme(v); };

  const exportData = () => {
    try {
      const blob = new Blob([localStorage.getItem("parambhariya.db.v5") ?? "{}"], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "parambhariya-data.json";
      a.click();
    } catch {}
  };

  return (
    <div>
      <PageHeader title="Settings" description="Organization, appearance, units, alerts, and climate defaults." />
      <SectionHelp id="settings" items={[
        { label: "What this is", body: "Everything that tailors the system to your operation — your org details, units, alert preferences and the default climate for new zones." },
        { label: "Saved instantly", body: "Changes persist automatically on this device. Appearance and climate defaults take effect immediately." },
      ]} />

      <Tabs defaultValue="org">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="org"><Building2 className="h-4 w-4" /> Organization</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="h-4 w-4" /> Appearance</TabsTrigger>
          <TabsTrigger value="units"><Ruler className="h-4 w-4" /> Units</TabsTrigger>
          <TabsTrigger value="alerts"><Bell className="h-4 w-4" /> Alerts</TabsTrigger>
          <TabsTrigger value="climate"><Gauge className="h-4 w-4" /> Climate defaults</TabsTrigger>
          <TabsTrigger value="data"><Database className="h-4 w-4" /> Data</TabsTrigger>
          <TabsTrigger value="about"><Info className="h-4 w-4" /> About</TabsTrigger>
        </TabsList>

        {/* Organization */}
        <TabsContent value="org">
          <Card padding="lg" className="max-w-2xl">
            <CardTitle className="mb-4">Organization</CardTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Farm / business name" htmlFor="s-farm"><Input id="s-farm" value={settings.org.farmName} onChange={(e) => update("org", { farmName: e.target.value })} /></FormField>
              <FormField label="Owner" htmlFor="s-owner"><Input id="s-owner" value={settings.org.owner} onChange={(e) => update("org", { owner: e.target.value })} /></FormField>
              <FormField label="Email" htmlFor="s-email"><Input id="s-email" type="email" value={settings.org.email} onChange={(e) => update("org", { email: e.target.value })} placeholder="you@farm.in" /></FormField>
              <FormField label="Phone" htmlFor="s-phone"><Input id="s-phone" value={settings.org.phone} onChange={(e) => update("org", { phone: e.target.value })} placeholder="+91 …" /></FormField>
              <FormField label="Location" htmlFor="s-loc" className="sm:col-span-2"><Input id="s-loc" value={settings.org.location} onChange={(e) => update("org", { location: e.target.value })} /></FormField>
            </div>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance">
          <Card padding="lg" className="mb-4">
            <CardTitle className="mb-3">Tenant brand</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(Object.values(TENANT_PRESETS) as Array<typeof TENANT_PRESETS[TenantId]>).map((t) => (
                <TenantCard key={t.id} name={t.name} swatch={t.brand["500"]} selected={tenant === t.id} onClick={() => pickTenant(t.id)} />
              ))}
            </div>
          </Card>
          <Card padding="lg">
            <CardTitle className="mb-1">Color scheme</CardTitle>
            <p className="text-sm text-text-muted mb-3">Saved on this device. <span className="font-medium">System</span> follows your phone's light/dark setting — handy for grow-room checks at night.</p>
            <RadioGroup value={scheme} onValueChange={(v) => pickScheme(v as ThemeChoice)} orientation="horizontal">
              <Label htmlFor="sc-l" className="flex items-center gap-2 cursor-pointer"><Radio id="sc-l" value="light" /> Light</Label>
              <Label htmlFor="sc-d" className="flex items-center gap-2 cursor-pointer"><Radio id="sc-d" value="dark" /> Dark</Label>
              <Label htmlFor="sc-s" className="flex items-center gap-2 cursor-pointer"><Radio id="sc-s" value="system" /> System</Label>
            </RadioGroup>
          </Card>
        </TabsContent>

        {/* Units */}
        <TabsContent value="units">
          <Card padding="lg" className="flex flex-col gap-6 max-w-2xl">
            <div>
              <CardTitle className="mb-3">Temperature</CardTitle>
              <RadioGroup value={settings.units.temp} onValueChange={(v) => update("units", { temp: v as "C" | "F" })} orientation="horizontal">
                <Label htmlFor="u-c" className="flex items-center gap-2 cursor-pointer"><Radio id="u-c" value="C" /> Celsius (°C)</Label>
                <Label htmlFor="u-f" className="flex items-center gap-2 cursor-pointer"><Radio id="u-f" value="F" /> Fahrenheit (°F)</Label>
              </RadioGroup>
            </div>
            <div>
              <CardTitle className="mb-3">Weight</CardTitle>
              <RadioGroup value={settings.units.weight} onValueChange={(v) => update("units", { weight: v as "g" | "kg" })} orientation="horizontal">
                <Label htmlFor="w-g" className="flex items-center gap-2 cursor-pointer"><Radio id="w-g" value="g" /> Grams</Label>
                <Label htmlFor="w-kg" className="flex items-center gap-2 cursor-pointer"><Radio id="w-kg" value="kg" /> Kilograms</Label>
              </RadioGroup>
            </div>
            <div>
              <CardTitle className="mb-3">Area</CardTitle>
              <RadioGroup value={settings.units.area} onValueChange={(v) => update("units", { area: v as "sqm" | "sqft" })} orientation="horizontal">
                <Label htmlFor="a-m" className="flex items-center gap-2 cursor-pointer"><Radio id="a-m" value="sqm" /> Square metres</Label>
                <Label htmlFor="a-ft" className="flex items-center gap-2 cursor-pointer"><Radio id="a-ft" value="sqft" /> Square feet</Label>
              </RadioGroup>
            </div>
          </Card>
        </TabsContent>

        {/* Alerts */}
        <TabsContent value="alerts">
          <Card padding="lg" className="divide-y divide-border-default max-w-2xl">
            <ToggleRow label="Audible alerts" description="Play a tone when a critical alert fires." control={<Switch checked={settings.alerts.sound} onCheckedChange={(v) => update("alerts", { sound: v })} />} />
            <ToggleRow label="Critical only" description="Mute warning-tier alerts; only surface sensor-out-of-band and offline." control={<Switch checked={settings.alerts.criticalOnly} onCheckedChange={(v) => update("alerts", { criticalOnly: v })} />} />
            <ToggleRow label="Daily digest" description="A once-a-day summary of zone status and ready spawn batches." control={<Switch checked={settings.alerts.digestDaily} onCheckedChange={(v) => update("alerts", { digestDaily: v })} />} />
          </Card>
        </TabsContent>

        {/* Climate defaults */}
        <TabsContent value="climate">
          <Card padding="lg" className="max-w-2xl">
            <CardTitle className="mb-1">Default setpoints for new zones</CardTitle>
            <p className="text-sm text-text-muted mb-5">When you add a zone, these become its starting climate targets. You can tune any zone afterwards.</p>
            <div className="flex flex-col gap-6">
              {[
                { k: "tempC" as const, label: "Temperature", unit: "°C", min: 10, max: 35, step: 0.5 },
                { k: "rhPct" as const, label: "Humidity", unit: "%", min: 60, max: 99, step: 1 },
                { k: "co2Ppm" as const, label: "CO₂", unit: "ppm", min: 400, max: 2000, step: 50 },
              ].map((c) => (
                <div key={c.k} className="flex items-center gap-4">
                  <div className="w-28 text-sm text-text-secondary">{c.label}</div>
                  <Slider className="flex-1" value={[settings.climate[c.k]]} min={c.min} max={c.max} step={c.step} aria-label={`Default ${c.label.toLowerCase()} (${c.unit})`}
                    onValueChange={(v) => update("climate", { [c.k]: v[0] } as any)} showBubble formatValue={(v) => `${v} ${c.unit}`} />
                  <div className="w-20 text-right font-mono text-sm">{settings.climate[c.k]} {c.unit}</div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Data */}
        <TabsContent value="data">
          <Card padding="lg" className="max-w-2xl flex flex-col gap-4">
            <CardTitle>Data &amp; backend</CardTitle>
            <DataList layout="inline" items={[
              { label: "Mode", value: <Badge tone={driverMode === "api" ? "success" : "info"}>{driverMode === "api" ? "Live API" : "Browser demo"}</Badge> },
              { label: "Sensor sample rate", value: `${sampleRate[0]} s`, mono: true },
            ]} />
            <div className="flex items-center gap-4">
              <div className="w-40 text-sm text-text-secondary">Sample rate</div>
              <Slider className="flex-1 max-w-xs" value={sampleRate} min={5} max={300} step={5} aria-label="Sensor sample rate (seconds)" onValueChange={setSampleRate} showBubble formatValue={(v) => `${v} s`} />
            </div>
            {driverMode === "local" && (
              <Alert tone="info">Demo mode stores data in this browser. Set <code className="font-mono">VITE_API_URL</code> to use the real backend with shared, persistent data.</Alert>
            )}
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={exportData}><Download className="h-4 w-4" /> Export data (JSON)</Button>
              {driverMode === "local" && (
                <Button variant="ghost" size="sm" className="text-danger-fg" onClick={() => { resetLocalDb(); location.reload(); }}><RotateCcw className="h-4 w-4" /> Reset demo data</Button>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* About */}
        <TabsContent value="about">
          <Card padding="lg" className="max-w-2xl">
            <CardTitle className="mb-3">About</CardTitle>
            <DataList layout="inline" items={[
              { label: "Product", value: "Parambhariya — mushroom cultivation monitoring" },
              { label: "Owner", value: settings.org.owner || "—" },
              { label: "Modules", value: "Farms · Spawn · Lab portal · Alerts · Reports" },
              { label: "Backend", value: driverMode === "api" ? "Hono + SQLite control plane" : "Browser demo driver" },
              { label: "Version", value: "1.0", mono: true },
            ]} />
            <p className="text-sm text-text-muted mt-4">Built for Anaimalai / Coimbatore operations. The control loop simulates the actuator; wiring real edge sensors is a drop-in replacement.</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const Route = createFileRoute("/settings")({ component: SettingsScreen });
