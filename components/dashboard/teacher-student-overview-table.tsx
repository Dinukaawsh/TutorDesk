"use client";

import Link from "next/link";
import { useState } from "react";
import { FiEdit2, FiEye, FiUserX } from "react-icons/fi";
import { disableStudentAction } from "@/actions/student.actions";
import type { TeacherDashboardStudentRow } from "@/actions/dashboard.actions";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { FormModal } from "@/components/modals/form-modal";
import { IconButton } from "@/components/modals/icon-button";
import { ViewModal } from "@/components/modals/view-modal";
import { StudentContactSection } from "@/components/students/student-contact-section";
import {
  StudentForm,
  type StudentFormData,
} from "@/components/students/student-form";
import type { SubjectOption } from "@/components/students/student-filters";
import { Button } from "@/components/ui/button";
import { AccountStatusBadge, StatusBadge } from "@/components/ui/status-badge";
import { t, type LabelKey } from "@/content/navigation";

type TeacherStudentOverviewTableProps = {
  students: TeacherDashboardStudentRow[];
  subjects: SubjectOption[];
};

export function TeacherStudentOverviewTable({
  students,
  subjects,
}: TeacherStudentOverviewTableProps) {
  const [viewStudent, setViewStudent] = useState<TeacherDashboardStudentRow | null>(
    null,
  );
  const [editStudent, setEditStudent] = useState<StudentFormData | null>(null);
  const [disableTarget, setDisableTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-border bg-white/80 backdrop-blur">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border bg-muted/50 text-left">
            <tr>
              <th className="p-3 font-medium">{t("dashboard.table.student")}</th>
              <th className="p-3 font-medium">{t("dashboard.table.grade")}</th>
              <th className="p-3 font-medium">{t("dashboard.table.subjects")}</th>
              <th className="p-3 font-medium">{t("table.paymentStatus")}</th>
              <th className="p-3 font-medium">{t("table.accountStatus")}</th>
              <th className="p-3 font-medium">{t("dashboard.table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-b border-border last:border-0">
                <td className="p-3 align-top font-medium">{student.name}</td>
                <td className="p-3 align-top">{student.grade ?? "—"}</td>
                <td className="p-3 align-top">
                  <div className="flex flex-wrap gap-1">
                    {student.subjects.map((s) => (
                      <StatusBadge key={s.id} label={s.name} tone="muted" />
                    ))}
                    {student.subjects.length === 0 ? "—" : null}
                  </div>
                </td>
                <td className="p-3 align-top">
                  <StatusBadge
                    label={t(student.feePaymentLabelKey as LabelKey)}
                    tone="outline"
                  />
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
                    {!student.isDisabled ? (
                      <IconButton
                        labelKey="action.disable"
                        variant="destructive"
                        icon={<FiUserX className="h-4 w-4" />}
                        onClick={() =>
                          setDisableTarget({ id: student.id, name: student.name })
                        }
                      />
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
            {students.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  {t("dashboard.table.empty")}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <FormModal
        open={Boolean(editStudent)}
        onOpenChange={(open) => !open && setEditStudent(null)}
        title={t("dashboard.action.edit")}
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
              <dt className="font-medium text-foreground">{t("dashboard.table.grade")}</dt>
              <dd className="text-muted-foreground">{viewStudent.grade ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">{t("dashboard.table.subjects")}</dt>
              <dd className="mt-1 flex flex-wrap gap-1">
                {viewStudent.subjects.length > 0 ? (
                  viewStudent.subjects.map((s) => (
                    <StatusBadge key={s.id} label={s.name} tone="muted" />
                  ))
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">{t("table.paymentStatus")}</dt>
              <dd className="mt-1">
                <StatusBadge
                  label={t(viewStudent.feePaymentLabelKey as LabelKey)}
                  tone="outline"
                />
              </dd>
            </div>
            <StudentContactSection
              phone={viewStudent.form.phone}
              whatsapp={viewStudent.form.whatsapp}
            />
            <div>
              <dt className="font-medium text-foreground">{t("table.accountStatus")}</dt>
              <dd className="mt-1">
                <AccountStatusBadge isDisabled={viewStudent.isDisabled} />
              </dd>
            </div>
            <Button asChild variant="outline" className="rounded-[4px]">
              <Link href={`/teacher/students?q=${encodeURIComponent(viewStudent.form.email)}`}>
                {t("dashboard.action.openProfile")}
              </Link>
            </Button>
          </dl>
        ) : null}
      </ViewModal>

      <ConfirmModal
        open={Boolean(disableTarget)}
        onOpenChange={(open: boolean) => !open && setDisableTarget(null)}
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
    </>
  );
}
