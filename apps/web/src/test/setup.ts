import "@testing-library/jest-dom/vitest";
import { vi, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => cleanup());

// jsdom is missing a few browser APIs that Radix + the app touch.
class RO { observe() {} unobserve() {} disconnect() {} }
(globalThis as any).ResizeObserver = RO;

if (!window.matchMedia) {
  window.matchMedia = (q: string) => ({
    matches: false, media: q, onchange: null,
    addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false,
  }) as any;
}
(Element.prototype as any).scrollIntoView ??= () => {};
(Element.prototype as any).hasPointerCapture ??= () => false;
(Element.prototype as any).setPointerCapture ??= () => {};
(Element.prototype as any).releasePointerCapture ??= () => {};

// keep the demo control loop from firing real timers during unit tests
vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => setTimeout(() => cb(0), 0));
