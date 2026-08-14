import { z } from "zod";

export const updateTeacherProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  whatsapp: z.string().optional(),
  defaultCurrency: z.string().min(3).max(3).default("LKR"),
});

export type UpdateTeacherProfileInput = z.infer<typeof updateTeacherProfileSchema>;
