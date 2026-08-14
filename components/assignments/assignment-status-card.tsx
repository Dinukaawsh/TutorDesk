import Link from "next/link";
import { SubmissionStatus } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

export type AssignmentStatusData = {
  id: string;
  title: string;
  instructions: string | null;
  attachmentUrl: string | null;
  deadline: Date;
  subject: { name: string };
  latestSubmission: {
    status: SubmissionStatus;
    isLate: boolean;
    marks: number | null;
    feedback: string | null;
    attemptNumber: number;
  } | null;
};

function formatDeadline(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function AssignmentStatusCard({ assignment }: { assignment: AssignmentStatusData }) {
  const submission = assignment.latestSubmission;
  const pastDue = new Date() > assignment.deadline;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{assignment.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{assignment.subject.name}</p>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="text-muted-foreground">Due {formatDeadline(assignment.deadline)}</p>
        {assignment.instructions ? <p>{assignment.instructions}</p> : null}
        {assignment.attachmentUrl ? (
          <Link href={assignment.attachmentUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline-offset-4 hover:underline">
            Download attachment
          </Link>
        ) : null}
        {submission ? (
          <div className="flex flex-wrap gap-2 pt-2">
            <StatusBadge label={submission.status.replace("_", " ")} />
            {submission.isLate ? <StatusBadge label="Late" tone="muted" /> : null}
            {submission.marks != null ? (
              <StatusBadge label={`${submission.marks}/100`} tone="outline" />
            ) : null}
          </div>
        ) : (
          <p className="text-muted-foreground">{pastDue ? "Past deadline — late submission allowed" : "Not submitted yet"}</p>
        )}
        {submission?.feedback ? (
          <p className="rounded-lg bg-muted px-3 py-2 text-muted-foreground">Feedback: {submission.feedback}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
