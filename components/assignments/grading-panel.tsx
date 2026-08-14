"use client";

import { useActionState } from "react";
import { SubmissionStatus } from "@prisma/client";
import { gradeSubmissionAction } from "@/actions/assignment.actions";
import type { ActionResult } from "@/actions/auth.actions";
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
};

export function GradingPanel({
  submissionId,
  defaultMarks,
  defaultStatus,
  defaultFeedback,
}: GradingPanelProps) {
  const [state, formAction, pending] = useActionState(gradeSubmissionAction, initialState);
  const [status, setStatus] = useState<string>(
    defaultStatus === SubmissionStatus.PASSED || defaultStatus === SubmissionStatus.FAILED
      ? defaultStatus
      : SubmissionStatus.PASSED,
  );

  return (
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
  );
}
