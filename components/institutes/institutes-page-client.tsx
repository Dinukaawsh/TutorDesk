"use client";

import { useState } from "react";
import { InstituteForm } from "@/components/institutes/institute-form";
import { InstituteList, type InstituteCardData } from "@/components/institutes/institute-list";
import { FormModal } from "@/components/modals/form-modal";
import { AddButton } from "@/components/ui/add-button";
import { t } from "@/content/navigation";

type InstitutesPageClientProps = {
  institutes: InstituteCardData[];
};

export function InstitutesPageClient({ institutes }: InstitutesPageClientProps) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AddButton labelKey="action.addInstitute" onClick={() => setCreateOpen(true)} />
      </div>
      <InstituteList institutes={institutes} />

      <FormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        title={t("institutes.createTitle")}
        formId="create-institute-form"
        saveLabel={t("institutes.createAction")}
        onCancel={() => setCreateOpen(false)}
      >
        <InstituteForm
          formId="create-institute-form"
          hideActions
          onSuccess={() => setCreateOpen(false)}
        />
      </FormModal>
    </div>
  );
}
