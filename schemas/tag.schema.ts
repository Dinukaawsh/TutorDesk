import { z } from "zod";

export const createStudentTagSchema = z.object({
  name: z.string().trim().min(1, "Tag name is required").max(40),
  color: z.string().optional(),
});

export const deleteStudentTagSchema = z.object({
  id: z.string().min(1, "Invalid tag"),
});

export type CreateStudentTagInput = z.infer<typeof createStudentTagSchema>;
