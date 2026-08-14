type StudentTagBadgeProps = {
  name: string;
  color?: string | null;
};

export function StudentTagBadge({ name, color }: StudentTagBadgeProps) {
  return (
    <span
      className="inline-flex items-center rounded-[var(--radius-sm)] border border-border px-2 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: color ? `${color}18` : undefined,
        borderColor: color ?? undefined,
        color: color ?? undefined,
      }}
    >
      {name}
    </span>
  );
}
