import { cn } from "@/lib/utils";

type FieldErrorProps = {
  message?: string | null;
  className?: string;
};

export function FieldError({ message, className }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p className={cn("text-sm text-destructive", className)} role="alert">
      {message}
    </p>
  );
}
