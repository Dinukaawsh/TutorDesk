"use client";

import type { FeeStatus } from "@prisma/client";
import { FeeProofUpload } from "@/components/fees/fee-proof-upload";
import { FeeProofViewer } from "@/components/fees/fee-proof-viewer";
import { StatusBadge } from "@/components/ui/status-badge";

export type StudentFeeRecord = {
  id: string;
  status: FeeStatus;
  proofUrl: string | null;
  studentNote: string | null;
  teacherNote: string | null;
  subject: { id: string; name: string; color: string | null };
};

function statusLabel(status: FeeStatus) {
  switch (status) {
    case "PAID":
      return "Paid";
    case "PENDING":
      return "Pending review";
    default:
      return "Unpaid";
  }
}

type StudentFeeListProps = {
  records: StudentFeeRecord[];
  monthLabel: string;
};

export function StudentFeeList({ records, monthLabel }: StudentFeeListProps) {
  if (records.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No enrolled subjects for fees this month.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Fees for {monthLabel}</p>
      {records.map((record) => {
        const canUpload = record.status === "UNPAID";
        return (
          <div
            key={record.id}
            className="rounded-xl border border-border bg-white/80 p-4 backdrop-blur"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{record.subject.name}</p>
                {record.teacherNote ? (
                  <p className="mt-1 text-sm text-muted-foreground">{record.teacherNote}</p>
                ) : null}
              </div>
              <StatusBadge label={statusLabel(record.status)} />
            </div>
            {record.proofUrl && record.status !== "UNPAID" ? (
              <div className="mt-3">
                <FeeProofViewer proofUrl={record.proofUrl} />
              </div>
            ) : null}
            {canUpload ? <FeeProofUpload feeRecordId={record.id} /> : null}
            {record.status === "PENDING" ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Waiting for teacher review.
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
