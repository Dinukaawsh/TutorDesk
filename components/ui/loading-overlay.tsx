import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type LoadingOverlayProps = {
  visible?: boolean;
  label?: string;
  className?: string;
};

export function LoadingOverlay({
  visible = true,
  label = "Loading…",
  className,
}: LoadingOverlayProps) {
  if (!visible) {
    return null;
  }

  return (
    <div
      className={cn(
        "absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 rounded-[inherit] bg-white/70 backdrop-blur-sm",
        className,
      )}
      aria-busy="true"
      aria-live="polite"
    >
      <Spinner size="lg" />
      {label ? <p className="text-sm text-muted-foreground">{label}</p> : null}
    </div>
  );
}
