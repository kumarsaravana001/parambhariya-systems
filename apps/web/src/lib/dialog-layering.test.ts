import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Regression guards for two Lab-Portal dialog bugs found 2026-06-24:
 *  1. Select/Popover dropdowns rendered BEHIND dialogs (z-dropdown < z-modal).
 *  2. A closed dialog overlay kept `pointer-events: auto` (Radix inline style
 *     on React 19) and froze the whole page after one save.
 * These assert the source-level invariants that fix them, since the actual
 * symptoms are CSS-layout effects jsdom can't compute.
 */

// vitest runs with cwd = apps/web; repo root is two levels up.
const repoFile = (rel: string) => readFileSync(resolve(process.cwd(), "../..", rel), "utf8");

describe("dialog layering invariants", () => {
  it("floating content (dropdown) layers ABOVE the modal", () => {
    const css = repoFile("libs/ui/src/styles/tokens.css");
    const num = (name: string) => {
      const m = css.match(new RegExp(`--${name}:\\s*(\\d+)`));
      expect(m, `--${name} not found`).toBeTruthy();
      return Number(m![1]);
    };
    const dropdown = num("z-dropdown"), modal = num("z-modal"), overlay = num("z-overlay"), toast = num("z-toast");
    // a select opened inside a dialog must paint over it
    expect(dropdown).toBeGreaterThan(modal);
    expect(modal).toBeGreaterThan(overlay);
    // tooltips/toasts stay on top of everything
    expect(toast).toBeGreaterThan(dropdown);
  });

  it("a closed dialog + overlay cannot capture pointer events", () => {
    const dialog = repoFile("libs/ui/src/primitives/Dialog.tsx");
    // `!` → !important, required to beat Radix's inline pointer-events:auto.
    const guards = dialog.match(/data-\[state=closed\]:pointer-events-none!/g) ?? [];
    expect(guards.length, "overlay AND content must force pointer-events:none when closed").toBeGreaterThanOrEqual(2);
  });
});
