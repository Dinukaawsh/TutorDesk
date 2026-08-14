"use client";

import { useActionState, useEffect } from "react";
import { createStudentAction, updateStudentAction } from "@/actions/student.actions";
import type { ActionResult } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionToast } from "@/hooks/use-action-toast";
import { useReportFormModalPending } from "@/components/modals/form-modal-context";
import { FormPendingReporter } from "@/components/modals/form-pending-reporter";
import type { SubjectOption, TagOption } from "@/components/students/student-filters";

const initialState: ActionResult = { success: false };

export type StudentFormData = {
  id: string;
  name: string;
  email: string;
  age: number | null;
  grade: string | null;
  school: string | null;
  stream: string | null;
  phone: string | null;
  whatsapp: string | null;
  avatarUrl: string | null;
  subjectIds: string[];
  tagIds: string[];
};

type StudentFormProps = {
  subjects: SubjectOption[];
  tags: TagOption[];
  student?: StudentFormData | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  formId?: string;
  hideActions?: boolean;
};

export function StudentForm({ subjects, tags, student, onSuccess, onCancel, formId, hideActions }: StudentFormProps) {
  const action = student ? updateStudentAction : createStudentAction;
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
    <form
      action={formAction}
      id={formId}
      noValidate
      className="space-y-4"
    >
      <FormPendingReporter />
      {student ? <input type="hidden" name="id" value={student.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="student-name" required>
            Full name
          </Label>
          <Input id="student-name" name="name" defaultValue={student?.name ?? ""} />
          <FieldError message={state.fieldErrors?.name?.[0]} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="student-email" required>
            Email
          </Label>
          <Input
            id="student-email"
            name="email"
            type="email"
            defaultValue={student?.email ?? ""}
          />
          <FieldError message={state.fieldErrors?.email?.[0]} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="student-phone">Phone</Label>
          <Input id="student-phone" name="phone" defaultValue={student?.phone ?? ""} />
        </div>
        {!student ? (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="student-password" required>
              Initial password
            </Label>
            <Input id="student-password" name="password" type="password" />
            <FieldError message={state.fieldErrors?.password?.[0]} />
          </div>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="student-age">Age</Label>
          <Input id="student-age" name="age" type="number" defaultValue={student?.age ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="student-grade">Grade</Label>
          <Input id="student-grade" name="grade" defaultValue={student?.grade ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="student-school">School</Label>
          <Input id="student-school" name="school" defaultValue={student?.school ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="student-stream">Stream</Label>
          <Input id="student-stream" name="stream" defaultValue={student?.stream ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="student-whatsapp">WhatsApp</Label>
          <Input id="student-whatsapp" name="whatsapp" defaultValue={student?.whatsapp ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="student-avatar">Avatar (optional)</Label>
          <Input id="student-avatar" name="avatar" type="file" accept="image/*" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Subject enrollments</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {subjects.map((subject) => {
            const checked = student?.subjectIds.includes(subject.id) ?? false;
            return (
              <label
                key={subject.id}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  name="subjectIds"
                  value={subject.id}
                  defaultChecked={checked}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/40"
                />
                {subject.name}
              </label>
            );
          })}
          {subjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">Create subjects before enrolling students.</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {tags.map((tag) => {
            const checked = student?.tagIds.includes(tag.id) ?? false;
            return (
              <label
                key={tag.id}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  name="tagIds"
                  value={tag.id}
                  defaultChecked={checked}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/40"
                />
                {tag.name}
              </label>
            );
          })}
          {tags.length === 0 ? (
            <p className="text-sm text-muted-foreground">Create tags above before assigning them.</p>
          ) : null}
        </div>
      </div>

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
          {pending ? "Saving..." : student ? "Update student" : "Create student"}
        </Button>
      </div>
      ) : null}
    </form>
  );
}
