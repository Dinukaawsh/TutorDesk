"use client";

import { useState, useTransition } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { toast } from "sonner";
import { deleteSubjectAction } from "@/actions/subject.actions";
import { formatSubjectMonthlyFee, t } from "@/content/navigation";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { IconButton } from "@/components/modals/icon-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

export type SubjectCardData = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  enrollmentCount: number;
  monthlyFee?: number | null;
};

type SubjectCardProps = {
  subject: SubjectCardData;
  onEdit: (subject: SubjectCardData) => void;
};

export function SubjectCard({ subject, onEdit }: SubjectCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const feeLabel = formatSubjectMonthlyFee(subject.monthlyFee ?? null);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteSubjectAction(subject.id);
      if (result.success) {
        toast.success(result.message);
        setDeleteOpen(false);
      } else {
        toast.error(result.message ?? "Could not delete subject.");
      }
    });
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 shrink-0 rounded-full border border-border"
              style={{ backgroundColor: subject.color ?? "#2563eb" }}
            />
            <CardTitle className="text-base">{subject.name}</CardTitle>
          </div>
          <StatusBadge label={`${subject.enrollmentCount} enrolled`} tone="muted" />
        </CardHeader>
        <CardContent className="space-y-3">
          {feeLabel ? (
            <p className="text-sm font-medium text-foreground">{feeLabel} / month</p>
          ) : null}
          {subject.description ? (
            <p className="text-sm text-muted-foreground">{subject.description}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No description</p>
          )}
          <div className="flex gap-1">
            <IconButton
              labelKey="action.edit"
              icon={<FiEdit2 className="h-4 w-4" />}
              onClick={() => onEdit(subject)}
            />
            <IconButton
              labelKey="action.delete"
              variant="destructive"
              icon={<FiTrash2 className="h-4 w-4" />}
              onClick={() => setDeleteOpen(true)}
            />
          </div>
        </CardContent>
      </Card>

      <ConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t("modal.deleteSubject.title")}
        description={`Delete "${subject.name}"? ${t("modal.deleteSubject.description")}`}
        confirmLabel={t("action.delete")}
        confirmVariant="destructive"
        loading={pending}
        onConfirm={handleDelete}
      />
    </>
  );
}



