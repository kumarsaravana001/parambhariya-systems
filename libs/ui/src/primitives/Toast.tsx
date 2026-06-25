import * as React from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "../utils/cn";

/**
 * Minimal dependency-free toast. A module-level store feeds a single <Toaster>
 * mounted in the app shell. Call `toast.success(...)` / `toast.error(...)` from
 * anywhere (e.g. mutation callbacks) so the user always gets "saved / failed"
 * feedback — critical on a flaky grow-room connection.
 */

type Tone = "success" | "error" | "info";
interface ToastItem { id: number; tone: Tone; message: string }

let items: ToastItem[] = [];
let counter = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function dismiss(id: number) {
  items = items.filter((t) => t.id !== id);
  emit();
}
function push(tone: Tone, message: string, ms: number) {
  const id = ++counter;
  items = [...items, { id, tone, message }];
  emit();
  if (ms > 0) setTimeout(() => dismiss(id), ms);
  return id;
}

export const toast = {
  success: (message: string) => push("success", message, 3000),
  error: (message: string) => push("error", message, 6000),
  info: (message: string) => push("info", message, 3500),
};

const TONE: Record<Tone, { cls: string; Icon: typeof CheckCircle2 }> = {
  success: { cls: "border-success-fg/30 text-success-fg", Icon: CheckCircle2 },
  error: { cls: "border-danger-fg/40 text-danger-fg", Icon: AlertTriangle },
  info: { cls: "border-info-fg/30 text-info-fg", Icon: Info },
};

export function Toaster() {
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    listeners.add(force);
    return () => { listeners.delete(force); };
  }, []);
  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      aria-live="polite"
      role="status"
      className={cn(
        "fixed z-[var(--z-toast)] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm pointer-events-none",
        // mobile: bottom-centre, clear of the bottom nav + home indicator
        "left-1/2 -translate-x-1/2 bottom-[calc(5rem+var(--safe-bottom))]",
        // desktop: bottom-right
        "md:left-auto md:right-4 md:translate-x-0 md:bottom-4"
      )}
    >
      {items.map((t) => {
        const { cls, Icon } = TONE[t.tone];
        return (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-2.5 rounded-lg border bg-surface-card shadow-lg px-3.5 py-3",
              "data-[state]:animate-in",
              cls
            )}
          >
            <Icon className="h-5 w-5 shrink-0 mt-0.5" aria-hidden />
            <p className="flex-1 text-sm text-text-primary leading-snug">{t.message}</p>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => dismiss(t.id)}
              className="shrink-0 grid place-items-center rounded-md p-1.5 -m-1 text-text-muted hover:bg-surface-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        );
      })}
    </div>,
    document.body
  );
}
