import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { AssignmentTarget, Role, SubmissionStatus } from "@prisma/client";
import { auth } from "@/auth";
import { PageHeader } from "@/components/layout/page-header";
import { AssignmentStatusCard } from "@/components/assignments/assignment-status-card";
import { SubmissionUpload } from "@/components/assignments/submission-upload";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

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
  const pastDeadline = now > assignment.deadline;

  let canSubmit = false;
  let helperText: string | undefined;

  if (!latestSubmission) {
    canSubmit = true;
  } else if (latestSubmission.status === SubmissionStatus.FAILED && !pastDeadline) {
    canSubmit = true;
    helperText = undefined;
  } else if (latestSubmission.status === SubmissionStatus.FAILED && pastDeadline) {
    helperText = "Resubmission is only allowed before the deadline.";
  } else {
    helperText = "Your submission is on file. Resubmit is only available if marked failed before the deadline.";
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
        <SubmissionUpload assignmentId={assignment.id} canSubmit={canSubmit} helperText={helperText} />
      </div>
    </>
  );
}
