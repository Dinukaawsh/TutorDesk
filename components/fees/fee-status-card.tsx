import type { FeeStatus } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatSubjectMonthlyFee } from "@/content/navigation";
import { cn } from "@/lib/utils";

const labels: Record<FeeStatus, string> = {
  UNPAID: "Unpaid",
  PENDING: "Pending review",
  PAID: "Paid",
};

type FeeStatusCardProps = {
  status: FeeStatus;
  count: number;
  active?: boolean;
  totalMonthlyAmount?: number | null;
  currency?: string;
};

export function FeeStatusCard({
  status,
  count,
  active,
  totalMonthlyAmount,
  currency = "LKR",
}: FeeStatusCardProps) {
  const amountLabel =
    totalMonthlyAmount != null && totalMonthlyAmount > 0
      ? formatSubjectMonthlyFee(totalMonthlyAmount, currency)
      : null;

  return (
    <Card
      className={cn(
        "border-border bg-white/80 backdrop-blur",
        active && "ring-2 ring-primary",
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {labels[status]}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold text-foreground">{count}</p>
        {amountLabel ? (
          <p className="mt-1 text-xs text-muted-foreground">
            Listed subject fees: {amountLabel}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
