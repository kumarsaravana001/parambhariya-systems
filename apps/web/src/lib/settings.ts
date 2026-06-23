import * as React from "react";

export interface Settings {
  org: { farmName: string; owner: string; email: string; phone: string; location: string };
  units: { temp: "C" | "F"; weight: "g" | "kg"; area: "sqm" | "sqft" };
  alerts: { sound: boolean; criticalOnly: boolean; digestDaily: boolean };
  climate: { tempC: number; rhPct: number; co2Ppm: number };
}

const DEFAULTS: Settings = {
  org: { farmName: "Parambhariya", owner: "Saravanakumar", email: "", phone: "", location: "Anaimalai / Coimbatore, Tamil Nadu" },
  units: { temp: "C", weight: "g", area: "sqm" },
  alerts: { sound: true, criticalOnly: false, digestDaily: false },
  climate: { tempC: 24, rhPct: 88, co2Ppm: 1000 },
};

const KEY = "parambhariya.settings.v1";

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw);
      return { ...DEFAULTS, ...p, org: { ...DEFAULTS.org, ...p.org }, units: { ...DEFAULTS.units, ...p.units }, alerts: { ...DEFAULTS.alerts, ...p.alerts }, climate: { ...DEFAULTS.climate, ...p.climate } };
    }
  } catch {}
  return DEFAULTS;
}
function save(s: Settings) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }

/** Settings hook. `update` merges one section. */
export function useSettings() {
  const [settings, setSettings] = React.useState<Settings>(() => loadSettings());
  const update = React.useCallback(<K extends keyof Settings>(section: K, patch: Partial<Settings[K]>) => {
    setSettings((prev) => {
      const next = { ...prev, [section]: { ...prev[section], ...patch } };
      save(next);
      return next;
    });
  }, []);
  return { settings, update };
}

export const fmtTempUnit = (c: number, unit: "C" | "F") =>
  unit === "F" ? `${(c * 9 / 5 + 32).toFixed(1)} °F` : `${c.toFixed(1)} °C`;
