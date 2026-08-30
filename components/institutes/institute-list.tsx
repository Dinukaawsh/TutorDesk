"use client";

import { useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { deleteInstituteAction } from "@/actions/institute.actions";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { FormModal } from "@/components/modals/form-modal";
import { IconButton } from "@/components/modals/icon-button";
import { InstituteForm, type InstituteFormData } from "@/components/institutes/institute-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type InstituteCardData = InstituteFormData & {
  studentCount: number;
};

type InstituteListProps = {
  institutes: InstituteCardData[];
};

export function InstituteList({ institutes }: InstituteListProps) {
  const [editing, setEditing] = useState<InstituteCardData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InstituteCardData | null>(null);

  if (institutes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No institutes yet. Create one to organize students by location or branch.
      </p>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {institutes.map((institute) => (
          <Card key={institute.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
              <div className="flex items-start gap-3">
                {institute.logoUrl ? (
                  <img
                    src={institute.logoUrl}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-lg border border-border object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-xs text-muted-foreground">
                    No logo
                  </div>
                )}
                <div>
                  <CardTitle className="text-base">{institute.name}</CardTitle>
                  <p className="mt-0.5 text-sm text-muted-foreground">{institute.location}</p>
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <IconButton
                  labelKey="action.edit"
                  icon={<FiEdit2 className="h-4 w-4" />}
                  onClick={() => setEditing(institute)}
                />
                <IconButton
                  labelKey="action.delete"
                  variant="destructive"
                  icon={<FiTrash2 className="h-4 w-4" />}
                  onClick={() => setDeleteTarget(institute)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              {institute.address ? <p>{institute.address}</p> : null}
              {institute.phone ? <p>{institute.phone}</p> : null}
              <p className="pt-1 font-medium text-foreground">
                {institute.studentCount} student{institute.studentCount === 1 ? "" : "s"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <FormModal
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
        title="Edit institute"
        formId="institute-form"
        saveLabel="Update institute"
        onCancel={() => setEditing(null)}
      >
        {editing ? (
          <InstituteForm
            formId="institute-form"
            hideActions
            institute={editing}
            onSuccess={() => setEditing(null)}
          />
        ) : null}
      </FormModal>

      <ConfirmModal
        key={deleteTarget?.id ?? "institute-delete-closed"}
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete institute"
        description={
          deleteTarget
            ? `Delete "${deleteTarget.name}"? Students will be unassigned from this institute.`
            : undefined
        }
        confirmLabel="Delete"
        confirmVariant="destructive"
        formAction={deleteInstituteAction}
        onSuccess={() => setDeleteTarget(null)}
      >
        {deleteTarget ? <input type="hidden" name="id" value={deleteTarget.id} /> : null}
      </ConfirmModal>
    </>
  );
}
