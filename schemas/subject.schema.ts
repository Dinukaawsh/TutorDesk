import { z } from "zod";

export const subjectSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().max(500).optional().or(z.literal("")),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Use a hex color like #2563eb")
    .optional()
    .or(z.literal("")),
  monthlyFee: z
    .union([z.coerce.number().min(0, "Fee must be zero or greater"), z.literal("")])
    .optional()
    .transform((value) => (value === "" || value === undefined ? undefined : value)),
});

export type SubjectInput = z.infer<typeof subjectSchema>;

export const subjectIdSchema = z.object({
  id: z.string().min(1),
});
