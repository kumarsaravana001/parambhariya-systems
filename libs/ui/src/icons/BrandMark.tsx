import * as React from "react";

/**
 * Parambhariya brand mark — a mushroom whose cap doubles as a leaf, growing
 * from a mycelium root system. Hand-drawn per the design spec's named brand
 * exception; nods to the 2026 deck identity ("mycelium can heal the earth").
 * Inherits currentColor; sized via font-size / width+height.
 */
export function BrandMark(props: React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      width="1em"
      height="1em"
      fill="none"
      role="img"
      aria-label="Parambhariya"
      {...props}
    >
      {/* cap / leaf — a mushroom cap with a leaf vein, drawn as one form */}
      <path
        d="M16 4C9.5 4 5 8.7 5 13.3c0 1 .8 1.7 1.8 1.7h18.4c1 0 1.8-.7 1.8-1.7C27 8.7 22.5 4 16 4Z"
        fill="currentColor"
      />
      {/* leaf vein down the cap */}
      <path
        d="M16 5.2v9.8M16 8.5c1.6.3 2.7 1.1 3.4 2.3M16 8.5c-1.6.3-2.7 1.1-3.4 2.3"
        stroke="var(--surface-card, #fff)"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* stem */}
      <path
        d="M13.6 15h4.8v6.2c0 1-.5 1.8-1.4 2.2l-.9.4-.9-.4c-.9-.4-1.6-1.2-1.6-2.2V15Z"
        fill="currentColor"
      />
      {/* mycelium roots */}
      <path
        d="M16 24v4M16 26c-1.7.2-2.9 1-3.7 2.4M16 26c1.7.2 2.9 1 3.7 2.4M13.2 24.6c-1 .6-1.7 1.5-2 2.7M18.8 24.6c1 .6 1.7 1.5 2 2.7"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
