"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ArchiveIcon, ArchiveRestoreIcon, FolderEditIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  bulkArchive,
  bulkDelete,
  bulkChangeCategory,
  bulkRestore,
} from "@/actions/products";

interface BulkActionBarProps {
  selectedIds: number[];
  categories: string[];
  onClear: () => void;
}

export function BulkActionBar({
  selectedIds,
  categories,
  onClear,
}: BulkActionBarProps) {
  const count = selectedIds.length;
  const [isPending, startTransition] = useTransition();
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<string | null>(null);

  function run(
    action: () => Promise<{ ok: boolean; affected: number }>,
    label: string
  ) {
    startTransition(async () => {
      const result = await action().catch((e: unknown) => {
        toast.error(
          e instanceof Error ? e.message : `Failed to ${label.toLowerCase()}`
        );
        return null;
      });
      if (result) {
        toast.success(`${label}: ${result.affected} product${result.affected !== 1 ? "s" : ""}`);
        onClear();
      }
    });
  }

  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 rounded-xl bg-popover px-4 py-2.5 shadow-lg ring-1 ring-foreground/10 text-sm">
        <span className="font-medium text-foreground mr-1">
          {count} selected
        </span>

        <Separator orientation="vertical" className="h-4 mx-1" />

        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={() => run(() => bulkArchive(selectedIds), "Archived")}
        >
          <ArchiveIcon />
          Archive
        </Button>

        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={() => run(() => bulkRestore(selectedIds), "Restored")}
        >
          <ArchiveRestoreIcon />
          Restore
        </Button>

        {/* Change category dialog */}
        <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
          <DialogTrigger
            render={<Button variant="ghost" size="sm" disabled={isPending} />}
          >
            <FolderEditIcon />
            Change category…
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change category</DialogTitle>
              <DialogDescription>
                Choose a new category for {count} selected product{count !== 1 ? "s" : ""}.
              </DialogDescription>
            </DialogHeader>
            <Select value={newCategory} onValueChange={(v) => setNewCategory(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category…" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button
                disabled={!newCategory || isPending}
                onClick={() => {
                  if (!newCategory) return;
                  setCategoryDialogOpen(false);
                  run(
                    () => bulkChangeCategory(selectedIds, newCategory),
                    "Category updated"
                  );
                  setNewCategory(null);
                }}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Separator orientation="vertical" className="h-4 mx-1" />

        {/* Delete confirm dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogTrigger
            render={<Button variant="destructive" size="sm" disabled={isPending} />}
          >
            <Trash2Icon />
            Delete permanently
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete {count} product{count !== 1 ? "s" : ""}?</DialogTitle>
              <DialogDescription>
                This cannot be undone. The selected products will be permanently removed.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="destructive"
                disabled={isPending}
                onClick={() => {
                  setDeleteDialogOpen(false);
                  run(() => bulkDelete(selectedIds), "Deleted");
                }}
              >
                Delete permanently
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Separator orientation="vertical" className="h-4 mx-1" />

        <Button variant="ghost" size="sm" onClick={onClear} disabled={isPending}>
          Clear
        </Button>
      </div>
    </div>
  );
}
