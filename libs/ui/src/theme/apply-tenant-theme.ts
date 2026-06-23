import { TENANT_PRESETS, type TenantId } from "./tenant-presets";

/** Sets --brand-* CSS variables on :root for the given tenant. */
export function applyTenantTheme(tenantId: TenantId) {
  const preset = TENANT_PRESETS[tenantId];
  if (!preset) return;
  const root = document.documentElement;
  for (const [step, hex] of Object.entries(preset.brand)) {
    root.style.setProperty(`--brand-${step}`, hex);
  }
  root.dataset.tenant = tenantId;
}

export function applyColorScheme(scheme: "light" | "dark") {
  document.documentElement.dataset.theme = scheme;
}
