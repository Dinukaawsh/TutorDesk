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

export const gradeSubmissionSchema = z
  .object({
    submissionId: z.string().min(1),
    marks: z.coerce.number({ invalid_type_error: "Marks are required" }).int().min(0, "Marks must be at least 0").max(100, "Marks cannot exceed 100"),
    status: z.enum([SubmissionStatus.PASSED, SubmissionStatus.FAILED]),
    feedback: z.string().optional(),
    resubmitDeadline: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === SubmissionStatus.FAILED && !data.resubmitDeadline?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["resubmitDeadline"],
        message: "Resubmit deadline is required when marking failed",
      });
    }
  });

export type GradeSubmissionInput = z.infer<typeof gradeSubmissionSchema>;

export const reopenSubmissionPortalSchema = z.object({
  submissionId: z.string().min(1),
  resubmitDeadline: z.string().min(1, "Resubmit deadline is required"),
});

export type ReopenSubmissionPortalInput = z.infer<typeof reopenSubmissionPortalSchema>;
