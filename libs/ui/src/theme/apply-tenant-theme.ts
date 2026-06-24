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

export type ColorScheme = "light" | "dark";
export type ThemeChoice = ColorScheme | "system";

/** localStorage key holding the user's THEME CHOICE (light | dark | system). */
export const COLOR_SCHEME_KEY = "parambhariya.colorscheme";

function systemScheme(): ColorScheme {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

/** Resolve a choice to a concrete scheme (reads the OS when choice === "system"). */
export function resolveScheme(choice: ThemeChoice): ColorScheme {
  return choice === "system" ? systemScheme() : choice;
}

/** The persisted choice, defaulting to "system" (OS-driven) on first run. */
export function storedThemeChoice(): ThemeChoice {
  try {
    const v = localStorage.getItem(COLOR_SCHEME_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {}
  return "system";
}

/** Apply a theme choice to <html data-theme> and persist the choice. */
export function applyColorScheme(choice: ThemeChoice) {
  document.documentElement.dataset.theme = resolveScheme(choice);
  try {
    localStorage.setItem(COLOR_SCHEME_KEY, choice);
  } catch {}
}

/** Re-run a callback when the OS scheme flips (only meaningful while choice === "system"). Returns an unsubscribe. */
export function watchSystemScheme(onChange: () => void): () => void {
  try {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  } catch {
    return () => {};
  }
}
