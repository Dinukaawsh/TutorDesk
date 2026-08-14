"use client";

import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { FormModal } from "@/components/modals/form-modal";
import { IconButton } from "@/components/modals/icon-button";
import { SubjectForm } from "@/components/subjects/subject-form";

export function SubjectsPageActions() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton
        labelKey="action.addSubject"
        icon={<FiPlus className="h-4 w-4" />}
        variant="default"
        onClick={() => setOpen(true)}
      />
      <FormModal
        open={open}
        onOpenChange={setOpen}
        title="New subject"
        formId="subject-form"
        saveLabel="Create subject"
        onCancel={() => setOpen(false)}
      >
        <SubjectForm formId="subject-form" hideActions onSuccess={() => setOpen(false)} />
      </FormModal>
    </>
  );
}
