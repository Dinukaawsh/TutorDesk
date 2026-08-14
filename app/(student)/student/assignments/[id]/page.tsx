import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { AssignmentTarget, Role, SubmissionStatus } from "@prisma/client";
import { auth } from "@/auth";
import { PageHeader } from "@/components/layout/page-header";
import { AssignmentAttachment } from "@/components/assignments/assignment-attachment";
import { AssignmentStatusCard } from "@/components/assignments/assignment-status-card";
import { SubmissionUpload } from "@/components/assignments/submission-upload";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

function canSubmitSubmission(
  latest: {
    status: SubmissionStatus;
    portalOpen: boolean;
    resubmitDeadline: Date | null;
  } | null,
  now: Date,
) {
  if (!latest) {
    return true;
  }
  return (
    latest.status === SubmissionStatus.FAILED &&
    latest.portalOpen &&
    latest.resubmitDeadline != null &&
    now <= latest.resubmitDeadline
  );
}

export default async function StudentAssignmentDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== Role.STUDENT) {
    redirect("/login");
  }

  const student = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { enrollments: true },
  });

  if (!student) redirect("/login");

  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: { subject: { select: { name: true } } },
  });

  if (!assignment || !assignment.published) notFound();

  const enrolled = student.enrollments.some((e) => e.subjectId === assignment.subjectId);
  const grade = student.grade ?? "";
  const isGradeTarget =
    assignment.targetType === AssignmentTarget.GRADE &&
    assignment.grade === grade &&
    enrolled;
  const isIndividualTarget =
    assignment.targetType === AssignmentTarget.INDIVIDUAL &&
    assignment.individualStudentId === student.id;

  if (!isGradeTarget && !isIndividualTarget) notFound();

  const latestSubmission = await prisma.submission.findFirst({
    where: { assignmentId: assignment.id, studentId: student.id },
    orderBy: { attemptNumber: "desc" },
  });

  const now = new Date();
  const canSubmit = canSubmitSubmission(latestSubmission, now);

  let helperText: string | undefined;
  if (!canSubmit && latestSubmission) {
    if (latestSubmission.status !== SubmissionStatus.FAILED) {
      helperText =
        "Your submission is on file. You can resubmit only if your teacher reopens the portal after a failed grade.";
    } else if (!latestSubmission.portalOpen) {
      helperText = "The submission portal is closed.";
    } else if (latestSubmission.resubmitDeadline && now > latestSubmission.resubmitDeadline) {
      helperText = "The resubmit deadline has passed.";
    } else {
      helperText = "You cannot submit at this time.";
    }
  }

  return (
    <>
      <PageHeader
        title="Assignment"
        actions={
          <Button variant="outline" asChild>
            <Link href="/student/assignments">Back</Link>
          </Button>
        }
      />
      <div className="space-y-6">
        <AssignmentStatusCard
          assignment={{
            ...assignment,
            latestSubmission: latestSubmission
              ? {
                  status: latestSubmission.status,
                  isLate: latestSubmission.isLate,
                  marks: latestSubmission.marks,
                  feedback: latestSubmission.feedback,
                  attemptNumber: latestSubmission.attemptNumber,
                }
              : null,
          }}
        />
        {assignment.attachmentUrl ? (
          <div className="rounded-lg border border-border bg-white/80 p-4">
            <p className="mb-2 text-sm font-medium">Teacher attachment</p>
            <AssignmentAttachment attachmentUrl={assignment.attachmentUrl} title={assignment.title} />
          </div>
        ) : null}
        <SubmissionUpload assignmentId={assignment.id} canSubmit={canSubmit} helperText={helperText} />
      </div>
    </>
  );
}
