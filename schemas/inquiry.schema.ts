import { InquiryStatus } from "@prisma/client";
import { z } from "zod";

export const createInquirySchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Message is required"),
});

export const updateInquirySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Message is required"),
});

export const updateInquiryStatusSchema = z.object({
  id: z.string().min(1),
  status: z.nativeEnum(InquiryStatus),
  teacherNote: z.string().optional(),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;
export type UpdateInquiryInput = z.infer<typeof updateInquirySchema>;
