import { LessonType } from "@prisma/client";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getVideoEmbedUrl } from "@/lib/video";

export type StudentLessonItem = {
  id: string;
  title: string;
  description: string | null;
  type: LessonType;
  contentUrl: string;
  subject: { name: string; color: string | null };
};

export function StudentLessonList({ lessons }: { lessons: StudentLessonItem[] }) {
  if (lessons.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No published lessons for your grade and subjects yet.
      </p>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {lessons.map((lesson) => {
        const embed = lesson.type === LessonType.VIDEO ? getVideoEmbedUrl(lesson.contentUrl) : null;
        return (
          <Card key={lesson.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg">{lesson.title}</CardTitle>
                <StatusBadge label={lesson.type} />
              </div>
              <p className="text-sm text-muted-foreground">{lesson.subject.name}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {lesson.description ? (
                <p className="text-sm text-muted-foreground">{lesson.description}</p>
              ) : null}
              {lesson.type === LessonType.PDF ? (
                <Link
                  href={lesson.contentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Open PDF
                </Link>
              ) : embed ? (
                <div className="aspect-video overflow-hidden rounded-lg border border-border">
                  <iframe
                    src={embed}
                    title={lesson.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <Link
                  href={lesson.contentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Open video link
                </Link>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
