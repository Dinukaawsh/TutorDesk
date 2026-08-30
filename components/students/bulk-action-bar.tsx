"use client";

import { useState } from "react";
import {
  bulkAddSubjectsAction,
  bulkAddTagsAction,
  bulkDisableStudentsAction,
  bulkEnableStudentsAction,
  bulkRemoveTagsAction,
  bulkUpdateGradeAction,
  bulkUpdateInstituteAction,
} from "@/actions/student.actions";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { FormModal } from "@/components/modals/form-modal";
import { BottomActionBar } from "@/components/ui/bottom-action-bar";
import { Button } from "@/components/ui/button";
import { CheckboxField } from "@/components/ui/checkbox-field";
import { FieldError } from "@/components/ui/field-error";
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { InstituteOption, SubjectOption, TagOption } from "@/components/students/student-filters";
import { t } from "@/content/navigation";
import { useActionState, useEffect } from "react";
import type { ActionResult } from "@/actions/auth.actions";
import { useActionToast } from "@/hooks/use-action-toast";
import { FormPendingReporter } from "@/components/modals/form-pending-reporter";
import { useReportFormModalPending } from "@/components/modals/form-modal-context";

type BulkActionBarProps = {
  selectedIds: string[];
  subjects: SubjectOption[];
  tags: TagOption[];
  institutes: InstituteOption[];
  grades: string[];
  onClear: () => void;
};

const initial: ActionResult = { success: false };

function HiddenIds({ ids }: { ids: string[] }) {
  return ids.map((id) => <input key={id} type="hidden" name="ids" value={id} />);
}

function BulkGradeForm({
  grades,
  selectedIds,
  onSuccess,
}: {
  grades: string[];
  selectedIds: string[];
  onSuccess: () => void;
}) {
  const [state, formAction, pending] = useActionState(bulkUpdateGradeAction, initial);
  useActionToast(state);
  useReportFormModalPending(pending);

  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  return (
    <form id="bulk-grade-form" action={formAction} noValidate className="space-y-4">
      <FormPendingReporter />
      <HiddenIds ids={selectedIds} />
      <div className="space-y-2">
        <Label htmlFor="bulk-grade" required>
          New grade
        </Label>
        <Input id="bulk-grade" name="grade" list="bulk-grade-options" placeholder="e.g. 10" />
        <datalist id="bulk-grade-options">
          {grades.map((grade) => (
            <option key={grade} value={grade} />
          ))}
        </datalist>
        <FieldError message={state.fieldErrors?.grade?.[0]} />
      </div>
      {state.message && !state.success ? <p className="text-sm">{state.message}</p> : null}
    </form>
  );
}

function BulkInstituteForm({
  institutes,
  selectedIds,
  onSuccess,
}: {
  institutes: InstituteOption[];
  selectedIds: string[];
  onSuccess: () => void;
}) {
  const [state, formAction, pending] = useActionState(bulkUpdateInstituteAction, initial);
  useActionToast(state);
  useReportFormModalPending(pending);

  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  return (
    <form id="bulk-institute-form" action={formAction} noValidate className="space-y-4">
      <FormPendingReporter />
      <HiddenIds ids={selectedIds} />
      {institutes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Create institutes before bulk assigning them.</p>
      ) : (
        <FormSelect
          id="bulk-institute"
          label="Institute"
          name="instituteId"
          required
          allowEmpty
          emptyLabel="Select institute"
          placeholder="Select institute"
          options={institutes.map((i) => ({ value: i.id, label: `${i.name} (${i.location})` }))}
        />
      )}
      <FieldError message={state.fieldErrors?.instituteId?.[0]} />
      {state.message && !state.success ? <p className="text-sm">{state.message}</p> : null}
    </form>
  );
}

