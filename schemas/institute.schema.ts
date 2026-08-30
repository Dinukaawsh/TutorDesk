import { z } from "zod";

export const createInstituteSchema = z.object({
  name: z.string().trim().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
  location: z.string().trim().min(1, "Location is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export type CreateInstituteInput = z.infer<typeof createInstituteSchema>;

export const updateInstituteSchema = createInstituteSchema.extend({
  id: z.string().min(1, "Invalid institute"),
});

export type UpdateInstituteInput = z.infer<typeof updateInstituteSchema>;

export const deleteInstituteSchema = z.object({
  id: z.string().min(1, "Invalid institute"),
});
