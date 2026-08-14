"use client";

import { useActionState, useEffect } from "react";
import { AnnouncementTarget } from "@prisma/client";
import { saveAnnouncementAction } from "@/actions/announcement.actions";
import type { ActionResult } from "@/actions/auth.actions";
import { useReportFormModalPending } from "@/components/modals/form-modal-context";
import { FormPendingReporter } from "@/components/modals/form-pending-reporter";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";

type SubjectOption = { id: string; name: string };

export type AnnouncementFormData = {
  id: string;
  title: string;
  body: string;
  targetType: AnnouncementTarget;
  subjectId: string | null;
  grade: string | null;
};

type AnnouncementFormProps = {
  announcement?: AnnouncementFormData | null;
  subjects: SubjectOption[];
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
];

export function AnnouncementForm({
  announcement,
  subjects,
  grades,
  onSuccess,
  formId,
  hideActions,
}: AnnouncementFormProps) {
  const [state, formAction, pending] = useActionState(saveAnnouncementAction, initial);
  useActionToast(state);
  useReportFormModalPending(pending);

  useEffect(() => {
    if (state.success) {
      onSuccess?.();
    }
  }, [state.success, onSuccess]);

  const showActions = !formId && !hideActions;
  const isEdit = Boolean(announcement);

  return (
    <form action={formAction} id={formId} className="space-y-4">
      <FormPendingReporter />
      {announcement ? <input type="hidden" name="id" value={announcement.id} /> : null}
      <div className="space-y-2">
        <Label htmlFor="announcement-title">Title</Label>
        <Input
          id="announcement-title"
          name="title"
          defaultValue={announcement?.title ?? ""}
          required
        />
        {state.fieldErrors?.title?.[0] ? (
          <p className="text-sm text-muted-foreground">{state.fieldErrors.title[0]}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="announcement-body">Message</Label>
        <Textarea
          id="announcement-body"
          name="body"
          rows={5}
          defaultValue={announcement?.body ?? ""}
          required
        />
        {state.fieldErrors?.body?.[0] ? (
          <p className="text-sm text-muted-foreground">{state.fieldErrors.body[0]}</p>
        ) : null}
      </div>
      <FormSelect
        id="announcement-target"
        label="Audience"
        name="targetType"
        defaultValue={announcement?.targetType ?? AnnouncementTarget.EVERYONE}
        options={TARGET_OPTIONS}
      />
      <FormSelect
        id="announcement-subject"
        label="Subject (if applicable)"
        name="subjectId"
        allowEmpty
        emptyLabel="Select subject"
        placeholder="Select subject"
        defaultValue={announcement?.subjectId ?? ""}
        options={subjects.map((s) => ({ value: s.id, label: s.name }))}
      />
      {state.fieldErrors?.subjectId?.[0] ? (
        <p className="text-sm text-muted-foreground">{state.fieldErrors.subjectId[0]}</p>
      ) : null}
      <FormSelect
        id="announcement-grade"
        label="Grade (if applicable)"
        name="grade"
        allowEmpty
        emptyLabel="Select grade"
        placeholder="Select grade"
        defaultValue={announcement?.grade ?? ""}
        options={grades.map((grade) => ({ value: grade, label: `Grade ${grade}` }))}
      />
      {state.fieldErrors?.grade?.[0] ? (
        <p className="text-sm text-muted-foreground">{state.fieldErrors.grade[0]}</p>
      ) : null}
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