function BulkTagPickerForm({
  action,
  formId,
  tags,
  selectedIds,
  onSuccess,
  emptyMessage,
}: {
  action: (prev: ActionResult | undefined, formData: FormData) => Promise<ActionResult>;
  formId: string;
  tags: TagOption[];
  selectedIds: string[];
  onSuccess: () => void;
  emptyMessage: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  useActionToast(state);
  useReportFormModalPending(pending);

  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  return (
    <form id={formId} action={formAction} noValidate className="space-y-4">
      <FormPendingReporter />
      <HiddenIds ids={selectedIds} />
      {tags.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">
          {tags.map((tag) => (
            <CheckboxField key={tag.id} id={`${formId}-${tag.id}`} name="tagIds" value={tag.id} label={tag.name} />
          ))}
        </div>
      )}
      <FieldError message={state.fieldErrors?.tagIds?.[0]} />
      {state.message && !state.success ? <p className="text-sm">{state.message}</p> : null}
    </form>
  );
}

function BulkSubjectForm({
  subjects,
  selectedIds,
  onSuccess,
}: {
  subjects: SubjectOption[];
  selectedIds: string[];
  onSuccess: () => void;
}) {
  const [state, formAction, pending] = useActionState(bulkAddSubjectsAction, initial);
  useActionToast(state);
  useReportFormModalPending(pending);

  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  return (
    <form id="bulk-subjects-form" action={formAction} noValidate className="space-y-4">
      <FormPendingReporter />
      <HiddenIds ids={selectedIds} />
      <p className="text-sm text-muted-foreground">
        Selected subjects will be added to each student. Existing enrollments are kept.
      </p>
      {subjects.length === 0 ? (
        <p className="text-sm text-muted-foreground">Create subjects before bulk enrollment.</p>
      ) : (
        <div className="grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">
          {subjects.map((subject) => (
            <CheckboxField
              key={subject.id}
              id={`bulk-subject-${subject.id}`}
              name="subjectIds"
              value={subject.id}
              label={subject.name}
            />
          ))}
        </div>
      )}
      <FieldError message={state.fieldErrors?.subjectIds?.[0]} />
      {state.message && !state.success ? <p className="text-sm">{state.message}</p> : null}
    </form>
  );
}

