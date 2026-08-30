"use client";

import { useState } from "react";
import { deleteAnnouncementAction } from "@/actions/announcement.actions";
import { AnnouncementForm } from "@/components/announcements/announcement-form";
import { AnnouncementList } from "@/components/announcements/announcement-list";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { FormModal } from "@/components/modals/form-modal";
import { AddButton } from "@/components/ui/add-button";
import { t } from "@/content/navigation";

type SubjectOption = { id: string; name: string };
type InstituteOption = { id: string; name: string; location: string };

type TeacherAnnouncementsClientProps = {
  announcements: Parameters<typeof AnnouncementList>[0]["announcements"];
  subjects: SubjectOption[];
  institutes: InstituteOption[];
  grades: string[];
};

export function TeacherAnnouncementsClient({
  announcements,
  subjects,
  institutes,
  grades,
}: TeacherAnnouncementsClientProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<
    Parameters<typeof AnnouncementList>[0]["announcements"][number] | null
  >(null);
  const [deleteTarget, setDeleteTarget] = useState<
    Parameters<typeof AnnouncementList>[0]["announcements"][number] | null
  >(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AddButton labelKey="action.addAnnouncement" onClick={() => setCreateOpen(true)} />
      </div>
      <AnnouncementList
        announcements={announcements}
        onEdit={setEditTarget}
        onDelete={setDeleteTarget}
      />
      <FormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New announcement"
        className="max-w-lg"
        formId="announcement-create-form"
        saveLabel="Publish announcement"
        onCancel={() => setCreateOpen(false)}
      >
        <AnnouncementForm
          formId="announcement-create-form"
          hideActions
          subjects={subjects}
          institutes={institutes}
          grades={grades}
          onSuccess={() => setCreateOpen(false)}
        />
      </FormModal>
      <FormModal
        open={Boolean(editTarget)}
        onOpenChange={(open) => !open && setEditTarget(null)}
        title="Edit announcement"
        className="max-w-lg"
        formId="announcement-edit-form"
        saveLabel="Save changes"
        onCancel={() => setEditTarget(null)}
      >
        {editTarget ? (
          <AnnouncementForm
            key={editTarget.id}
            formId="announcement-edit-form"
            hideActions
            announcement={editTarget}
            subjects={subjects}
            institutes={institutes}
            grades={grades}
            onSuccess={() => setEditTarget(null)}
          />
        ) : null}
      </FormModal>
      <ConfirmModal
        key={deleteTarget?.id ?? "announcement-delete-closed"}
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("modal.deleteAnnouncement.title")}
        formId={deleteTarget ? `delete-announcement-${deleteTarget.id}` : undefined}
        description={
          deleteTarget
            ? `Delete "${deleteTarget.title}"? ${t("modal.deleteAnnouncement.description")}`
            : undefined
        }
        confirmLabel={t("action.delete")}
        confirmVariant="destructive"
        formAction={deleteAnnouncementAction}
        onSuccess={() => setDeleteTarget(null)}
      >
        {deleteTarget ? <input type="hidden" name="id" value={deleteTarget.id} /> : null}
      </ConfirmModal>
    </div>
  );
}
