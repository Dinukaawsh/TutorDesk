"use client";

import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { createLessonAction } from "@/actions/lesson.actions";
import { FormModal } from "@/components/modals/form-modal";
import { IconButton } from "@/components/modals/icon-button";
import { LessonForm } from "@/components/lessons/lesson-form";
import { LessonList } from "@/components/lessons/lesson-list";
import type { LessonCardData } from "@/components/lessons/lesson-card";

type LessonsPageClientProps = {
  lessons: LessonCardData[];
  subjects: { id: string; name: string }[];
};

export function LessonsPageClient({ lessons, subjects }: LessonsPageClientProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);

  function handleCreated() {
    setCreateOpen(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <IconButton
          labelKey="action.addLesson"
          icon={<FiPlus className="h-4 w-4" />}
          variant="default"
          onClick={() => setCreateOpen(true)}
          disabled={subjects.length === 0}
        />
      </div>

      {subjects.length === 0 ? (
        <p className="text-sm text-muted-foreground">Add subjects before creating lessons.</p>
      ) : (
        <LessonList lessons={lessons} />
      )}

      <FormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="New lesson"
        description="Create a PDF or video lesson for your classes"
        size="xl"
        formId="lesson-form"
        saveLabel="Create lesson"
        onCancel={() => setCreateOpen(false)}
      >
        <LessonForm
          formId="lesson-form"
          hideActions
          action={createLessonAction}
          subjects={subjects}
          onSuccess={handleCreated}
        />
      </FormModal>
    </div>
  );
}
