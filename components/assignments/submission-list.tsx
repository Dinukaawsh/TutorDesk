import Link from "next/link";
import { SubmissionStatus } from "@prisma/client";
import { GradingPanel } from "@/components/assignments/grading-panel";
import { StatusBadge } from "@/components/ui/status-badge";

export type SubmissionListItem = {
  id: string;
  status: SubmissionStatus;
  isLate: boolean;
  marks: number | null;
  feedback: string | null;
  fileUrls: string[];
  attemptNumber: number;
  createdAt: Date;
  student: { name: string; email: string };
};

function formatWhen(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function SubmissionList({ submissions }: { submissions: SubmissionListItem[] }) {
  if (submissions.length === 0) {
    return <p className="text-sm text-muted-foreground">No submissions yet.</p>;
  }

  return (
    <div className="space-y-6">
      {submissions.map((submission) => (
        <div key={submission.id} className="rounded-lg border border-border bg-white/80 p-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <p className="font-medium">{submission.student.name}</p>
            <StatusBadge label={submission.status.replace("_", " ")} />
            {submission.isLate ? <StatusBadge label="Late" tone="muted" /> : null}
            <span className="text-xs text-muted-foreground">
              Attempt {submission.attemptNumber} · {formatWhen(submission.createdAt)}
            </span>
          </div>
          <ul className="mb-3 list-inside list-disc text-sm">
            {submission.fileUrls.map((url) => (
              <li key={url}>
                <Link href={url} target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-4 hover:underline">
                  View file
                </Link>
              </li>
            ))}
          </ul>
          <GradingPanel
            submissionId={submission.id}
            defaultMarks={submission.marks}
            defaultStatus={submission.status}
            defaultFeedback={submission.feedback}
          />
        </div>
      ))}
    </div>
  );
}
