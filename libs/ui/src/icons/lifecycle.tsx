import * as React from "react";

/**
 * Hand-drawn biology glyphs — 24×24 viewBox, inherit currentColor, stroke 1.6.
 * One per lifecycle stage. Kept inline to avoid spritesheet plumbing.
 */
type GlyphProps = React.SVGAttributes<SVGSVGElement>;

const base: GlyphProps = {
  viewBox: "0 0 24 24",
  width: "1em",
  height: "1em",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

/** Sealed substrate bag */
export function GlyphCreated(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 5h10l-1 3v11a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V8z" />
      <path d="M7 5l1 3h8" />
      <path d="M11 12h2" />
    </svg>
  );
}

/** Mycelium threads spreading */
export function GlyphColonizing(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M4 12c3 0 4-2 8-2s5 2 8 2" />
      <path d="M5 8c2 1 4 .5 7 1.5" />
      <path d="M6 16c3-1 5-.5 8-2" />
      <path d="M9 4.5C10 7 11 8 12 9" />
      <path d="M15 19.5C14 17 13 16 12 15" />
    </svg>
  );
}

/** Tiny pinheads emerging */
export function GlyphPinning(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 19h16" />
      <circle cx="8" cy="16" r="1.4" />
      <circle cx="12" cy="14.5" r="1.6" />
      <circle cx="16" cy="16" r="1.4" />
      <path d="M8 16v3M12 14.5v4.5M16 16v3" />
    </svg>
  );
}

/** Mature mushroom */
export function GlyphFruiting(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 13a8 5 0 0 1 16 0z" />
      <path d="M10 13v6h4v-6" />
      <path d="M8 11c.5-.6 1.4-.8 2.2-.4M14 10.8c1 0 1.8.3 2.2 1" />
    </svg>
  );
}

/** Harvest basket */
export function GlyphHarvested(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 9h18l-2 11H5z" />
      <path d="M7 9c.5-3 2.5-5 5-5s4.5 2 5 5" />
      <path d="M7 13l1 4M12 13l0 4M17 13l-1 4" />
    </svg>
  );
}

/** Contamination spore burst */
export function GlyphContam(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 4v2M12 18v2M4 12h2M18 12h2M6 6l1.5 1.5M16.5 16.5L18 18M6 18l1.5-1.5M16.5 7.5L18 6" />
    </svg>
  );
}

/** Disposed (off-track terminal) — small cross */
export function GlyphDisposed(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M8 8l8 8M16 8l-8 8" />
    </svg>
  );
}

export type LifecycleStage =
  | "CREATED"
  | "COLONIZING"
  | "PINNING"
  | "FRUITING"
  | "HARVESTED"
  | "CONTAMINATED"
  | "DISPOSED";

export const LIFECYCLE_ORDER: LifecycleStage[] = [
  "CREATED",
  "COLONIZING",
  "PINNING",
  "FRUITING",
  "HARVESTED",
];

export const LIFECYCLE_GLYPH: Record<LifecycleStage, React.FC<GlyphProps>> = {
  CREATED: GlyphCreated,
  COLONIZING: GlyphColonizing,
  PINNING: GlyphPinning,
  FRUITING: GlyphFruiting,
  HARVESTED: GlyphHarvested,
  CONTAMINATED: GlyphContam,
  DISPOSED: GlyphDisposed,
};
