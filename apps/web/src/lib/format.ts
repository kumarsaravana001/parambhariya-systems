/** value + space + unit (spec) */
export const fmtTemp  = (c?: number) => (c === undefined ? "—" : `${c.toFixed(1)} °C`);
export const fmtRh    = (p?: number) => (p === undefined ? "—" : `${p.toFixed(1)} %`);
export const fmtCo2   = (p?: number) => (p === undefined ? "—" : `${p} ppm`);
export const fmtLight = (l?: number) => (l === undefined ? "—" : `${l} lx`);
export const fmtRange = (r?: [number, number], unit?: string) =>
  r ? `${r[0]} – ${r[1]}${unit ? ` ${unit}` : ""}` : "—";

export const fmtAgo = (sec: number) => {
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.round(sec / 60)}m ago`;
  return `${Math.round(sec / 3600)}h ago`;
};
export const fmtAgoMin = (m: number) => (m < 60 ? `${m}m ago` : `${Math.round(m / 60)}h ago`);

/** Domain tone for a sensor reading vs an optimal band. */
export function bandTone(value: number | undefined, optimal: [number, number], soft = 1) {
  if (value === undefined) return "default" as const;
  if (value < optimal[0] - soft || value > optimal[1] + soft) return "danger" as const;
  if (value < optimal[0] || value > optimal[1]) return "warn" as const;
  return "success" as const;
}
