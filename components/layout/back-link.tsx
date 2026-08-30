import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { cn } from "@/lib/utils";

type BackLinkProps = {
  href: string;
  label?: string;
  className?: string;
};

export function BackLink({ href, label = "Back", className }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "mb-4 inline-flex items-center gap-2 rounded-lg border border-border bg-white/80 px-3 py-2 text-sm font-medium text-foreground shadow-sm backdrop-blur transition-colors hover:bg-muted/50",
        className,
      )}
    >
      <FiArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
      {label}
    </Link>
  );
}
