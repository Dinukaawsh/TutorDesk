"use client";

import { useActionState } from "react";
import { SubmissionStatus } from "@prisma/client";
import {
  gradeSubmissionAction,
  reopenSubmissionPortalAction,
} from "@/actions/assignment.actions";
import type { ActionResult } from "@/actions/auth.actions";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const initialState: ActionResult = { success: false };

type GradingPanelProps = {
  submissionId: string;
  defaultMarks?: number | null;
  defaultStatus?: SubmissionStatus;
  defaultFeedback?: string | null;
  defaultResubmitDeadline?: Date | string | null;
};

function toDateTimeLocalValue(value: Date | string | null | undefined) {
  if (!value) {
    return "";
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function GradingPanel({
  submissionId,
  defaultMarks,
  defaultStatus,
  defaultFeedback,
  defaultResubmitDeadline,
}: GradingPanelProps) {
  const [state, formAction, pending] = useActionState(gradeSubmissionAction, initialState);
  const [reopenOpen, setReopenOpen] = useState(false);
  const [status, setStatus] = useState<string>(
    defaultStatus === SubmissionStatus.PASSED || defaultStatus === SubmissionStatus.FAILED
      ? defaultStatus
      : SubmissionStatus.PASSED,
  );

  const showReopen =
    defaultStatus === SubmissionStatus.SUBMITTED || defaultStatus === SubmissionStatus.PASSED;

  return (
    <div className="space-y-3">
      <form action={formAction} className="space-y-3 rounded-lg border border-border bg-white/80 p-4">
        <input type="hidden" name="submissionId" value={submissionId} />
        <input type="hidden" name="status" value={status} />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`marks-${submissionId}`}>Marks (0–100)</Label>
            <Input
              id={`marks-${submissionId}`}
              name="marks"
              type="number"
              min={0}
              max={100}
              defaultValue={defaultMarks ?? ""}
              required
            />
            {state.fieldErrors?.marks?.[0] ? (
              <p className="text-sm text-muted-foreground">{state.fieldErrors.marks[0]}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>Result</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SubmissionStatus.PASSED}>Passed</SelectItem>
                <SelectItem value={SubmissionStatus.FAILED}>Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {status === SubmissionStatus.FAILED ? (
          <div className="space-y-2">
            <Label htmlFor={`resubmit-${submissionId}`}>Resubmit deadline</Label>
            <Input
              id={`resubmit-${submissionId}`}
              name="resubmitDeadline"
              type="datetime-local"
              defaultValue={toDateTimeLocalValue(defaultResubmitDeadline)}
              required
            />
            {state.fieldErrors?.resubmitDeadline?.[0] ? (
              <p className="text-sm text-muted-foreground">{state.fieldErrors.resubmitDeadline[0]}</p>
            ) : null}
          </div>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor={`feedback-${submissionId}`}>Feedback</Label>
          <Textarea
            id={`feedback-${submissionId}`}
            name="feedback"
            rows={3}
            defaultValue={defaultFeedback ?? ""}
          />
        </div>
        {state.message ? <p className="text-sm text-muted-foreground">{state.message}</p> : null}
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving..." : "Save grade"}
        </Button>
      </form>

      {showReopen ? (
        <>
          <Button type="button" variant="outline" size="sm" onClick={() => setReopenOpen(true)}>
            Reopen portal
          </Button>
          <ConfirmModal
            open={reopenOpen}
            onOpenChange={setReopenOpen}
            title="Reopen submission portal"
            message="Set a resubmit deadline so the student can upload again."
            confirmLabel="Reopen portal"
            formAction={reopenSubmissionPortalAction}
            onSuccess={() => setReopenOpen(false)}
          >
            <input type="hidden" name="submissionId" value={submissionId} />
            <div className="space-y-2">
              <Label htmlFor={`reopen-deadline-${submissionId}`}>Resubmit deadline</Label>
              <Input
                id={`reopen-deadline-${submissionId}`}
                name="resubmitDeadline"
                type="datetime-local"
                required
              />
            </div>
          </ConfirmModal>
        </>
      ) : null}
    </div>
  );
}
