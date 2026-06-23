import * as React from "react";
import { Card } from "../primitives/Card";
import { Skeleton } from "../primitives/Skeleton";

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3" aria-busy aria-live="polite">
      {Array.from({ length: rows }).map((_, i) => (
        <Card key={i} padding="md" className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-5 w-16 rounded-md" />
        </Card>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy aria-live="polite">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="flex flex-col gap-3">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-8 w-2/3" />
          </Card>
        ))}
      </div>
      <Card padding="lg" className="flex flex-col gap-3">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </Card>
    </div>
  );
}
