import { AnnouncementTarget } from "@prisma/client";
import { z } from "zod";

export const createAnnouncementSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    body: z.string().min(1, "Message is required"),
    targetType: z.nativeEnum(AnnouncementTarget),
    subjectId: z.string().optional(),
    grade: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.targetType === AnnouncementTarget.SUBJECT ||
      data.targetType === AnnouncementTarget.SUBJECT_GRADE
    ) {
      if (!data.subjectId?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["subjectId"],
          message: "Subject is required for this audience",
        });
      }
    }
    if (
      data.targetType === AnnouncementTarget.GRADE ||
      data.targetType === AnnouncementTarget.SUBJECT_GRADE
    ) {
      if (!data.grade?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["grade"],
          message: "Grade is required for this audience",
        });
      }
    }
  });

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;

export const updateAnnouncementSchema = createAnnouncementSchema.extend({
  id: z.string().min(1, "Invalid announcement"),
});

export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
