"use client";

import { useState } from "react";
import {
  bulkDisableStudentsAction,
  bulkEnableStudentsAction,
} from "@/actions/student.actions";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { BottomActionBar } from "@/components/ui/bottom-action-bar";
import { Button } from "@/components/ui/button";
import { t } from "@/content/navigation";

type BulkActionBarProps = {
  selectedIds: string[];
  onClear: () => void;
};

export function BulkActionBar({ selectedIds, onClear }: BulkActionBarProps) {
  const [disableOpen, setDisableOpen] = useState(false);
  const [enableOpen, setEnableOpen] = useState(false);

  return (
    <>
      <BottomActionBar open={selectedIds.length > 0}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium">{selectedIds.length} selected</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" className="rounded-[4px]" onClick={onClear}>
              Clear
            </Button>
            <Button type="button" size="sm" className="rounded-[4px]" onClick={() => setEnableOpen(true)}>
              {t("action.enable")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="rounded-[4px]"
              onClick={() => setDisableOpen(true)}
            >
              {t("action.disable")}
            </Button>
          </div>
        </div>
      </BottomActionBar>

      <ConfirmModal
        open={enableOpen}
        onOpenChange={setEnableOpen}
        title={t("modal.enableStudent.title")}
        description={t("modal.enableStudent.description")}
        confirmLabel={t("action.enable")}
        formAction={bulkEnableStudentsAction}
        onSuccess={() => {
          setEnableOpen(false);
          onClear();
        }}
      >
        {selectedIds.map((id) => (
          <input key={id} type="hidden" name="ids" value={id} />
        ))}
      </ConfirmModal>

      <ConfirmModal
        open={disableOpen}
        onOpenChange={setDisableOpen}
        title={t("modal.disableStudent.title")}
        description="Provide a shared reason for disabling selected students."
        confirmLabel={t("action.disable")}
        confirmVariant="destructive"
        formAction={bulkDisableStudentsAction}
        note={{ name: "reason", label: "Shared reason", required: true }}
        onSuccess={() => {
          setDisableOpen(false);
          onClear();
        }}
      >
        {selectedIds.map((id) => (
          <input key={id} type="hidden" name="ids" value={id} />
        ))}
      </ConfirmModal>
    </>
  );
}
