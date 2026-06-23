import { createFileRoute } from "@tanstack/react-router";
import {
  Card, Button, EmptyState,
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
  FormField, Input,
} from "@parambhariya/ui";
import { FolderTree, Plus } from "lucide-react";
import { categoryTree, categoryCount, type CategoryNode } from "../data/lab";
import { HierarchyTree, type TreeItem } from "../lab/HierarchyTree";

const toTree = (n: CategoryNode): TreeItem => ({ id: n.id, name: n.name, children: n.children?.map(toTree) });

function NewCategoryModal() {
  return (
    <Dialog>
      <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4" /> New category</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New Root Category</DialogTitle></DialogHeader>
        <FormField label="Category name" htmlFor="cat-name" required>
          <Input id="cat-name" placeholder="Bacteria, Fungi, Control strains…" />
        </FormField>
        <DialogFooter>
          <DialogClose asChild><Button variant="secondary" size="sm">Cancel</Button></DialogClose>
          <Button size="sm">Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Categories() {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Categories</h2>
          <p className="text-sm text-text-muted">{categoryCount()} categories</p>
        </div>
        <NewCategoryModal />
      </div>
      {categoryTree.length === 0 ? (
        <EmptyState icon={<FolderTree />} title="No categories yet"
          description="Group cultures by taxonomy or experiment type using a hierarchical tree."
          action={<Button size="sm"><Plus className="h-4 w-4" /> Create first category</Button>} />
      ) : (
        <Card padding="md">
          <HierarchyTree items={categoryTree.map(toTree)} icon={() => <FolderTree />} />
        </Card>
      )}
    </div>
  );
}

export const Route = createFileRoute("/lab/categories")({ component: Categories });
