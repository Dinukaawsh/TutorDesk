import { AssignmentTarget, SubmissionStatus } from "@prisma/client";
import { z } from "zod";

export const assignmentFormSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    instructions: z.string().optional(),
    subjectId: z.string().min(1, "Subject is required"),
    targetType: z.nativeEnum(AssignmentTarget),
    grade: z.string().optional(),
    individualStudentId: z.string().optional(),
    deadline: z.string().min(1, "Deadline is required"),
  })
  .superRefine((data, ctx) => {
    if (data.targetType === AssignmentTarget.GRADE && !data.grade?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["grade"],
        message: "Grade is required for grade-wide assignments",
      });
    }
    if (
      data.targetType === AssignmentTarget.INDIVIDUAL &&
      !data.individualStudentId?.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["individualStudentId"],
        message: "Select a student",
      });
    }
  });

export type AssignmentFormInput = z.infer<typeof assignmentFormSchema>;

export const gradeSubmissionSchema = z.object({
  submissionId: z.string().min(1),
  marks: z.coerce.number().int().min(0).max(100),
  status: z.enum([SubmissionStatus.PASSED, SubmissionStatus.FAILED]),
  feedback: z.string().optional(),
});

export type GradeSubmissionInput = z.infer<typeof gradeSubmissionSchema>;
