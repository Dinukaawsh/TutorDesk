import type { FeeStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { t } from "@/content/navigation";
import { cn } from "@/lib/utils";

const feeStatusKeys = {
  UNPAID: "fee.status.unpaid",
  PENDING: "fee.status.pending",
  PAID: "fee.status.paid",
} as const satisfies Record<FeeStatus, "fee.status.unpaid" | "fee.status.pending" | "fee.status.paid">;

export function feeStatusLabel(status: FeeStatus): string {
  return t(feeStatusKeys[status]);
}

export function accountStatusLabel(isDisabled: boolean): string {
  return isDisabled ? t("account.disabled") : t("account.active");
}

type StatusBadgeProps = {
  label: string;
  tone?: "default" | "muted" | "outline";
  className?: string;
};

export function StatusBadge({
  label,
  tone = "outline",
  className,
}: StatusBadgeProps) {
  return (
    <Badge variant={tone} className={cn(className)}>
      {label}
    </Badge>
  );
}

type FeeStatusBadgeProps = {
  status: FeeStatus;
  tone?: StatusBadgeProps["tone"];
  className?: string;
};

export function FeeStatusBadge({
  status,
  tone = "outline",
  className,
}: FeeStatusBadgeProps) {
  return (
    <StatusBadge
      label={feeStatusLabel(status)}
      tone={tone}
      className={className}
    />
  );
}

type AccountStatusBadgeProps = {
  isDisabled: boolean;
  className?: string;
};

export function AccountStatusBadge({
  isDisabled,
  className,
}: AccountStatusBadgeProps) {
  return (
    <StatusBadge
      label={accountStatusLabel(isDisabled)}
      tone={isDisabled ? "outline" : "default"}
      className={className}
    />
  );
}
