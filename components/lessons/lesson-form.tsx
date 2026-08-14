"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { LessonType } from "@prisma/client";
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

type LessonFormProps = {
  action: (
    prev: ActionResult | undefined,
    formData: FormData,
  ) => Promise<ActionResult>;
  subjects: SubjectOption[];
  lessonId?: string;
  defaultValues?: {
    title: string;
    description?: string | null;
    type: LessonType;
    subjectId: string;
    grade: string;
    contentUrl: string;
  };
  formId?: string;
  hideActions?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const initialState: ActionResult = { success: false };

export function LessonForm({
  action,
  subjects,
  lessonId,
  defaultValues,
  formId,
  hideActions,
  onSuccess,
  onCancel,
}: LessonFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [type, setType] = useState<LessonType>(
    defaultValues?.type ?? LessonType.PDF,
  );
  const [subjectId, setSubjectId] = useState(
    defaultValues?.subjectId ?? subjects[0]?.id ?? "",
  );

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
      {lessonId ? <input type="hidden" name="lessonId" value={lessonId} /> : null}
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="subjectId" value={subjectId} />
      <div className="space-y-2">
        <Label htmlFor="title" required>
          Title
        </Label>
        <Input id="title" name="title" defaultValue={defaultValues?.title} />
        <FieldError message={state.fieldErrors?.title?.[0]} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={3} defaultValue={defaultValues?.description ?? ""} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
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
          <Label htmlFor="grade" required>
            Grade
          </Label>
          <Input id="grade" name="grade" defaultValue={defaultValues?.grade} />
          <FieldError message={state.fieldErrors?.grade?.[0]} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Lesson type</Label>
        <Select value={type} onValueChange={(value) => setType(value as LessonType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={LessonType.PDF}>PDF</SelectItem>
            <SelectItem value={LessonType.VIDEO}>Video link</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {type === LessonType.PDF ? (
        <div className="space-y-2">
          <Label htmlFor="pdf" required={!lessonId}>
            PDF file
          </Label>
          <Input id="pdf" name="pdf" type="file" accept="application/pdf" />
          <p className="text-xs text-muted-foreground">
            {lessonId ? "Leave empty to keep the current PDF." : "Required for new PDF lessons (max 15 MB)."}
          </p>
          <FieldError message={state.fieldErrors?.pdf?.[0]} />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="videoUrl" required>
            Video URL
          </Label>
          <Input
            id="videoUrl"
            name="videoUrl"
            type="url"
            placeholder="YouTube, Vimeo, or direct link"
            defaultValue={defaultValues?.type === LessonType.VIDEO ? defaultValues.contentUrl : ""}
          />
          <FieldError message={state.fieldErrors?.videoUrl?.[0]} />
        </div>
      )}
      {state.message && !state.success ? (
        <p className="rounded-lg border border-border bg-muted px-3 py-2 text-sm">{state.message}</p>
      ) : null}
      {showActions ? (
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : lessonId ? "Update lesson" : "Create lesson"}
          </Button>
          {onCancel ? (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          ) : (
            <Button type="button" variant="outline" asChild>
              <Link href="/teacher/lessons">Cancel</Link>
            </Button>
          )}
        </div>
      ) : null}
    </form>
  );
}
