"use client";

import { useState } from "react";
import { FormModal } from "@/components/modals/form-modal";
import { AddButton } from "@/components/ui/add-button";
import { SubjectForm } from "@/components/subjects/subject-form";

export function SubjectsPageActions() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AddButton labelKey="action.addSubject" onClick={() => setOpen(true)} />
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
