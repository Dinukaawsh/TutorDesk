"use client";

import { useActionState, useState } from "react";
import type { FeeStatus } from "@prisma/client";
import {
  approveFeeAction,
  manualMarkPaidAction,
  rejectFeeAction,
} from "@/actions/fee.actions";
import type { ActionResult } from "@/actions/auth.actions";
import { FeeProofViewer } from "@/components/fees/fee-proof-viewer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";

export type FeeReviewRow = {
  id: string;
  status: FeeStatus;
  proofUrl: string | null;
  studentNote: string | null;
  teacherNote: string | null;
  submittedAt: Date | null;
  student: { id: string; name: string; email: string; grade: string | null };
  subject: { id: string; name: string; color: string | null };
};

const initialState: ActionResult = { success: false };

function statusLabel(status: FeeStatus) {
  switch (status) {
    case "PAID":
      return "Paid";
    case "PENDING":
      return "Pending";
    default:
      return "Unpaid";
  }
}

type RowActionsProps = {
  record: FeeReviewRow;
};

function ApproveForm({ record }: RowActionsProps) {
  const [state, action, pending] = useActionState(approveFeeAction, initialState);
  return (
    <form action={action} className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <input type="hidden" name="feeRecordId" value={record.id} />
      <Input name="teacherNote" placeholder="Optional note" className="sm:max-w-xs" />
      <Button type="submit" size="sm" disabled={pending}>
        Approve
      </Button>
      {state.message ? <span className="text-xs text-muted-foreground">{state.message}</span> : null}
    </form>
  );
}

function RejectForm({ record }: RowActionsProps) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(rejectFeeAction, initialState);
  if (!open) {
    return (
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
        Reject
      </Button>
    );
  }
  return (
    <form action={action} className="space-y-2 rounded-lg border border-border p-3">
      <input type="hidden" name="feeRecordId" value={record.id} />
      <Textarea name="teacherNote" placeholder="Reason for rejection" required rows={2} />
      <div className="flex gap-2">
        <Button type="submit" size="sm" variant="outline" disabled={pending}>
          Confirm reject
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
      {state.fieldErrors?.teacherNote?.[0] ? (
        <p className="text-xs text-muted-foreground">{state.fieldErrors.teacherNote[0]}</p>
      ) : null}
    </form>
  );
}

function ManualPaidForm({ record }: RowActionsProps) {
  const [state, action, pending] = useActionState(manualMarkPaidAction, initialState);
  return (
    <form action={action} className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <input type="hidden" name="feeRecordId" value={record.id} />
      <Input name="teacherNote" placeholder="Optional note" className="sm:max-w-xs" />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        Mark paid
      </Button>
      {state.message ? <span className="text-xs text-muted-foreground">{state.message}</span> : null}
    </form>
  );
}

type FeeReviewTableProps = {
  records: FeeReviewRow[];
  highlightId?: string;
};

export function FeeReviewTable({ records, highlightId }: FeeReviewTableProps) {
  if (records.length === 0) {
    return <p className="text-sm text-muted-foreground">No fee records for this period.</p>;
  }

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <article
          key={record.id}
          id={record.id}
          className={
            highlightId === record.id
              ? "rounded-xl border border-primary bg-white/90 p-4 shadow-sm ring-2 ring-primary/30"
              : "rounded-xl border border-border bg-white/80 p-4 backdrop-blur"
          }
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-medium text-foreground">{record.student.name}</p>
              <p className="text-sm text-muted-foreground">
                {record.subject.name}
                {record.student.grade ? ` · Grade ${record.student.grade}` : ""}
              </p>
              {record.studentNote ? (
                <p className="mt-1 text-sm text-muted-foreground">Student: {record.studentNote}</p>
              ) : null}
              {record.teacherNote ? (
                <p className="mt-1 text-sm text-muted-foreground">Teacher: {record.teacherNote}</p>
              ) : null}
            </div>
            <StatusBadge label={statusLabel(record.status)} tone={record.status === "PAID" ? "default" : "outline"} />
          </div>

          {record.proofUrl ? (
            <div className="mt-4">
              <FeeProofViewer proofUrl={record.proofUrl} />
            </div>
          ) : null}

          <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
            {record.status === "PENDING" ? (
              <>
                <ApproveForm record={record} />
                <RejectForm record={record} />
              </>
            ) : null}
            {record.status === "UNPAID" ? <ManualPaidForm record={record} /> : null}
          </div>
        </article>
      ))}
    </div>
  );
}
