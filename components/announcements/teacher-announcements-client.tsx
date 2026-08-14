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
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <IconButton
          labelKey="action.add"
          icon={<FiPlus className="h-4 w-4" />}
          variant="default"
          onClick={() => setOpen(true)}
        />
      </div>
      <AnnouncementList announcements={announcements} />
      <FormModal
        open={open}
        onOpenChange={setOpen}
        title="New announcement"
        className="max-w-lg"
        formId="announcement-form"
        saveLabel="Publish announcement"
        onCancel={() => setOpen(false)}
      >
        <AnnouncementForm
          formId="announcement-form"
          hideActions
          subjects={subjects}
          grades={grades}
          onSuccess={() => setOpen(false)}
        />
      </FormModal>
    </div>
  );
}
