import { cn } from "@/lib/utils";

type CloudBackgroundProps = {
  children: React.ReactNode;
  className?: string;
};

export function CloudBackground({ children, className }: CloudBackgroundProps) {
  return (
    <div
      className={cn(
        "relative min-h-full bg-[#EEF4FF] text-foreground",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-white/70 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-white/60 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-white/50 blur-3xl" />
      </div>
      <div className="relative z-10 min-h-full">{children}</div>
    </div>
  );
}