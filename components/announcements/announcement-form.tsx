"use client";

import { useActionState, useEffect } from "react";
import { AnnouncementTarget } from "@prisma/client";
import { createAnnouncementAction } from "@/actions/announcement.actions";
import type { ActionResult } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";

type SubjectOption = { id: string; name: string };

type AnnouncementFormProps = {
  subjects: SubjectOption[];
  grades: string[];
  onSuccess?: () => void;
  formId?: string;
  hideActions?: boolean;
};

const initial: ActionResult = { success: false };

export function AnnouncementForm({ subjects, grades, onSuccess, formId, hideActions }: AnnouncementFormProps) {
  const [state, formAction, pending] = useActionState(createAnnouncementAction, initial);
  useActionToast(state);

  useEffect(() => {
    if (state.success) {
      onSuccess?.();
    }
  }, [state.success, onSuccess]);

  const showActions = !formId && !hideActions;

  return (
    <form action={formAction} id={formId} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="announcement-title">Title</Label>
        <Input id="announcement-title" name="title" required />
        {state.fieldErrors?.title?.[0] ? (
          <p className="text-sm text-muted-foreground">{state.fieldErrors.title[0]}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="announcement-body">Message</Label>
        <Textarea id="announcement-body" name="body" rows={5} required />
        {state.fieldErrors?.body?.[0] ? (
          <p className="text-sm text-muted-foreground">{state.fieldErrors.body[0]}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="announcement-target">Audience</Label>
        <select
          id="announcement-target"
          name="targetType"
          className="flex h-10 w-full rounded-md border border-border bg-white px-3 text-sm"
          defaultValue={AnnouncementTarget.EVERYONE}
          required
        >
          <option value={AnnouncementTarget.EVERYONE}>All students</option>
          <option value={AnnouncementTarget.SUBJECT}>Subject</option>
          <option value={AnnouncementTarget.GRADE}>Grade</option>
          <option value={AnnouncementTarget.SUBJECT_GRADE}>Subject and grade</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="announcement-subject">Subject (if applicable)</Label>
        <select
          id="announcement-subject"
          name="subjectId"
          className="flex h-10 w-full rounded-md border border-border bg-white px-3 text-sm"
          defaultValue=""
        >
          <option value="">Select subject</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        {state.fieldErrors?.subjectId?.[0] ? (
          <p className="text-sm text-muted-foreground">{state.fieldErrors.subjectId[0]}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="announcement-grade">Grade (if applicable)</Label>
        <select
          id="announcement-grade"
          name="grade"
          className="flex h-10 w-full rounded-md border border-border bg-white px-3 text-sm"
          defaultValue=""
        >
          <option value="">Select grade</option>
          {grades.map((grade) => (
            <option key={grade} value={grade}>
              Grade {grade}
            </option>
          ))}
        </select>
        {state.fieldErrors?.grade?.[0] ? (
          <p className="text-sm text-muted-foreground">{state.fieldErrors.grade[0]}</p>
        ) : null}
      </div>
      {state.message && !state.success ? <p className="text-sm">{state.message}</p> : null}
      {showActions ? (
        <Button type="submit" className="rounded-[4px]" disabled={pending}>
          {pending ? "Publishing..." : "Publish announcement"}
        </Button>
      ) : null}
    </form>
  );
}
