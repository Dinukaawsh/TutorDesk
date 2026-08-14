"use client";

import { useMemo, useState, useActionState, useEffect } from "react";
import {
  FiEdit2,
  FiEye,
  FiKey,
  FiUserCheck,
  FiUserX,
} from "react-icons/fi";
import {
  bulkEnableStudentsAction,
  disableStudentAction,
  resetStudentPasswordAction,
} from "@/actions/student.actions";
import type { ActionResult } from "@/actions/auth.actions";
import { BulkActionBar } from "@/components/students/bulk-action-bar";
import {
  StudentForm,
  type StudentFormData,
} from "@/components/students/student-form";
import type { SubjectOption, TagOption } from "@/components/students/student-filters";
import { StudentTagBadge } from "@/components/students/student-tag-badge";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { FormPendingReporter } from "@/components/modals/form-pending-reporter";
import { FormModal } from "@/components/modals/form-modal";
import { IconButton } from "@/components/modals/icon-button";
import { ViewModal } from "@/components/modals/view-modal";
import { StudentContactSection } from "@/components/students/student-contact-section";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Pagination, PAGINATION_PAGE_SIZE } from "@/components/ui/pagination";
import { AccountStatusBadge, StatusBadge } from "@/components/ui/status-badge";
import { useActionToast } from "@/hooks/use-action-toast";
import { t, type LabelKey } from "@/content/navigation";

export type StudentRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  grade: string | null;
  isDisabled: boolean;
  avatarUrl: string | null;
  subjects: { id: string; name: string }[];
  tags: { id: string; name: string; color: string | null }[];
  feeSummary: string;
  feePaymentLabelKey: LabelKey;
  form: StudentFormData;
};

type StudentTableProps = {
  students: StudentRow[];
  subjects: SubjectOption[];
  tags: TagOption[];
};

const resetInitial: ActionResult = { success: false };

function ResetPasswordDialog({
  studentId,
  open,
  onOpenChange,
}: {
  studentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, pending] = useActionState(
    resetStudentPasswordAction,
    resetInitial,
  );

  useActionToast(state);

  useEffect(() => {
    if (state.success) {
      onOpenChange(false);
    }
  }, [state.success, onOpenChange]);

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Reset password"
      formId="reset-password-form"
      saveLabel="Reset password"
      loading={pending}
      onCancel={() => onOpenChange(false)}
    >
      {studentId ? (
        <form id="reset-password-form" action={formAction} noValidate className="space-y-4">
          <FormPendingReporter />
          <input type="hidden" name="id" value={studentId} />
          <div className="space-y-2">
            <Label htmlFor="new-password" required>
              New password
            </Label>
            <Input id="new-password" name="password" type="password" />
            <FieldError message={state.fieldErrors?.password?.[0]} />
          </div>
          {state.message && !state.success ? (
            <p className="text-sm">{state.message}</p>
          ) : null}
          {state.success ? (
            <p className="text-sm text-muted-foreground">
              Password reset. Student must change it on login.
            </p>
          ) : null}
        </form>
      ) : null}
    </FormModal>
  );
}

