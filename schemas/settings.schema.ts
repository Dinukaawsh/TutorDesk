import { z } from "zod";
import { changePasswordSchema, passwordPolicySchema } from "@/schemas/auth.schema";

export const updateTeacherProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  whatsapp: z.string().optional(),
  defaultCurrency: z.string().min(3).max(3).default("LKR"),
});

export type UpdateTeacherProfileInput = z.infer<typeof updateTeacherProfileSchema>;

export const updateTeacherPasswordSchema = changePasswordSchema;

export type UpdateTeacherPasswordInput = z.infer<typeof updateTeacherPasswordSchema>;
