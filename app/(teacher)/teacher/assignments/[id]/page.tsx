import Link from "next/link";
import { notFound } from "next/navigation";
import { AssignmentTarget } from "@prisma/client";
import { BackLink } from "@/components/layout/back-link";
import { PageHeader } from "@/components/layout/page-header";
import { SubmissionList } from "@/components/assignments/submission-list";
import { StatusBadge } from "@/components/ui/status-badge";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export default async function TeacherAssignmentDetailPage({ params }: Props) {
  const { id } = await params;
  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: {
      subject: true,
      individualStudent: { select: { name: true } },
      submissions: {
        orderBy: { createdAt: "desc" },
        include: { student: { select: { name: true, email: true } } },
      },
    },
  });

  if (!assignment) notFound();

  const targetLabel =
    assignment.targetType === AssignmentTarget.GRADE
      ? `Grade ${assignment.grade ?? "—"}`
      : assignment.individualStudent?.name ?? "Individual";

  return (
    <>
      <BackLink href="/teacher/assignments" label="Back to assignments" />
      <PageHeader
        title={assignment.title}
        description={`${assignment.subject.name} · ${targetLabel}`}
      />
      <div className="mb-6 space-y-2 rounded-lg border border-border bg-white/80 p-4 text-sm">
        <div className="flex flex-wrap gap-2">
          <StatusBadge label={assignment.published ? "Published" : "Draft"} />
        </div>
        {assignment.instructions ? <p>{assignment.instructions}</p> : null}
        {assignment.attachmentUrl ? (
          <Link href={assignment.attachmentUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline-offset-4 hover:underline">
            Assignment attachment
          </Link>
        ) : null}
      </div>
      <h2 className="mb-4 text-lg font-semibold">Submissions</h2>
      <SubmissionList submissions={assignment.submissions} />
    </>
  );
}
