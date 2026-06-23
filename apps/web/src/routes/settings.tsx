import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  PageHeader, Card, CardTitle, Tabs, TabsList, TabsTrigger, TabsContent,
  TenantCard, ToggleRow, Switch, Slider, RadioGroup, Radio, Label,
  applyTenantTheme, applyColorScheme, TENANT_PRESETS, type TenantId,
} from "@parambhariya/ui";

function SettingsScreen() {
  const [tenant, setTenant] = React.useState<TenantId>(
    (document.documentElement.dataset.tenant as TenantId) ?? "mushroomai"
  );
  const [scheme, setScheme] = React.useState<"light" | "dark">(
    (document.documentElement.dataset.theme as "light" | "dark") ?? "light"
  );
  const [alertSound, setAlertSound] = React.useState(true);
  const [criticalOnly, setCriticalOnly] = React.useState(false);
  const [tempUnit, setTempUnit] = React.useState<"c" | "f">("c");
  const [sampleRate, setSampleRate] = React.useState([30]);

  const pickTenant = (id: TenantId) => {
    setTenant(id);
    applyTenantTheme(id);
  };
  const pickScheme = (v: "light" | "dark") => {
    setScheme(v);
    applyColorScheme(v);
  };

  return (
    <div>
      <PageHeader title="Settings" description="Branding, notifications, and units." />

      <Tabs defaultValue="appearance">
        <TabsList>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="units">Units &amp; data</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance">
          <Card padding="lg" className="mb-4">
            <CardTitle className="mb-3">Tenant</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(Object.values(TENANT_PRESETS) as Array<typeof TENANT_PRESETS[TenantId]>).map((t) => (
                <TenantCard
                  key={t.id}
                  name={t.name}
                  swatch={t.brand["500"]}
                  selected={tenant === t.id}
                  onClick={() => pickTenant(t.id)}
                />
              ))}
            </div>
          </Card>

          <Card padding="lg">
            <CardTitle className="mb-3">Color scheme</CardTitle>
            <RadioGroup value={scheme} onValueChange={(v) => pickScheme(v as "light" | "dark")} orientation="horizontal">
              <Label htmlFor="scheme-light" className="flex items-center gap-2 cursor-pointer">
                <Radio id="scheme-light" value="light" /> Light
              </Label>
              <Label htmlFor="scheme-dark" className="flex items-center gap-2 cursor-pointer">
                <Radio id="scheme-dark" value="dark" /> Dark
              </Label>
            </RadioGroup>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card padding="lg" className="divide-y divide-border-default">
            <ToggleRow
              label="Audible alerts"
              description="Play a soft tone when a critical alert fires."
              control={<Switch checked={alertSound} onCheckedChange={setAlertSound} />}
            />
            <ToggleRow
              label="Critical only"
              description="Mute warning-tier alerts; show only sensor-out-of-band and offline."
              control={<Switch checked={criticalOnly} onCheckedChange={setCriticalOnly} />}
            />
          </Card>
        </TabsContent>

        <TabsContent value="units">
          <Card padding="lg" className="mb-4">
            <CardTitle className="mb-3">Temperature</CardTitle>
            <RadioGroup value={tempUnit} onValueChange={(v) => setTempUnit(v as "c" | "f")} orientation="horizontal">
              <Label htmlFor="unit-c" className="flex items-center gap-2 cursor-pointer">
                <Radio id="unit-c" value="c" /> Celsius (°C)
              </Label>
              <Label htmlFor="unit-f" className="flex items-center gap-2 cursor-pointer">
                <Radio id="unit-f" value="f" /> Fahrenheit (°F)
              </Label>
            </RadioGroup>
          </Card>
          <Card padding="lg">
            <CardTitle className="mb-3">Sensor sample rate</CardTitle>
            <p className="text-sm text-text-muted mb-4">Higher sampling burns more bandwidth on rural 2G/3G.</p>
            <Slider
              value={sampleRate}
              onValueChange={setSampleRate}
              min={5}
              max={300}
              step={5}
              showBubble
              formatValue={(v) => `${v} s`}
            />
            <div className="mt-2 flex items-center justify-between text-xs text-text-muted font-mono">
              <span>5 s</span><span>300 s</span>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const Route = createFileRoute("/settings")({ component: SettingsScreen });
