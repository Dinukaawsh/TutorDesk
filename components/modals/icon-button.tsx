"use client";

import * as React from "react";
import { IconButton as UiIconButton } from "@/components/ui/icon-button";
import { t, type LabelKey } from "@/content/navigation";

type ModalIconButtonProps = Omit<React.ComponentProps<typeof UiIconButton>, "label"> & {
  labelKey: LabelKey;
};

export function IconButton({ labelKey, ...props }: ModalIconButtonProps) {
  return <UiIconButton label={t(labelKey)} {...props} />;
}