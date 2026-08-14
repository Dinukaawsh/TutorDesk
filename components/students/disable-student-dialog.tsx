"use client";

import { useActionState, useEffect } from "react";
import { disableStudentAction } from "@/actions/student.actions";
import type { ActionResult } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: ActionResult = { success: false };

type DisableStudentDialogProps = {
  studentId: string | null;
  studentName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DisableStudentDialog({
  studentId,
  studentName,
  open,
  onOpenChange,
}: DisableStudentDialogProps) {
  const [state, formAction, pending] = useActionState(disableStudentAction, initialState);

  useEffect(() => {
    if (state.success) {
      onOpenChange(false);
    }
  }, [state.success, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Disable student</DialogTitle>
          <DialogDescription>
            {studentName
              ? `Provide a reason for disabling ${studentName}.`
              : "Provide a reason for disabling this student."}
          </DialogDescription>
        </DialogHeader>
        {studentId ? (
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="id" value={studentId} />
            <div className="space-y-2">
              <Label htmlFor="disable-reason">Reason</Label>
              <Textarea id="disable-reason" name="reason" rows={3} required />
              {state.fieldErrors?.reason?.[0] ? (
                <p className="text-sm text-black/70">{state.fieldErrors.reason[0]}</p>
              ) : null}
            </div>
            {state.message && !state.success ? (
              <p className="text-sm">{state.message}</p>
            ) : null}
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? "Disabling..." : "Disable account"}
            </Button>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
