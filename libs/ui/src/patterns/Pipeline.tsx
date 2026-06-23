import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../utils/cn";
import { LIFECYCLE_GLYPH, LIFECYCLE_ORDER, type LifecycleStage } from "../icons/lifecycle";

const FILL: Record<LifecycleStage, string> = {
  CREATED:      "bg-life-created-bg text-life-created-fg",
  COLONIZING:   "bg-life-colonizing-bg text-life-colonizing-fg",
  PINNING:      "bg-life-pinning-bg text-life-pinning-fg",
  FRUITING:     "bg-life-fruiting-bg text-life-fruiting-fg",
  HARVESTED:    "bg-life-harvested-bg text-life-harvested-fg",
  CONTAMINATED: "bg-life-contam-bg text-life-contam-fg",
  DISPOSED:     "bg-neutral-bg text-neutral-fg",
};

export interface PipelineStageDatum {
  stage: LifecycleStage;
  count: number;
}

export interface PipelineProps extends React.HTMLAttributes<HTMLDivElement> {
  data: PipelineStageDatum[];
}

/**
 * Pipeline — horizontal throughput view of the 5 on-track lifecycle stages.
 * Each node shows the glyph + UPPER_SNAKE label + live count, connected by
 * arrows. A thin proportional bar under the row shows relative volume.
 */
export const Pipeline = React.forwardRef<HTMLDivElement, PipelineProps>(
  ({ className, data, ...props }, ref) => {
    const byStage = new Map(data.map((d) => [d.stage, d.count]));
    const counts = LIFECYCLE_ORDER.map((s) => byStage.get(s) ?? 0);
    const max = Math.max(1, ...counts);
    const total = counts.reduce((a, b) => a + b, 0);

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        <div className="flex items-stretch gap-1 overflow-x-auto pb-1">
          {LIFECYCLE_ORDER.map((stage, i) => {
            const Glyph = LIFECYCLE_GLYPH[stage];
            const count = counts[i]!;
            return (
              <React.Fragment key={stage}>
                <div className="flex flex-col items-center gap-2 min-w-[88px] flex-1">
                  <div className={cn("h-12 w-12 rounded-full grid place-items-center [&_svg]:h-6 [&_svg]:w-6", FILL[stage])}>
                    <Glyph aria-hidden />
                  </div>
                  <div className="text-center">
                    <div className="font-mono text-lg font-semibold text-text-primary leading-none">{count}</div>
                    <div className="mt-1 text-[10px] font-mono font-semibold uppercase tracking-[0.06em] text-text-muted">{stage}</div>
                  </div>
                  <div className="w-full h-1 rounded-full bg-surface-sunken overflow-hidden">
                    <div className="h-full bg-brand-500" style={{ width: `${(count / max) * 100}%` }} />
                  </div>
                </div>
                {i < LIFECYCLE_ORDER.length - 1 && (
                  <div className="flex items-center pt-3 text-text-muted shrink-0" aria-hidden>
                    <ChevronRight className="h-5 w-5" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
        <div className="mt-2 text-xs text-text-muted font-mono">{total} bags in pipeline</div>
      </div>
    );
  }
);
Pipeline.displayName = "Pipeline";