export function StudentTable({ students, subjects, tags }: StudentTableProps) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [students]);

  const pagedStudents = useMemo(() => {
    const start = (page - 1) * PAGINATION_PAGE_SIZE;
    return students.slice(start, start + PAGINATION_PAGE_SIZE);
  }, [students, page]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editStudent, setEditStudent] = useState<StudentFormData | null>(null);
  const [viewStudent, setViewStudent] = useState<StudentRow | null>(null);
  const [disableTarget, setDisableTarget] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [enableTarget, setEnableTarget] = useState<{ id: string; name: string } | null>(null);
  const [resetId, setResetId] = useState<string | null>(null);

  const allIds = useMemo(() => pagedStudents.map((s) => s.id), [students]);
  const allSelected = pagedStudents.length > 0 && pagedStudents.every((s) => selected.has(s.id));

  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(allIds) : new Set());
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-border bg-white/80 backdrop-blur">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border bg-muted/50 text-left">
            <tr>
              <th className="p-3">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(value) => toggleAll(value === true)}
                  aria-label="Select all"
                />
              </th>
              <th className="p-3 font-medium">Student</th>
              <th className="p-3 font-medium">Grade</th>
              <th className="p-3 font-medium">Subjects</th>
              <th className="p-3 font-medium">Tags</th>
              <th className="p-3 font-medium">Fees (month)</th>
              <th className="p-3 font-medium">{t("table.paymentStatus")}</th>
              <th className="p-3 font-medium">{t("table.accountStatus")}</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pagedStudents.map((student) => (
              <tr key={student.id} className="border-b border-border last:border-0">
                <td className="p-3 align-top">
                  <Checkbox
                    checked={selected.has(student.id)}
                    onCheckedChange={(value) => toggleOne(student.id, value === true)}
                    aria-label={`Select ${student.name}`}
                  />
                </td>
                <td className="p-3 align-top">
                  <div className="font-medium">{student.name}</div>
                  <div className="text-muted-foreground">{student.email}</div>
                  {student.phone ? (
                    <div className="text-muted-foreground">{student.phone}</div>
                  ) : null}
                </td>
                <td className="p-3 align-top">{student.grade ?? "-"}</td>
                <td className="p-3 align-top">
                  <div className="flex flex-wrap gap-1">
                    {student.subjects.map((s) => (
                      <StatusBadge key={s.id} label={s.name} tone="muted" />
                    ))}
                    {student.subjects.length === 0 ? "-" : null}
                  </div>
                </td>
                <td className="p-3 align-top">
                  <div className="flex flex-wrap gap-1">
                    {student.tags.map((tag) => (
                      <StudentTagBadge key={tag.id} name={tag.name} color={tag.color} />
                    ))}
                    {student.tags.length === 0 ? "-" : null}
                  </div>
                </td>
                <td className="p-3 align-top text-muted-foreground">{student.feeSummary}</td>
                <td className="p-3 align-top">
                  <StatusBadge label={t(student.feePaymentLabelKey)} tone="outline" />
                </td>
                <td className="p-3 align-top">
                  <AccountStatusBadge isDisabled={student.isDisabled} />
                </td>
                <td className="p-3 align-top">
                  <div className="flex flex-wrap gap-1">
                    <IconButton
                      labelKey="action.view"
                      icon={<FiEye className="h-4 w-4" />}
                      onClick={() => setViewStudent(student)}
                    />
                    <IconButton
                      labelKey="action.edit"
                      icon={<FiEdit2 className="h-4 w-4" />}
                      onClick={() => setEditStudent(student.form)}
                    />
                    <IconButton
                      labelKey="action.resetPassword"
                      icon={<FiKey className="h-4 w-4" />}
                      onClick={() => setResetId(student.id)}
                    />
                    {!student.isDisabled ? (
                      <IconButton
                        labelKey="action.disable"
                        variant="destructive"
                        icon={<FiUserX className="h-4 w-4" />}
                        onClick={() => setDisableTarget({ id: student.id, name: student.name })}
                      />
                    ) : (
                      <IconButton
                        labelKey="action.enable"
                        icon={<FiUserCheck className="h-4 w-4" />}
                        onClick={() => setEnableTarget({ id: student.id, name: student.name })}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {students.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-muted-foreground">
                  No students match your filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <BulkActionBar selectedIds={[...selected]} onClear={() => setSelected(new Set())} />

      <FormModal
        open={Boolean(editStudent)}
        onOpenChange={(open) => !open && setEditStudent(null)}
        title="Edit student"
        className="max-w-2xl"
        formId="student-form"
        saveLabel="Update student"
        onCancel={() => setEditStudent(null)}
      >
        {editStudent ? (
          <StudentForm
            formId="student-form"
            hideActions
            subjects={subjects}
            tags={tags}
            student={editStudent}
            onSuccess={() => setEditStudent(null)}
          />
        ) : null}
      </FormModal>

      <ViewModal
        open={Boolean(viewStudent)}
        onOpenChange={(open) => !open && setViewStudent(null)}
        title={t("modal.viewStudent.title")}
      >
        {viewStudent ? (
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="font-medium text-foreground">Name</dt>
              <dd className="text-muted-foreground">{viewStudent.name}</dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Grade</dt>
              <dd className="text-muted-foreground">{viewStudent.grade ?? "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Subjects</dt>
              <dd className="mt-1 flex flex-wrap gap-1">
                {viewStudent.subjects.length > 0 ? (
                  viewStudent.subjects.map((s) => (
                    <StatusBadge key={s.id} label={s.name} tone="muted" />
                  ))
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">{t("table.paymentStatus")}</dt>
              <dd className="mt-1">
                <StatusBadge label={t(viewStudent.feePaymentLabelKey)} tone="outline" />
              </dd>
            </div>
            <StudentContactSection phone={viewStudent.phone} whatsapp={viewStudent.whatsapp} />
            <div>
              <dt className="font-medium text-foreground">{t("table.accountStatus")}</dt>
              <dd className="mt-1">
                <AccountStatusBadge isDisabled={viewStudent.isDisabled} />
              </dd>
            </div>
          </dl>
        ) : null}
      </ViewModal>

      <ConfirmModal
        open={Boolean(disableTarget)}
        onOpenChange={(open) => !open && setDisableTarget(null)}
        title={t("modal.disableStudent.title")}
        description={
          disableTarget
            ? `Provide a reason for disabling ${disableTarget.name}.`
            : "Provide a reason for disabling this student."
        }
        confirmLabel={t("action.disable")}
        confirmVariant="destructive"
        formAction={disableStudentAction}
        note={{ name: "reason", label: "Reason", required: true }}
        onSuccess={() => setDisableTarget(null)}
      >
        {disableTarget ? <input type="hidden" name="id" value={disableTarget.id} /> : null}
      </ConfirmModal>

      <ConfirmModal
        open={Boolean(enableTarget)}
        onOpenChange={(open) => !open && setEnableTarget(null)}
        title={t("modal.enableStudent.title")}
        description={
          enableTarget
            ? `Re-enable ${enableTarget.name}? ${t("modal.enableStudent.description")}`
            : t("modal.enableStudent.description")
        }
        confirmLabel={t("action.enable")}
        formAction={bulkEnableStudentsAction}
        onSuccess={() => setEnableTarget(null)}
      >
        {enableTarget ? <input type="hidden" name="ids" value={enableTarget.id} /> : null}
      </ConfirmModal>

      <Pagination
        totalItems={students.length}
        page={page}
        onPageChange={setPage}
      />

      <ResetPasswordDialog
        studentId={resetId}
        open={Boolean(resetId)}
        onOpenChange={(open) => !open && setResetId(null)}
      />
    </div>
  );
}
