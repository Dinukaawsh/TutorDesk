import { Suspense } from "react";
import Link from "next/link";
import { FeeStatus } from "@prisma/client";
import { getFeeStatusSummary, getTeacherFees } from "@/actions/fee.actions";
import { listSubjects } from "@/actions/subject.actions";
import { FeeFilters } from "@/components/fees/fee-filters";
import { FeeReviewTable, type FeeReviewRow } from "@/components/fees/fee-review-table";
import { FeeStatusCard } from "@/components/fees/fee-status-card";
import { PageHeader } from "@/components/layout/page-header";
import { decimalToNumber, getCurrentMonthYear } from "@/lib/fees";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function param(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default async function TeacherFeesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { month: currentMonth, year: currentYear } = getCurrentMonthYear();

  const monthRaw = param(params.month);
  const yearRaw = param(params.year);
  const statusRaw = param(params.status);
  const subjectId = param(params.subjectId);
  const grade = param(params.grade);
  const q = param(params.q);
  const highlight = param(params.highlight);

  const month = monthRaw ? Number(monthRaw) : currentMonth;
  const year = yearRaw ? Number(yearRaw) : currentYear;
  const status =
    statusRaw === "UNPAID" || statusRaw === "PENDING" || statusRaw === "PAID"
      ? (statusRaw as FeeStatus)
      : undefined;

  const filters = { month, year, status, subjectId, grade, q };
  const [rawRecords, summary, subjects] = await Promise.all([
    getTeacherFees(filters),
    getFeeStatusSummary(filters),
    listSubjects(),
  ]);

  const records: FeeReviewRow[] = rawRecords.map((record) => ({
    ...record,
    subject: {
      ...record.subject,
      monthlyFee: decimalToNumber(record.subject.monthlyFee),
    },
  }));

  const grades = [
    ...new Set(
      records
        .map((r) => r.student.grade)
        .filter((g): g is string => Boolean(g)),
    ),
  ].sort();

  const totalListedFees = records.reduce((sum, record) => {
    const fee = record.subject.monthlyFee ?? 0;
    return sum + fee;
  }, 0);

  const periodLabel = `${MONTHS[month - 1] ?? month} ${year}`;

  return (
    <>
      <PageHeader
        title="Fees"
        description={`Review payment proofs for ${periodLabel}`}
      />

      <form
        method="get"
        className="mb-6 grid gap-4 rounded-xl border border-border bg-white/80 p-4 backdrop-blur sm:grid-cols-2 lg:grid-cols-6"
      >
        <FeeFilters
          month={month}
          year={year}
          status={status ?? ""}
          subjectId={subjectId ?? ""}
          grade={grade ?? ""}
          q={q ?? ""}
          subjects={subjects}
          grades={grades}
        />
      </form>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <FeeStatusCard status={FeeStatus.UNPAID} count={summary.UNPAID} active={status === "UNPAID"} totalMonthlyAmount={totalListedFees} />
        <FeeStatusCard status={FeeStatus.PENDING} count={summary.PENDING} active={status === "PENDING"} totalMonthlyAmount={totalListedFees} />
        <FeeStatusCard status={FeeStatus.PAID} count={summary.PAID} active={status === "PAID"} totalMonthlyAmount={totalListedFees} />
      </div>

      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading fees...</p>}>
        <FeeReviewTable records={records} highlightId={highlight} />
      </Suspense>
    </>
  );
}
