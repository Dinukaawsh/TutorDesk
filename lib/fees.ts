import type { FeeStatus } from "@prisma/client";

export function getCurrentMonthYear() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export function formatFeeSummary(
  records: { status: FeeStatus; subject: { name: string } }[],
) {
  if (records.length === 0) {
    return "No fees";
  }
  const counts = records.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  return Object.entries(counts)
    .map(([status, count]) => `${count} ${status.toLowerCase()}`)
    .join(", ");
}
