import Link from "next/link";
import { redirect } from "next/navigation";
import { FiUpload } from "react-icons/fi";
import { getStudentDashboard } from "@/actions/dashboard.actions";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FeeStatusBadge, StatusBadge } from "@/components/ui/status-badge";
import { StudentTagBadge } from "@/components/students/student-tag-badge";
import { t } from "@/content/navigation";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDeadline(iso: string) {
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

export default async function StudentDashboardPage() {
  const data = await getStudentDashboard();
  if (!data) {
    redirect("/login");
  }

  const closingIds = new Set(data.closingDeadlines.map((a) => a.id));

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${t("dashboard.student.welcome")}, ${data.student.name}`}
        description={
          data.student.grade
            ? `${t("dashboard.student.description")} · ${t("dashboard.table.grade")} ${data.student.grade}`
            : t("dashboard.student.description")
        }
      />

      {data.tags.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">{t("students.tags.assign")}:</span>
          {data.tags.map((tag) => (
            <StudentTagBadge key={tag.id} name={tag.name} color={tag.color} />
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={t("dashboard.stat.enrolledSubjects")}
          value={data.stats.enrolledSubjects}
        />
        <StatCard
          title={t("dashboard.stat.pendingAssignments")}
          value={data.stats.pendingAssignments}
        />
        <StatCard title={t("dashboard.stat.dueThreeDays")} value={data.stats.dueWithinThreeDays} />
        <StatCard
          title={t("dashboard.stat.recentSubmissions")}
          value={data.stats.recentSubmissionsCount}
        />
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("dashboard.section.mySubjects")}</h2>
        {data.subjects.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("dashboard.empty.recentActivity")}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.subjects.map((subject) => (
              <Card
                key={subject.id}
                className="border-border bg-white/80 shadow-sm backdrop-blur"
                style={
                  subject.color
                    ? { borderLeftWidth: 4, borderLeftColor: subject.color }
                    : undefined
                }
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{subject.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <FeeStatusBadge status={subject.feeStatus} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("dashboard.section.pendingAssignments")}</h2>
        <div className="overflow-x-auto rounded-xl border border-border bg-white/80 backdrop-blur">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">{t("dashboard.table.assignment")}</th>
                <th className="p-3 font-medium">{t("dashboard.filter.subject")}</th>
                <th className="p-3 font-medium">{t("dashboard.table.deadline")}</th>
                <th className="p-3 font-medium">{t("dashboard.table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {data.pendingAssignments.map((assignment) => (
                <tr
                  key={assignment.id}
                  className={cn(
                    "border-b border-border last:border-0",
                    closingIds.has(assignment.id) && "bg-amber-50/80",
                  )}
                >
                  <td className="p-3 font-medium">{assignment.title}</td>
                  <td className="p-3">{assignment.subjectName}</td>
                  <td className="p-3">{formatDeadline(assignment.deadline)}</td>
                  <td className="p-3">
                    <Link
                      href={`/student/assignments/${assignment.id}`}
                      className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                      aria-label={t("dashboard.action.submit")}
                    >
                      <FiUpload className="size-4" />
                      <span>{t("dashboard.action.submit")}</span>
                    </Link>
                  </td>
                </tr>
              ))}
              {data.pendingAssignments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-muted-foreground">
                    {t("dashboard.empty.pendingAssignments")}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("dashboard.section.closingDeadlines")}</h2>
        <div className="overflow-x-auto rounded-xl border border-border bg-white/80 backdrop-blur">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">{t("dashboard.table.assignment")}</th>
                <th className="p-3 font-medium">{t("dashboard.filter.subject")}</th>
                <th className="p-3 font-medium">{t("dashboard.table.deadline")}</th>
                <th className="p-3 font-medium">{t("dashboard.table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {data.closingDeadlines.map((assignment) => (
                <tr key={assignment.id} className="border-b border-border bg-amber-50/80 last:border-0">
                  <td className="p-3 font-medium">{assignment.title}</td>
                  <td className="p-3">{assignment.subjectName}</td>
                  <td className="p-3 font-medium text-amber-900">{formatDeadline(assignment.deadline)}</td>
                  <td className="p-3">
                    <Link
                      href={`/student/assignments/${assignment.id}`}
                      className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                    >
                      <FiUpload className="size-4" />
                      <span>{t("dashboard.action.submit")}</span>
                    </Link>
                  </td>
                </tr>
              ))}
              {data.closingDeadlines.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-muted-foreground">
                    {t("dashboard.empty.closingDeadlines")}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("dashboard.section.recentSubmissionsList")}</h2>
        <div className="overflow-x-auto rounded-xl border border-border bg-white/80 backdrop-blur">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">{t("dashboard.table.assignment")}</th>
                <th className="p-3 font-medium">{t("dashboard.filter.subject")}</th>
                <th className="p-3 font-medium">{t("dashboard.table.status")}</th>
                <th className="p-3 font-medium">{t("dashboard.table.marks")}</th>
                <th className="p-3 font-medium">{t("dashboard.table.date")}</th>
              </tr>
            </thead>
            <tbody>
              {data.recentSubmissions.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="p-3 font-medium">{row.assignmentTitle}</td>
                  <td className="p-3">{row.subjectName}</td>
                  <td className="p-3">
                    <StatusBadge label={row.status.replaceAll("_", " ")} />
                  </td>
                  <td className="p-3">{row.marks ?? "—"}</td>
                  <td className="p-3 text-muted-foreground">{formatDate(row.date)}</td>
                </tr>
              ))}
              {data.recentSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">
                    {t("dashboard.empty.recentSubmissions")}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
