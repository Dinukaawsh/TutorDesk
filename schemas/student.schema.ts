import { z } from "zod";

export const createStudentSchema = z.object({
  name: z.string().trim().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required").min(8, "Password must be at least 8 characters"),
  age: z.coerce.number().int().min(5).max(100).optional(),
  grade: z.string().optional(),
  school: z.string().optional(),
  stream: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  subjectIds: z.array(z.string().min(1)).default([]),
  tagIds: z.array(z.string().min(1)).default([]),
  instituteId: z.string().optional(),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;

export const updateStudentSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  age: z.coerce.number().int().min(5).max(100).optional(),
  grade: z.string().optional(),
  school: z.string().optional(),
  stream: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  subjectIds: z.array(z.string().min(1)).default([]),
  tagIds: z.array(z.string().min(1)).default([]),
  instituteId: z.string().optional(),
});

export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;

export const disableStudentSchema = z.object({
  id: z.string().min(1),
  reason: z.string().trim().min(1, "Reason is required").min(3, "Reason must be at least 3 characters"),
});

export const bulkDisableSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "Select at least one student"),
  reason: z.string().trim().min(1, "Reason is required").min(3, "Reason must be at least 3 characters"),
});

export const bulkEnableSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "Select at least one student"),
});

export const bulkUpdateGradeSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "Select at least one student"),
  grade: z.string().trim().min(1, "Grade is required"),
});

export const bulkAddTagsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "Select at least one student"),
  tagIds: z.array(z.string().min(1)).min(1, "Select at least one tag"),
});

export const bulkRemoveTagsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "Select at least one student"),
  tagIds: z.array(z.string().min(1)).min(1, "Select at least one tag"),
});

export const bulkAddSubjectsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "Select at least one student"),
  subjectIds: z.array(z.string().min(1)).min(1, "Select at least one subject"),
});

export const bulkUpdateInstituteSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "Select at least one student"),
  instituteId: z.string().min(1, "Select an institute"),
});

export const resetPasswordSchema = z.object({
  id: z.string().min(1),
  password: z.string().min(1, "Password is required").min(8, "Password must be at least 8 characters"),
});

export const studentIdSchema = z.object({
  id: z.string().min(1),
});
