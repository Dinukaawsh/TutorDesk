"use client";

import { useState, useTransition } from "react";
import { FiLogOut } from "react-icons/fi";
import { logoutAction } from "@/actions/auth.actions";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { IconButton } from "@/components/modals/icon-button";
import { t } from "@/content/navigation";

export function HeaderSignOutButton() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await logoutAction();
    });
  }

  return (
    <>
      <IconButton
        labelKey="action.signOut"
        icon={<FiLogOut className="h-4 w-4" />}
        onClick={() => setOpen(true)}
      />
      <ConfirmModal
        open={open}
        onOpenChange={setOpen}
        title={t("modal.signOut.title")}
        description={t("modal.signOut.description")}
        confirmLabel={t("action.signOut")}
        confirmVariant="destructive"
        loading={pending}
        onConfirm={handleConfirm}
      />
    </>
  );
}

