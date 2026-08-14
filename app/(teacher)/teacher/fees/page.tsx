import { Suspense } from "react";
import Link from "next/link";
import { FeeStatus } from "@prisma/client";
import { getFeeStatusSummary, getTeacherFees } from "@/actions/fee.actions";
import { listSubjects } from "@/actions/subject.actions";
import { FeeReviewTable } from "@/components/fees/fee-review-table";
import { FeeStatusCard } from "@/components/fees/fee-status-card";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentMonthYear } from "@/lib/fees";

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
  const q = param(params.q);
  const highlight = param(params.highlight);

  const month = monthRaw ? Number(monthRaw) : currentMonth;
  const year = yearRaw ? Number(yearRaw) : currentYear;
  const status =
    statusRaw === "UNPAID" || statusRaw === "PENDING" || statusRaw === "PAID"
      ? (statusRaw as FeeStatus)
      : undefined;

  const filters = { month, year, status, subjectId, q };
  const [records, summary, subjects] = await Promise.all([
    getTeacherFees(filters),
    getFeeStatusSummary(filters),
    listSubjects(),
  ]);

  const periodLabel = `${MONTHS[month - 1] ?? month} ${year}`;

  return (
    <>
      <PageHeader
        title="Fees"
        description={`Review payment proofs for ${periodLabel}`}
      />

      <form
        method="get"
        className="mb-6 grid gap-4 rounded-xl border border-border bg-white/80 p-4 backdrop-blur sm:grid-cols-2 lg:grid-cols-5"
      >
        <div className="space-y-1">
          <Label htmlFor="month">Month</Label>
          <Input id="month" name="month" type="number" min={1} max={12} defaultValue={month} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="year">Year</Label>
          <Input id="year" name="year" type="number" min={2020} defaultValue={year} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={status ?? ""}
            className="flex h-10 w-full rounded-md border border-border bg-white px-3 text-sm"
          >
            <option value="">All</option>
            <option value="UNPAID">Unpaid</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="subjectId">Subject</Label>
          <select
            id="subjectId"
            name="subjectId"
            defaultValue={subjectId ?? ""}
            className="flex h-10 w-full rounded-md border border-border bg-white px-3 text-sm"
          >
            <option value="">All subjects</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1 sm:col-span-2 lg:col-span-1">
          <Label htmlFor="q">Student</Label>
          <Input id="q" name="q" placeholder="Name or email" defaultValue={q ?? ""} />
        </div>
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5">
          <Button type="submit">Apply filters</Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/teacher/fees">Reset</Link>
          </Button>
        </div>
      </form>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <FeeStatusCard status={FeeStatus.UNPAID} count={summary.UNPAID} active={status === "UNPAID"} />
        <FeeStatusCard status={FeeStatus.PENDING} count={summary.PENDING} active={status === "PENDING"} />
        <FeeStatusCard status={FeeStatus.PAID} count={summary.PAID} active={status === "PAID"} />
      </div>

      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading fees...</p>}>
        <FeeReviewTable records={records} highlightId={highlight} />
      </Suspense>
    </>
  );
}
