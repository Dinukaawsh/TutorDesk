import type { FeeStatus } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
};

export function FeeStatusCard({ status, count, active }: FeeStatusCardProps) {
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
      </CardContent>
    </Card>
  );
}
