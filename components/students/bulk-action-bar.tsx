"use client";

import { useActionState, useEffect, useState } from "react";
import {
  bulkDisableStudentsAction,
  bulkEnableStudentsAction,
} from "@/actions/student.actions";
import type { ActionResult } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: ActionResult = { success: false };

type BulkActionBarProps = {
  selectedIds: string[];
  onClear: () => void;
};

export function BulkActionBar({ selectedIds, onClear }: BulkActionBarProps) {
  const [disableOpen, setDisableOpen] = useState(false);
  const [disableState, disableAction, disablePending] = useActionState(
    bulkDisableStudentsAction,
    initialState,
  );
  const [enableState, enableAction, enablePending] = useActionState(
    bulkEnableStudentsAction,
    initialState,
  );

  useEffect(() => {
    if (disableState.success || enableState.success) {
      setDisableOpen(false);
      onClear();
    }
  }, [disableState.success, enableState.success, onClear]);

  if (selectedIds.length === 0) {
    return null;
  }

  return (
    <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white p-4 shadow-md">
      <p className="text-sm font-medium">{selectedIds.length} selected</p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onClear}>
          Clear
        </Button>
        <form action={enableAction}>
          {selectedIds.map((id) => (
            <input key={id} type="hidden" name="ids" value={id} />
          ))}
          <Button type="submit" size="sm" disabled={enablePending}>
            {enablePending ? "Enabling..." : "Enable selected"}
          </Button>
        </form>
        <Button type="button" size="sm" variant="destructive" onClick={() => setDisableOpen(true)}>
          Disable selected
        </Button>
      </div>

      <Dialog open={disableOpen} onOpenChange={setDisableOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable selected students</DialogTitle>
          </DialogHeader>
          <form action={disableAction} className="space-y-4">
            {selectedIds.map((id) => (
              <input key={id} type="hidden" name="ids" value={id} />
            ))}
            <div className="space-y-2">
              <Label htmlFor="bulk-disable-reason">Shared reason</Label>
              <Textarea id="bulk-disable-reason" name="reason" rows={3} required />
              {disableState.fieldErrors?.reason?.[0] ? (
                <p className="text-sm text-black/70">{disableState.fieldErrors.reason[0]}</p>
              ) : null}
            </div>
            <Button type="submit" variant="destructive" disabled={disablePending}>
              {disablePending ? "Disabling..." : "Disable all selected"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
