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

export function decimalToNumber(value: unknown): number | null {
  if (value == null) {
    return null;
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "object" && value !== null && "toNumber" in value) {
    return (value as { toNumber: () => number }).toNumber();
  }
  const parsed = Number(String(value));
  return Number.isNaN(parsed) ? null : parsed;
}

export type FeePaymentLabelKey = "fee.allPaid" | "fee.pending" | "fee.unpaid" | "fee.mixed" | "fee.none";

export function getFeePaymentLabelKey(
  records: { status: FeeStatus }[],
): FeePaymentLabelKey {
  if (records.length === 0) {
    return "fee.none";
  }
  const statuses = new Set(records.map((r) => r.status));
  if (statuses.size === 1) {
    const only = records[0]!.status;
    if (only === "PAID") return "fee.allPaid";
    if (only === "PENDING") return "fee.pending";
    return "fee.unpaid";
  }
  if (statuses.has("PENDING")) {
    return "fee.pending";
  }
  if (statuses.has("UNPAID")) {
    return "fee.unpaid";
  }
  return "fee.mixed";
}
