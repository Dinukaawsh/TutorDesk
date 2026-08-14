import { z } from "zod";
import { changePasswordSchema, passwordPolicySchema } from "@/schemas/auth.schema";

export const updateTeacherProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  whatsapp: z.string().optional(),
  defaultCurrency: z.string().min(3).max(3).default("LKR"),
});

export type UpdateTeacherProfileInput = z.infer<typeof updateTeacherProfileSchema>;

export const updateTeacherPasswordSchema = changePasswordSchema;

export type UpdateTeacherPasswordInput = z.infer<typeof updateTeacherPasswordSchema>;
