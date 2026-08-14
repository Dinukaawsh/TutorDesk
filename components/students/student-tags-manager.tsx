"use client";

import { useActionState, useEffect, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import {
  createStudentTagAction,
  deleteStudentTagAction,
} from "@/actions/tag.actions";
import type { ActionResult } from "@/actions/auth.actions";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { FormModal } from "@/components/modals/form-modal";
import { IconButton } from "@/components/modals/icon-button";
import { AddButton } from "@/components/ui/add-button";
import { ColorPicker } from "@/components/ui/color-picker";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionToast } from "@/hooks/use-action-toast";
import { useReportFormModalPending } from "@/components/modals/form-modal-context";
import { FormPendingReporter } from "@/components/modals/form-pending-reporter";
import { StudentTagBadge } from "@/components/students/student-tag-badge";
import { t } from "@/content/navigation";

export type StudentTagOption = {
  id: string;
  name: string;
  color: string | null;
  count: number;
};

const initial: ActionResult = { success: false };

function CreateTagForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, formAction, pending] = useActionState(createStudentTagAction, initial);
  useActionToast(state);
  useReportFormModalPending(pending);

  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  return (
    <form id="create-tag-form" action={formAction} noValidate className="space-y-4">
      <FormPendingReporter />
      <div className="space-y-2">
        <Label htmlFor="tag-name" required>
          Tag name
        </Label>
        <Input id="tag-name" name="name" placeholder="e.g. Scholarship, VIP" />
        <FieldError message={state.fieldErrors?.name?.[0]} />
      </div>
      <ColorPicker id="tag-color" label="Color" defaultValue="#2563eb" />
      {state.message && !state.success ? (
        <p className="text-sm text-muted-foreground">{state.message}</p>
      ) : null}
    </form>
  );
}

type StudentTagsManagerProps = {
  tags: StudentTagOption[];
};

export function StudentTagsManager({ tags }: StudentTagsManagerProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StudentTagOption | null>(null);

  return (
    <div className="rounded-xl border border-border bg-white/80 p-4 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">{t("students.tags.title")}</h2>
          <p className="text-xs text-muted-foreground">{t("students.tags.description")}</p>
        </div>
        <AddButton labelKey="students.tags.add" onClick={() => setCreateOpen(true)} />
      </div>
      {tags.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{t("students.tags.empty")}</p>
      ) : (
        <ul className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li
              key={tag.id}
              className="inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-border bg-white px-1 py-1"
            >
              <StudentTagBadge name={tag.name} color={tag.color} />
              <span className="px-1 text-xs text-muted-foreground">{tag.count}</span>
              <IconButton
                labelKey="action.delete"
                variant="destructive"
                icon={<FiTrash2 className="h-3.5 w-3.5" />}
                onClick={() => setDeleteTarget(tag)}
              />
            </li>
          ))}
        </ul>
      )}

      <FormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        title={t("students.tags.createTitle")}
        formId="create-tag-form"
        saveLabel={t("students.tags.createAction")}
        onCancel={() => setCreateOpen(false)}
      >
        <CreateTagForm onSuccess={() => setCreateOpen(false)} />
      </FormModal>

      <ConfirmModal
        key={deleteTarget?.id ?? "tag-delete-closed"}
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("modal.deleteTag.title")}
        description={
          deleteTarget
            ? `Delete "${deleteTarget.name}"? ${t("modal.deleteTag.description")}`
            : undefined
        }
        confirmLabel={t("action.delete")}
        confirmVariant="destructive"
        formAction={deleteStudentTagAction}
        formId={deleteTarget ? `delete-tag-${deleteTarget.id}` : undefined}
        onSuccess={() => setDeleteTarget(null)}
      >
        {deleteTarget ? <input type="hidden" name="id" value={deleteTarget.id} /> : null}
      </ConfirmModal>
    </div>
  );
}
