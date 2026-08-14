import { LessonCard, type LessonCardData } from "@/components/lessons/lesson-card";

export function LessonList({ lessons }: { lessons: LessonCardData[] }) {
  if (lessons.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No lessons yet. Create your first lesson.</p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {lessons.map((lesson) => (
        <LessonCard key={lesson.id} lesson={lesson} />
      ))}
    </div>
  );
}
