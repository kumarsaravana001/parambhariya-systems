import * as React from "react";
import { ChevronRight, Plus } from "lucide-react";
import { Tag } from "@parambhariya/ui";

export interface TreeItem {
  id: string;
  name: string;
  badge?: string;
  children?: TreeItem[];
}

function Node({ item, depth, icon }: { item: TreeItem; depth: number; icon?: (it: TreeItem) => React.ReactNode }) {
  const [open, setOpen] = React.useState(depth < 2);
  const hasChildren = !!item.children?.length;
  return (
    <li>
      <div
        className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-surface-muted"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Collapse" : "Expand"}
            className="shrink-0 rounded-sm p-0.5 text-text-muted hover:text-text-primary"
          >
            <ChevronRight className={`h-4 w-4 transition-transform duration-[120ms] ${open ? "rotate-90" : ""}`} />
          </button>
        ) : (
          <span className="w-5 shrink-0" />
        )}
        {icon && <span className="text-text-muted [&_svg]:h-4 [&_svg]:w-4 shrink-0" aria-hidden>{icon(item)}</span>}
        <span className="flex-1 text-sm text-text-primary truncate">{item.name}</span>
        {item.badge && <Tag tone="neutral" size="sm">{item.badge}</Tag>}
        <button
          type="button"
          aria-label={`Add child to ${item.name}`}
          className="opacity-0 group-hover:opacity-100 shrink-0 rounded-sm p-1 text-text-muted hover:bg-surface-card hover:text-brand-700 transition-opacity"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      {hasChildren && open && (
        <ul>{item.children!.map((c) => <Node key={c.id} item={c} depth={depth + 1} icon={icon} />)}</ul>
      )}
    </li>
  );
}

export function HierarchyTree({ items, icon }: { items: TreeItem[]; icon?: (it: TreeItem) => React.ReactNode }) {
  return <ul className="flex flex-col">{items.map((i) => <Node key={i.id} item={i} depth={0} icon={icon} />)}</ul>;
}
