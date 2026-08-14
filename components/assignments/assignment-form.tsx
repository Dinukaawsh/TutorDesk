"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { AssignmentTarget } from "@prisma/client";
import type { ActionResult } from "@/actions/auth.actions";
import { FormPendingReporter } from "@/components/modals/form-pending-reporter";
import { useReportFormModalPending } from "@/components/modals/form-modal-context";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
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
import { useActionToast } from "@/hooks/use-action-toast";
import { cn } from "@/lib/utils";

type SubjectOption = { id: string; name: string };
type StudentOption = { id: string; name: string; grade: string | null };

type AssignmentFormProps = {
  action: (
    prev: ActionResult | undefined,
    formData: FormData,
  ) => Promise<ActionResult>;
  subjects: SubjectOption[];
  students: StudentOption[];
  formId?: string;
  hideActions?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const initialState: ActionResult = { success: false };

export function AssignmentForm({
  action,
  subjects,
  students,
  formId,
  hideActions,
  onSuccess,
  onCancel,
}: AssignmentFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [targetType, setTargetType] = useState<AssignmentTarget>(AssignmentTarget.GRADE);
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [individualStudentId, setIndividualStudentId] = useState(students[0]?.id ?? "");

  useActionToast(state);
  useReportFormModalPending(pending);

  useEffect(() => {
    if (state.success) {
      onSuccess?.();
    }
  }, [state.success, onSuccess]);

  const showActions = !formId && !hideActions;

  return (
    <form
      action={formAction}
      id={formId}
      noValidate
      className={cn("space-y-4", !formId && "mx-auto max-w-2xl")}
    >
      <FormPendingReporter />
      <input type="hidden" name="targetType" value={targetType} />
      <input type="hidden" name="subjectId" value={subjectId} />
      {targetType === AssignmentTarget.INDIVIDUAL ? (
        <input type="hidden" name="individualStudentId" value={individualStudentId} />
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="title" required>
            Title
          </Label>
          <Input id="title" name="title" />
          <FieldError message={state.fieldErrors?.title?.[0]} />
        </div>
        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="instructions">Instructions</Label>
          <Textarea id="instructions" name="instructions" rows={4} />
        </div>
        <div className="space-y-2">
          <Label required>Subject</Label>
          <Select value={subjectId} onValueChange={setSubjectId}>
            <SelectTrigger>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={state.fieldErrors?.subjectId?.[0]} />
        </div>
        <div className="space-y-2">
          <Label>Target</Label>
          <Select
            value={targetType}
            onValueChange={(value) => setTargetType(value as AssignmentTarget)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={AssignmentTarget.GRADE}>Whole grade</SelectItem>
              <SelectItem value={AssignmentTarget.INDIVIDUAL}>Individual student</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {targetType === AssignmentTarget.GRADE ? (
          <div className="space-y-2">
            <Label htmlFor="grade" required>
              Grade
            </Label>
            <Input id="grade" name="grade" placeholder="e.g. 10" />
            <FieldError message={state.fieldErrors?.grade?.[0]} />
          </div>
        ) : (
          <div className="space-y-2">
            <Label required>Student</Label>
            <Select value={individualStudentId} onValueChange={setIndividualStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name}
                    {student.grade ? ` (Grade ${student.grade})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={state.fieldErrors?.individualStudentId?.[0]} />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="deadline" required>
            Deadline
          </Label>
          <Input id="deadline" name="deadline" type="datetime-local" />
          <FieldError message={state.fieldErrors?.deadline?.[0]} />
        </div>
        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="attachment">Attachment (optional)</Label>
          <Input id="attachment" name="attachment" type="file" accept="application/pdf,image/*" />
        </div>
      </div>
      {state.message && !state.success ? (
        <p className="rounded-lg border border-border bg-muted px-3 py-2 text-sm">{state.message}</p>
      ) : null}
      {showActions ? (
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Creating..." : "Create assignment"}
          </Button>
          {onCancel ? (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          ) : (
            <Button type="button" variant="outline" asChild>
              <Link href="/teacher/assignments">Cancel</Link>
            </Button>
          )}
        </div>
      ) : null}
    </form>
  );
}
