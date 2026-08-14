"use client";

import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { AnnouncementForm } from "@/components/announcements/announcement-form";
import { AnnouncementList } from "@/components/announcements/announcement-list";
import { FormModal } from "@/components/modals/form-modal";
import { IconButton } from "@/components/modals/icon-button";

type SubjectOption = { id: string; name: string };

type TeacherAnnouncementsClientProps = {
  announcements: Parameters<typeof AnnouncementList>[0]["announcements"];
  subjects: SubjectOption[];
  grades: string[];
};

export function TeacherAnnouncementsClient({
  announcements,
  subjects,
  grades,
}: TeacherAnnouncementsClientProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<
    Parameters<typeof AnnouncementList>[0]["announcements"][number] | null
  >(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <IconButton
          labelKey="action.add"
          icon={<FiPlus className="h-4 w-4" />}
          variant="default"
          onClick={() => setCreateOpen(true)}
        />
      </div>
      <AnnouncementList announcements={announcements} onEdit={setEditTarget} />
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
            grades={grades}
            onSuccess={() => setEditTarget(null)}
          />
        ) : null}
      </FormModal>
    </div>
  );
}
