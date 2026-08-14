"use client";

import { useMemo, useState } from "react";
import { FeeStatus } from "@prisma/client";
import { resetStudentPasswordAction } from "@/actions/student.actions";
import type { ActionResult } from "@/actions/auth.actions";
import { BulkActionBar } from "@/components/students/bulk-action-bar";
import { DisableStudentDialog } from "@/components/students/disable-student-dialog";
import {
  StudentForm,
  type StudentFormData,
} from "@/components/students/student-form";
import type { SubjectOption } from "@/components/students/student-filters";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AccountStatusBadge, StatusBadge } from "@/components/ui/status-badge";
import { t, type LabelKey } from "@/content/navigation";
import { useActionState, useEffect } from "react";

export type StudentRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  grade: string | null;
  isDisabled: boolean;
  avatarUrl: string | null;
  subjects: { id: string; name: string }[];
  feeSummary: string;
  feePaymentLabelKey: LabelKey;
  form: StudentFormData;
};

type StudentTableProps = {
  students: StudentRow[];
  subjects: SubjectOption[];
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

  useEffect(() => {
    if (state.success) {
      onOpenChange(false);
    }
  }, [state.success, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
        </DialogHeader>
        {studentId ? (
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="id" value={studentId} />
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input id="new-password" name="password" type="password" required />
              {state.fieldErrors?.password?.[0] ? (
                <p className="text-sm text-black/70">{state.fieldErrors.password[0]}</p>
              ) : null}
            </div>
            {state.message && !state.success ? (
              <p className="text-sm">{state.message}</p>
            ) : null}
            {state.success ? (
              <p className="text-sm text-muted-foreground">Password reset. Student must change it on login.</p>
            ) : null}
            <Button type="submit" disabled={pending}>
              {pending ? "Resetting..." : "Reset password"}
            </Button>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export function StudentTable({ students, subjects }: StudentTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editStudent, setEditStudent] = useState<StudentFormData | null>(null);
  const [disableTarget, setDisableTarget] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [resetId, setResetId] = useState<string | null>(null);

  const allIds = useMemo(() => students.map((s) => s.id), [students]);
  const allSelected = students.length > 0 && selected.size === students.length;

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
              <th className="p-3 font-medium">Fees (month)</th>
              <th className="p-3 font-medium">{t("table.paymentStatus")}</th>
              <th className="p-3 font-medium">{t("table.accountStatus")}</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
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
                <td className="p-3 align-top">{student.grade ?? "â€”"}</td>
                <td className="p-3 align-top">
                  <div className="flex flex-wrap gap-1">
                    {student.subjects.map((s) => (
                      <StatusBadge key={s.id} label={s.name} tone="muted" />
                    ))}
                    {student.subjects.length === 0 ? "â€”" : null}
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
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => setEditStudent(student.form)}>
                      Edit
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setResetId(student.id)}>
                      Reset pwd
                    </Button>
                    {!student.isDisabled ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => setDisableTarget({ id: student.id, name: student.name })}
                      >
                        Disable
                      </Button>
                    ) : null}
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

      <Dialog open={Boolean(editStudent)} onOpenChange={(open) => !open && setEditStudent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit student</DialogTitle>
          </DialogHeader>
          {editStudent ? (
            <StudentForm
              subjects={subjects}
              student={editStudent}
              onSuccess={() => setEditStudent(null)}
              onCancel={() => setEditStudent(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <DisableStudentDialog
        studentId={disableTarget?.id ?? null}
        studentName={disableTarget?.name}
        open={Boolean(disableTarget)}
        onOpenChange={(open) => !open && setDisableTarget(null)}
      />

      <ResetPasswordDialog
        studentId={resetId}
        open={Boolean(resetId)}
        onOpenChange={(open) => !open && setResetId(null)}
      />
    </div>
  );
}



