import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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