export function BulkActionBar({
  selectedIds,
  subjects,
  tags,
  institutes,
  grades,
  onClear,
}: BulkActionBarProps) {
  const [disableOpen, setDisableOpen] = useState(false);
  const [enableOpen, setEnableOpen] = useState(false);
  const [gradeOpen, setGradeOpen] = useState(false);
  const [instituteOpen, setInstituteOpen] = useState(false);
  const [addTagsOpen, setAddTagsOpen] = useState(false);
  const [removeTagsOpen, setRemoveTagsOpen] = useState(false);
  const [subjectsOpen, setSubjectsOpen] = useState(false);

  function handleSuccess(close: () => void) {
    close();
    onClear();
  }

  const actionBtnClass =
    "shrink-0 rounded-[4px] border border-border bg-white px-3 text-xs sm:text-sm";

  return (
    <>
      <BottomActionBar open={selectedIds.length > 0}>
        <div className="space-y-3">
          {/* Header row */}
          <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-primary px-2 text-xs font-semibold text-primary-foreground">
                {selectedIds.length}
              </span>
              <p className="text-sm font-medium">
                student{selectedIds.length === 1 ? "" : "s"} selected
              </p>
            </div>
            <Button type="button" variant="ghost" size="sm" className="shrink-0 rounded-[4px]" onClick={onClear}>
              Clear
            </Button>
          </div>

          {/* Action buttons — horizontal scroll on mobile */}
          <div className="-mx-1 overflow-x-auto px-1 pb-0.5">
            <div className="flex min-w-max gap-2 sm:flex-wrap sm:min-w-0">
              <Button type="button" size="sm" variant="outline" className={actionBtnClass} onClick={() => setGradeOpen(true)}>
                Update grade
              </Button>
              <Button type="button" size="sm" variant="outline" className={actionBtnClass} onClick={() => setInstituteOpen(true)}>
                Update institute
              </Button>
              <Button type="button" size="sm" variant="outline" className={actionBtnClass} onClick={() => setAddTagsOpen(true)}>
                Add tags
              </Button>
              <Button type="button" size="sm" variant="outline" className={actionBtnClass} onClick={() => setRemoveTagsOpen(true)}>
                Remove tags
              </Button>
              <Button type="button" size="sm" variant="outline" className={actionBtnClass} onClick={() => setSubjectsOpen(true)}>
                Add subjects
              </Button>
              <Button type="button" size="sm" className="shrink-0 rounded-[4px] px-3 text-xs sm:text-sm" onClick={() => setEnableOpen(true)}>
                {t("action.enable")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                className="shrink-0 rounded-[4px] px-3 text-xs sm:text-sm"
                onClick={() => setDisableOpen(true)}
              >
                {t("action.disable")}
              </Button>
            </div>
          </div>
        </div>
      </BottomActionBar>

      <FormModal
        open={gradeOpen}
        onOpenChange={setGradeOpen}
        title="Bulk update grade"
        description={`Set grade for ${selectedIds.length} selected student(s).`}
        formId="bulk-grade-form"
        saveLabel="Update grade"
        onCancel={() => setGradeOpen(false)}
      >
        <BulkGradeForm grades={grades} selectedIds={selectedIds} onSuccess={() => handleSuccess(() => setGradeOpen(false))} />
      </FormModal>

      <FormModal
        open={instituteOpen}
        onOpenChange={setInstituteOpen}
        title="Bulk update institute"
        description={`Assign institute for ${selectedIds.length} selected student(s).`}
        formId="bulk-institute-form"
        saveLabel="Update institute"
        onCancel={() => setInstituteOpen(false)}
      >
        <BulkInstituteForm institutes={institutes} selectedIds={selectedIds} onSuccess={() => handleSuccess(() => setInstituteOpen(false))} />
      </FormModal>

      <FormModal
        open={addTagsOpen}
        onOpenChange={setAddTagsOpen}
        title="Bulk add tags"
        description={`Add tags to ${selectedIds.length} selected student(s).`}
        formId="bulk-add-tags-form"
        saveLabel="Add tags"
        onCancel={() => setAddTagsOpen(false)}
      >
        <BulkTagPickerForm
          action={bulkAddTagsAction}
          formId="bulk-add-tags-form"
          tags={tags}
          selectedIds={selectedIds}
          emptyMessage="Create tags above before bulk assigning them."
          onSuccess={() => handleSuccess(() => setAddTagsOpen(false))}
        />
      </FormModal>

      <FormModal
        open={removeTagsOpen}
        onOpenChange={setRemoveTagsOpen}
        title="Bulk remove tags"
        description={`Remove tags from ${selectedIds.length} selected student(s).`}
        formId="bulk-remove-tags-form"
        saveLabel="Remove tags"
        onCancel={() => setRemoveTagsOpen(false)}
      >
        <BulkTagPickerForm
          action={bulkRemoveTagsAction}
          formId="bulk-remove-tags-form"
          tags={tags}
          selectedIds={selectedIds}
          emptyMessage="No tags available to remove."
          onSuccess={() => handleSuccess(() => setRemoveTagsOpen(false))}
        />
      </FormModal>

      <FormModal
        open={subjectsOpen}
        onOpenChange={setSubjectsOpen}
        title="Bulk add subjects"
        description={`Enroll ${selectedIds.length} selected student(s) in subjects.`}
        formId="bulk-subjects-form"
        saveLabel="Add subjects"
        onCancel={() => setSubjectsOpen(false)}
      >
        <BulkSubjectForm subjects={subjects} selectedIds={selectedIds} onSuccess={() => handleSuccess(() => setSubjectsOpen(false))} />
      </FormModal>

      <ConfirmModal
        open={enableOpen}
        onOpenChange={setEnableOpen}
        title={t("modal.enableStudent.title")}
        description={t("modal.enableStudent.description")}
        confirmLabel={t("action.enable")}
        formAction={bulkEnableStudentsAction}
        onSuccess={() => handleSuccess(() => setEnableOpen(false))}
      >
        <HiddenIds ids={selectedIds} />
      </ConfirmModal>

      <ConfirmModal
        open={disableOpen}
        onOpenChange={setDisableOpen}
        title={t("modal.disableStudent.title")}
        description="Provide a shared reason for disabling selected students."
        confirmLabel={t("action.disable")}
        confirmVariant="destructive"
        formAction={bulkDisableStudentsAction}
        note={{ name: "reason", label: "Shared reason", required: true }}
        onSuccess={() => handleSuccess(() => setDisableOpen(false))}
      >
        <HiddenIds ids={selectedIds} />
      </ConfirmModal>
    </>
  );
}
