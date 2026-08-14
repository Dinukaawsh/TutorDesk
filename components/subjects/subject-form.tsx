"use client";

import { useActionState, useEffect } from "react";
import { createSubjectAction, updateSubjectAction } from "@/actions/subject.actions";
import type { ActionResult } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";
import { useReportFormModalPending } from "@/components/modals/form-modal-context";
import { FormPendingReporter } from "@/components/modals/form-pending-reporter";
import type { SubjectCardData } from "@/components/subjects/subject-card";

const initialState: ActionResult = { success: false };

type SubjectFormProps = {
  subject?: SubjectCardData | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  formId?: string;
  hideActions?: boolean;
};

export function SubjectForm({ subject, onSuccess, onCancel, formId, hideActions }: SubjectFormProps) {
  const action = subject ? updateSubjectAction : createSubjectAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  useActionToast(state);
  useReportFormModalPending(pending);

  useEffect(() => {
    if (state.success) {
      onSuccess?.();
    }
  }, [state.success, onSuccess]);

  const showActions = !formId && !hideActions;

  return (
    <form action={formAction} id={formId} noValidate className="space-y-4">
      <FormPendingReporter />
      {subject ? <input type="hidden" name="id" value={subject.id} /> : null}
      <div className="space-y-2">
        <Label htmlFor="subject-name" required>
          Name
        </Label>
        <Input
          id="subject-name"
          name="name"
          defaultValue={subject?.name ?? ""}
        />
        <FieldError message={state.fieldErrors?.name?.[0]} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject-description">Description</Label>
        <Textarea
          id="subject-description"
          name="description"
          rows={3}
          defaultValue={subject?.description ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject-monthly-fee">Monthly fee (LKR)</Label>
        <Input
          id="subject-monthly-fee"
          name="monthlyFee"
          type="number"
          min={0}
          step="0.01"
          placeholder="Optional"
          defaultValue={subject?.monthlyFee ?? ""}
        />
        <FieldError message={state.fieldErrors?.monthlyFee?.[0]} />
      </div>
      <ColorPicker
        id="subject-color"
        label="Color (hex)"
        defaultValue={subject?.color ?? "#2563eb"}
      />
      <FieldError message={state.fieldErrors?.color?.[0]} />
      {state.message && !state.success ? (
        <p className="rounded-lg border border-border bg-muted px-3 py-2 text-sm">
          {state.message}
        </p>
      ) : null}
      {showActions ? (
      <div className={onCancel ? "grid grid-cols-2 gap-2" : "flex"}>
        {onCancel ? (
          <Button type="button" variant="outline" className="rounded-[4px]" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" className="rounded-[4px]" disabled={pending}>
          {pending ? "Saving..." : subject ? "Update subject" : "Create subject"}
        </Button>
      </div>
      ) : null}
    </form>
  );
}
