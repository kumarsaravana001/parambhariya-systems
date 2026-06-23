import type { TreeItem } from "../lab/HierarchyTree";

interface Flat { id: string; parentId?: string | null; name: string; [k: string]: any }

/** Build a parent→child tree from a flat list with parentId. */
export function buildTree<T extends Flat>(rows: T[], badge?: (r: T) => string | undefined): TreeItem[] {
  const byId = new Map<string, TreeItem & { _row: T }>();
  for (const r of rows) byId.set(r.id, { id: r.id, name: r.name, badge: badge?.(r), children: [], _row: r });
  const roots: TreeItem[] = [];
  for (const r of rows) {
    const node = byId.get(r.id)!;
    if (r.parentId && byId.has(r.parentId)) byId.get(r.parentId)!.children!.push(node);
    else roots.push(node);
  }
  // strip empty children arrays so leaf nodes render correctly
  const clean = (n: TreeItem): TreeItem => ({ ...n, children: n.children && n.children.length ? n.children.map(clean) : undefined });
  return roots.map(clean);
}
