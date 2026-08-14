"use client";

import { useActionState } from "react";
import { submitAssignmentAction } from "@/actions/assignment.actions";
import type { ActionResult } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionResult = { success: false };

type SubmissionUploadProps = {
  assignmentId: string;
  canSubmit: boolean;
  helperText?: string;
};

export function SubmissionUpload({ assignmentId, canSubmit, helperText }: SubmissionUploadProps) {
  const [state, formAction, pending] = useActionState(submitAssignmentAction, initialState);

  if (!canSubmit) {
    return helperText ? (
      <p className="text-sm text-muted-foreground">{helperText}</p>
    ) : null;
  }

  return (
    <form action={formAction} encType="multipart/form-data" className="space-y-3 rounded-lg border border-border bg-white/80 p-4">
      <input type="hidden" name="assignmentId" value={assignmentId} />
      <div className="space-y-2">
        <Label htmlFor="files">Upload homework (photo or PDF)</Label>
        <Input id="files" name="files" type="file" accept="application/pdf,image/*" multiple required />
        {state.fieldErrors?.files?.[0] ? (
          <p className="text-sm text-muted-foreground">{state.fieldErrors.files[0]}</p>
        ) : null}
      </div>
      {state.message ? <p className="text-sm text-muted-foreground">{state.message}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Uploading..." : "Submit assignment"}
      </Button>
    </form>
  );
}
