"use client";

import { useTransition } from "react";
import Link from "next/link";
import { LessonType } from "@prisma/client";
import { toggleLessonPublishFormAction } from "@/actions/lesson.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

export type LessonCardData = {
  id: string;
  title: string;
  description: string | null;
  type: LessonType;
  grade: string;
  published: boolean;
  subject: { name: string; color: string | null };
};

export function LessonCard({ lesson }: { lesson: LessonCardData }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <CardTitle className="text-lg">{lesson.title}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {lesson.subject.name} Â· Grade {lesson.grade}
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          <StatusBadge label={lesson.type} />
          <StatusBadge label={lesson.published ? "Published" : "Draft"} tone={lesson.published ? "default" : "muted"} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {lesson.description ? (
          <p className="text-sm text-muted-foreground line-clamp-2">{lesson.description}</p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href={`/teacher/lessons/${lesson.id}/edit`}>Edit</Link>
          </Button>
          <form action={toggleLessonPublishFormAction.bind(null, lesson.id, !lesson.published)}>
            <Button size="sm" type="submit" variant={lesson.published ? "outline" : "default"}>
              {lesson.published ? "Unpublish" : "Publish"}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

