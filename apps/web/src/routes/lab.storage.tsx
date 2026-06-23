import { createFileRoute } from "@tanstack/react-router";
import {
  Card, Button, EmptyState,
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
  FormField, Input, Textarea, Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@parambhariya/ui";
import { Database, Plus, Building2, DoorOpen, Snowflake, Refrigerator, Grid3x3, Package, Box, Thermometer } from "lucide-react";
import { storageTree, storageCount, type StorageNode } from "../data/lab";
import { HierarchyTree, type TreeItem } from "../lab/HierarchyTree";

const STORAGE_TYPES = ["building", "room", "incubator", "refrigerator", "freezer", "ultra low freezer", "rack", "box", "shelf", "position"];

const TYPE_ICON: Record<string, React.ReactNode> = {
  building: <Building2 />, room: <DoorOpen />, incubator: <Thermometer />,
  refrigerator: <Refrigerator />, freezer: <Snowflake />, "ultra low freezer": <Snowflake />,
  rack: <Grid3x3 />, box: <Box />, shelf: <Package />, position: <Package />,
};

const toTree = (n: StorageNode): TreeItem => ({
  id: n.id, name: n.name, badge: n.tempRange ?? undefined,
  children: n.children?.map(toTree),
});

function NewLocationModal() {
  return (
    <Dialog>
      <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4" /> New location</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New Root Location</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-4">
          <FormField label="Name" htmlFor="l-name" required><Input id="l-name" placeholder="Freezer A, Rack 3…" /></FormField>
          <FormField label="Type" htmlFor="l-type">
            <Select>
              <SelectTrigger id="l-type"><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>{STORAGE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
          <FormField label="Temperature range" htmlFor="l-temp"><Input id="l-temp" placeholder="−80 °C, 4 °C, 37 °C" /></FormField>
          <FormField label="Description" htmlFor="l-desc"><Textarea id="l-desc" placeholder="Optional notes" /></FormField>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="secondary" size="sm">Cancel</Button></DialogClose>
          <Button size="sm">Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Storage() {
  const roots = storageTree.length;
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Storage Locations</h2>
          <p className="text-sm text-text-muted">{storageCount()} locations · {roots} root node{roots !== 1 ? "s" : ""}</p>
        </div>
        <NewLocationModal />
      </div>
      {storageTree.length === 0 ? (
        <EmptyState icon={<Database />} title="No storage locations yet"
          description="Add buildings, rooms, freezers, racks and boxes to track where cultures are stored."
          action={<Button size="sm"><Plus className="h-4 w-4" /> Add first location</Button>} />
      ) : (
        <Card padding="md">
          <HierarchyTree items={storageTree.map(toTree)} icon={(it) => {
            const node = findType(storageTree, it.id);
            return node ? TYPE_ICON[node] : null;
          }} />
        </Card>
      )}
    </div>
  );
}

function findType(nodes: StorageNode[], id: string): string | null {
  for (const n of nodes) {
    if (n.id === id) return n.type;
    if (n.children) { const r = findType(n.children, id); if (r) return r; }
  }
  return null;
}

export const Route = createFileRoute("/lab/storage")({ component: Storage });
