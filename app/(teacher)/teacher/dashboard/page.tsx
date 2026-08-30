import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getTeacherDashboard } from "@/actions/dashboard.actions";
import { listInstitutes } from "@/actions/institute.actions";
import { listStudentTags } from "@/actions/tag.actions";
import { TeacherDashboardFilters } from "@/components/dashboard/teacher-dashboard-filters";
import { DashboardBarChart, DashboardDonutChart } from "@/components/dashboard/dashboard-charts";
import { TeacherStudentOverviewTable } from "@/components/dashboard/teacher-student-overview-table";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/content/navigation";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function param(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function parseMonth(value: string | undefined) {
  if (!value) return undefined;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 12) return undefined;
  return n;
}

function parseYear(value: string | undefined) {
  if (!value) return undefined;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 2000 || n > 2100) return undefined;
  return n;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card className="border-border bg-white/80 shadow-sm backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}

export default async function TeacherDashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [data, tagRows, instituteRows] = await Promise.all([
    getTeacherDashboard({
      subjectId: param(params.subjectId),
      grade: param(params.grade),
      month: parseMonth(param(params.month)),
      year: parseYear(param(params.year)),
    }),
    listStudentTags(),
    listInstitutes(),
  ]);
  const tags = tagRows.map((tag) => ({ id: tag.id, name: tag.name, color: tag.color }));
  const institutes = instituteRows.map((i) => ({
    id: i.id,
    name: i.name,
    location: i.location,
  }));

  if (!data) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("dashboard.teacher.title")}
        description={t("dashboard.teacher.description")}
      />

      <Suspense fallback={null}>
        <TeacherDashboardFilters
          subjects={data.subjects}
          grades={data.grades}
          month={data.filters.month}
          year={data.filters.year}
        />
      </Suspense>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title={t("dashboard.stat.totalStudents")} value={data.stats.totalStudents} />
        <StatCard
          title={t("dashboard.stat.pendingFeeReviews")}
          value={data.stats.pendingFeeReviews}
        />
        <StatCard title={t("dashboard.stat.unpaidFees")} value={data.stats.unpaidFees} />
        <StatCard
          title={t("dashboard.stat.assignmentsDueWeek")}
          value={data.stats.assignmentsDueThisWeek}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border bg-white/80 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle className="text-base">Students by grade</CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardBarChart items={data.charts.studentsByGrade} emptyLabel="No students to chart yet." />
          </CardContent>
        </Card>
        <Card className="border-border bg-white/80 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle className="text-base">Fee status this month</CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardDonutChart items={data.charts.feeStatusBreakdown} emptyLabel="No fee records yet." />
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("dashboard.section.studentOverview")}</h2>
        <TeacherStudentOverviewTable
          students={data.students}
          subjects={data.subjects}
          tags={tags}
          institutes={institutes}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("dashboard.section.recentActivity")}</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-border bg-white/80 shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base">
                {t("dashboard.section.homeworkSubmissions")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.recentHomework.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("dashboard.empty.recentActivity")}
                </p>
              ) : (
                <ul className="space-y-3 text-sm">
                  {data.recentHomework.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-col gap-0.5 border-b border-border pb-3 last:border-0 last:pb-0"
                    >
                      <span className="font-medium">{item.studentName}</span>
                      <span className="text-muted-foreground">
                        {item.subjectName} · {item.assignmentTitle}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatDate(item.date)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-white/80 shadow-sm backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base">
                {t("dashboard.section.feeProofSubmissions")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.recentFeeProofs.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("dashboard.empty.recentActivity")}
                </p>
              ) : (
                <ul className="space-y-3 text-sm">
                  {data.recentFeeProofs.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-col gap-0.5 border-b border-border pb-3 last:border-0 last:pb-0"
                    >
                      <span className="font-medium">{item.studentName}</span>
                      <span className="text-muted-foreground">{item.subjectName}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(item.date)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
