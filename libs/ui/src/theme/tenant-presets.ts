/**
 * Tenant brand presets. Brand color is runtime-mutable per farm — components
 * MUST use bg-brand-* utilities; never hardcode hex.
 */
export type TenantId = "mushroomai" | "aquafarm";

export interface TenantPreset {
  id: TenantId;
  name: string;
  brand: {
    "50": string;
    "100": string;
    "300": string;
    "500": string;
    "600": string;
    "700": string;
    "900": string;
  };
}

export const TENANT_PRESETS: Record<TenantId, TenantPreset> = {
  mushroomai: {
    id: "mushroomai",
    name: "MushroomAI",
    brand: {
      "50": "#eef7ec",
      "100": "#d4ecce",
      "300": "#8dcc7e",
      "500": "#4baf3b",
      "600": "#3d9530",
      "700": "#2f7724",
      "900": "#1c4416",
    },
  },
  aquafarm: {
    id: "aquafarm",
    name: "AquaFarm",
    brand: {
      "50": "#ecf3fb",
      "100": "#cfe0f5",
      "300": "#7eb3e1",
      "500": "#2c7ec4",
      "600": "#1f66a7",
      "700": "#174f82",
      "900": "#0d2e4d",
    },
  },
};
