"use client";

import { useActionState, useEffect, useState } from "react";
import { AnnouncementTarget } from "@prisma/client";
import { saveAnnouncementAction } from "@/actions/announcement.actions";
import type { ActionResult } from "@/actions/auth.actions";
import { useReportFormModalPending } from "@/components/modals/form-modal-context";
import { FormPendingReporter } from "@/components/modals/form-pending-reporter";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";

type SubjectOption = { id: string; name: string };
type InstituteOption = { id: string; name: string; location: string };

export type AnnouncementFormData = {
  id: string;
  title: string;
  body: string;
  targetType: AnnouncementTarget;
  subjectId: string | null;
  grade: string | null;
  instituteId: string | null;
};

type AnnouncementFormProps = {
  announcement?: AnnouncementFormData | null;
  subjects: SubjectOption[];
  institutes: InstituteOption[];
  grades: string[];
  onSuccess?: () => void;
  formId?: string;
  hideActions?: boolean;
};

const initial: ActionResult = { success: false };

const TARGET_OPTIONS = [
  { value: AnnouncementTarget.EVERYONE, label: "All students" },
  { value: AnnouncementTarget.SUBJECT, label: "Subject" },
  { value: AnnouncementTarget.GRADE, label: "Grade" },
  { value: AnnouncementTarget.SUBJECT_GRADE, label: "Subject and grade" },
  { value: AnnouncementTarget.INSTITUTE, label: "Institute" },
];

export function AnnouncementForm({
  announcement,
  subjects,
  institutes,
  grades,
  onSuccess,
  formId,
  hideActions,
}: AnnouncementFormProps) {
  const [state, formAction, pending] = useActionState(saveAnnouncementAction, initial);
  const [targetType, setTargetType] = useState<AnnouncementTarget>(
    announcement?.targetType ?? AnnouncementTarget.EVERYONE,
  );
  useActionToast(state);
  useReportFormModalPending(pending);

  useEffect(() => {
    if (state.success) {
      onSuccess?.();
    }
  }, [state.success, onSuccess]);

  const showActions = !formId && !hideActions;
  const isEdit = Boolean(announcement);
  const subjectRequired =
    targetType === AnnouncementTarget.SUBJECT ||
    targetType === AnnouncementTarget.SUBJECT_GRADE;
  const gradeRequired =
    targetType === AnnouncementTarget.GRADE ||
    targetType === AnnouncementTarget.SUBJECT_GRADE;
  const instituteRequired = targetType === AnnouncementTarget.INSTITUTE;

  return (
    <form action={formAction} id={formId} noValidate className="space-y-4">
      <FormPendingReporter />
      {announcement ? <input type="hidden" name="id" value={announcement.id} /> : null}
      <div className="space-y-2">
        <Label htmlFor="announcement-title" required>
          Title
        </Label>
        <Input
          id="announcement-title"
          name="title"
          defaultValue={announcement?.title ?? ""}
        />
        <FieldError message={state.fieldErrors?.title?.[0]} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="announcement-body" required>
          Message
        </Label>
        <Textarea
          id="announcement-body"
          name="body"
          rows={5}
          defaultValue={announcement?.body ?? ""}
        />
        <FieldError message={state.fieldErrors?.body?.[0]} />
      </div>
      <FormSelect
        id="announcement-target"
        label="Audience"
        name="targetType"
        defaultValue={announcement?.targetType ?? AnnouncementTarget.EVERYONE}
        options={TARGET_OPTIONS}
        onValueChange={(value) => setTargetType(value as AnnouncementTarget)}
      />
      <FormSelect
        id="announcement-subject"
        label="Subject (if applicable)"
        name="subjectId"
        required={subjectRequired}
        allowEmpty
        emptyLabel="Select subject"
        placeholder="Select subject"
        defaultValue={announcement?.subjectId ?? ""}
        options={subjects.map((s) => ({ value: s.id, label: s.name }))}
      />
      <FieldError message={state.fieldErrors?.subjectId?.[0]} />
      <FormSelect
        id="announcement-grade"
        label="Grade (if applicable)"
        name="grade"
        required={gradeRequired}
        allowEmpty
        emptyLabel="Select grade"
        placeholder="Select grade"
        defaultValue={announcement?.grade ?? ""}
        options={grades.map((grade) => ({ value: grade, label: `Grade ${grade}` }))}
      />
      <FieldError message={state.fieldErrors?.grade?.[0]} />
      <FormSelect
        id="announcement-institute"
        label="Institute (if applicable)"
        name="instituteId"
        required={instituteRequired}
        allowEmpty
        emptyLabel="Select institute"
        placeholder="Select institute"
        defaultValue={announcement?.instituteId ?? ""}
        options={institutes.map((i) => ({
          value: i.id,
          label: `${i.name} (${i.location})`,
        }))}
      />
      <FieldError message={state.fieldErrors?.instituteId?.[0]} />
      {state.message && !state.success ? <p className="text-sm">{state.message}</p> : null}
      {showActions ? (
        <Button type="submit" className="rounded-[4px]" disabled={pending}>
          {pending
            ? isEdit
              ? "Saving..."
              : "Publishing..."
            : isEdit
              ? "Save changes"
              : "Publish announcement"}
        </Button>
      ) : null}
    </form>
  );
}
