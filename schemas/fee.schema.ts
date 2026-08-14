import { FeeStatus } from "@prisma/client";
import { z } from "zod";

export const submitFeeProofSchema = z.object({
  feeRecordId: z.string().min(1, "Fee record is required"),
  studentNote: z.string().max(500).optional(),
});

export const rejectFeeSchema = z.object({
  feeRecordId: z.string().min(1),
  teacherNote: z.string().min(1, "Add a note for the student").max(500),
});

export const manualMarkPaidSchema = z.object({
  feeRecordId: z.string().min(1),
  teacherNote: z.string().max(500).optional(),
});

export const approveFeeSchema = z.object({
  feeRecordId: z.string().min(1),
  teacherNote: z.string().max(500).optional(),
});

export const bulkApproveFeesSchema = z.object({
  feeRecordIds: z.array(z.string().min(1)).min(1, "Select at least one fee"),
  teacherNote: z.string().max(500).optional(),
});

export const bulkRejectFeesSchema = z.object({
  feeRecordIds: z.array(z.string().min(1)).min(1, "Select at least one fee"),
  teacherNote: z.string().min(1, "Add a note for the student").max(500),
});

export type FeeListFilters = {
  month?: number;
  year?: number;
  status?: FeeStatus;
  subjectId?: string;
  studentId?: string;
  grade?: string;
  q?: string;
};
