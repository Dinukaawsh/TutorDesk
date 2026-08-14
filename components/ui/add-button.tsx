"use client";

import * as React from "react";
import { FiPlus } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { t, type LabelKey } from "@/content/navigation";

type AddButtonProps = Omit<React.ComponentProps<typeof Button>, "children"> & {
  labelKey: LabelKey;
};

export function AddButton({ labelKey, className, variant = "outline", ...props }: AddButtonProps) {
  return (
    <Button variant={variant} className={cn("rounded-[4px]", className)} {...props}>
      <FiPlus className="h-4 w-4" />
      {t(labelKey)}
    </Button>
  );
}
