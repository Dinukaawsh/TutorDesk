"use client";

import { useTransition } from "react";
import Link from "next/link";
import { AssignmentTarget } from "@prisma/client";
import { toggleAssignmentPublishFormAction } from "@/actions/assignment.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

export type AssignmentCardData = {
  id: string;
  title: string;
  deadline: Date;
  published: boolean;
  targetType: AssignmentTarget;
  grade: string | null;
  subject: { name: string };
  _count: { submissions: number };
};

function formatDeadline(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function AssignmentCard({ assignment }: { assignment: AssignmentCardData }) {
  const targetLabel =
    assignment.targetType === AssignmentTarget.GRADE
      ? `Grade ${assignment.grade ?? "â€”"}`
      : "Individual";

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <CardTitle className="text-lg">{assignment.title}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {assignment.subject.name} Â· {targetLabel}
          </p>
        </div>
        <StatusBadge label={assignment.published ? "Published" : "Draft"} tone={assignment.published ? "default" : "muted"} />
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">Due {formatDeadline(assignment.deadline)}</p>
        <p className="text-sm text-muted-foreground">{assignment._count.submissions} submission(s)</p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link href={`/teacher/assignments/${assignment.id}`}>View & grade</Link>
          </Button>
          <form action={toggleAssignmentPublishFormAction.bind(null, assignment.id, !assignment.published)}>
            <Button size="sm" type="submit" variant="outline">
              {assignment.published ? "Unpublish" : "Publish"}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

