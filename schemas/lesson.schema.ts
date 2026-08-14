import { LessonType } from "@prisma/client";
import { z } from "zod";
import { isSupportedVideoUrl } from "@/lib/video";

export const lessonFormSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    type: z.nativeEnum(LessonType),
    subjectId: z.string().min(1, "Subject is required"),
    grade: z.string().min(1, "Grade is required"),
    videoUrl: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === LessonType.VIDEO) {
      if (!data.videoUrl?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["videoUrl"],
          message: "Video link is required",
        });
        return;
      }
      if (!isSupportedVideoUrl(data.videoUrl.trim())) {
        ctx.addIssue({
          code: "custom",
          path: ["videoUrl"],
          message: "Enter a valid YouTube, Vimeo, or URL",
        });
      }
    }
  });

export type LessonFormInput = z.infer<typeof lessonFormSchema>;
