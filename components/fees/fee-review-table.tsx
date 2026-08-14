"use client";

import { useActionState, useMemo, useState } from "react";
import type { FeeStatus } from "@prisma/client";
import {
  approveFeeAction,
  bulkApproveFeesAction,
  bulkRejectFeesAction,
  manualMarkPaidAction,
  rejectFeeAction,
} from "@/actions/fee.actions";
import type { ActionResult } from "@/actions/auth.actions";
import { formatSubjectMonthlyFee, t } from "@/content/navigation";
import { FeeProofViewer } from "@/components/fees/fee-proof-viewer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  subject: {
    id: string;
    name: string;
    color: string | null;
    monthlyFee: number | null;
    currency: string | null;
  };
};

const initialState: ActionResult = { success: false };

function paymentStatusLabel(status: FeeStatus) {
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
    <form action={action} className="flex flex-col gap-2 lg:flex-row lg:items-end">
      <input type="hidden" name="feeRecordId" value={record.id} />
      <Input name="teacherNote" placeholder="Optional note" className="lg:max-w-xs" />
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
    <form action={action} className="flex flex-col gap-2 lg:flex-row lg:items-end">
      <input type="hidden" name="feeRecordId" value={record.id} />
      <Input name="teacherNote" placeholder="Optional note" className="lg:max-w-xs" />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        Mark paid
      </Button>
      {state.message ? <span className="text-xs text-muted-foreground">{state.message}</span> : null}
    </form>
  );
}

type BulkDialogMode = "approve" | "reject" | null;

type FeeReviewTableProps = {
  records: FeeReviewRow[];
  highlightId?: string;
};

export function FeeReviewTable({ records, highlightId }: FeeReviewTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [gradeFilter, setGradeFilter] = useState("");
  const [bulkMode, setBulkMode] = useState<BulkDialogMode>(null);
  const [bulkApproveState, bulkApproveAction, bulkApprovePending] = useActionState(
    bulkApproveFeesAction,
    initialState,
  );
  const [bulkRejectState, bulkRejectAction, bulkRejectPending] = useActionState(
    bulkRejectFeesAction,
    initialState,
  );

  const grades = useMemo(
    () =>
      [...new Set(records.map((r) => r.student.grade).filter((g): g is string => Boolean(g)))].sort(),
    [records],
  );

  const visibleRecords = useMemo(
    () => records.filter((r) => !gradeFilter || r.student.grade === gradeFilter),
    [records, gradeFilter],
  );

  const pendingVisibleIds = visibleRecords.filter((r) => r.status === "PENDING").map((r) => r.id);
  const allPendingSelected =
    pendingVisibleIds.length > 0 && pendingVisibleIds.every((id) => selected.has(id));

  function toggleAllPending(checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of pendingVisibleIds) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  const selectedPendingIds = [...selected].filter((id) =>
    visibleRecords.some((r) => r.id === id && r.status === "PENDING"),
  );

  if (records.length === 0) {
    return <p className="text-sm text-muted-foreground">No fee records for this period.</p>;
  }

  const bulkPending = bulkApprovePending || bulkRejectPending;
  const bulkState = bulkMode === "reject" ? bulkRejectState : bulkApproveState;
  const bulkAction = bulkMode === "reject" ? bulkRejectAction : bulkApproveAction;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <Label htmlFor="fee-grade-filter">Filter by grade</Label>
          <select
            id="fee-grade-filter"
            value={gradeFilter}
            onChange={(event) => setGradeFilter(event.target.value)}
            className="flex h-10 w-full min-w-[10rem] rounded-md border border-border bg-white px-3 text-sm sm:w-auto"
          >
            <option value="">All grades</option>
            {grades.map((grade) => (
              <option key={grade} value={grade}>
                Grade {grade}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            disabled={selectedPendingIds.length === 0}
            onClick={() => setBulkMode("approve")}
          >
            Bulk approve ({selectedPendingIds.length})
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={selectedPendingIds.length === 0}
            onClick={() => setBulkMode("reject")}
          >
            Bulk reject ({selectedPendingIds.length})
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-white/80 backdrop-blur">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border bg-muted/50 text-left">
            <tr>
              <th className="p-3">
                <Checkbox
                  checked={allPendingSelected}
                  onCheckedChange={(value) => toggleAllPending(value === true)}
                  aria-label="Select all pending"
                />
              </th>
              <th className="p-3 font-medium">Student</th>
              <th className="p-3 font-medium">Subject</th>
              <th className="p-3 font-medium">{t("fee.monthlyAmount")}</th>
              <th className="p-3 font-medium">{t("table.paymentStatus")}</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleRecords.map((record) => {
              const feeLabel = formatSubjectMonthlyFee(
                record.subject.monthlyFee,
                record.subject.currency ?? "LKR",
              );
              const isPending = record.status === "PENDING";
              return (
                <tr
                  key={record.id}
                  id={record.id}
                  className={
                    highlightId === record.id
                      ? "border-b border-border bg-primary/5 last:border-0"
                      : "border-b border-border last:border-0"
                  }
                >
                  <td className="p-3 align-top">
                    {isPending ? (
                      <Checkbox
                        checked={selected.has(record.id)}
                        onCheckedChange={(value) => toggleOne(record.id, value === true)}
                        aria-label={`Select ${record.student.name}`}
                      />
                    ) : null}
                  </td>
                  <td className="p-3 align-top">
                    <div className="font-medium">{record.student.name}</div>
                    <div className="text-muted-foreground">{record.student.email}</div>
                    {record.student.grade ? (
                      <div className="text-muted-foreground">Grade {record.student.grade}</div>
                    ) : null}
                    {record.studentNote ? (
                      <p className="mt-1 text-muted-foreground">Student: {record.studentNote}</p>
                    ) : null}
                    {record.teacherNote ? (
                      <p className="mt-1 text-muted-foreground">Teacher: {record.teacherNote}</p>
                    ) : null}
                  </td>
                  <td className="p-3 align-top">{record.subject.name}</td>
                  <td className="p-3 align-top text-muted-foreground">{feeLabel ?? "—"}</td>
                  <td className="p-3 align-top">
                    <StatusBadge
                      label={paymentStatusLabel(record.status)}
                      tone={record.status === "PAID" ? "default" : "outline"}
                    />
                  </td>
                  <td className="p-3 align-top">
                    {record.proofUrl ? (
                      <div className="mb-3 max-w-xs">
                        <FeeProofViewer proofUrl={record.proofUrl} />
                      </div>
                    ) : null}
                    {record.status === "PENDING" ? (
                      <div className="space-y-2">
                        <ApproveForm record={record} />
                        <RejectForm record={record} />
                      </div>
                    ) : null}
                    {record.status === "UNPAID" ? <ManualPaidForm record={record} /> : null}
                  </td>
                </tr>
              );
            })}
            {visibleRecords.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  No records for this grade.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Dialog open={bulkMode !== null} onOpenChange={(open) => !open && setBulkMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bulkMode === "reject" ? "Bulk reject fees" : "Bulk approve fees"}
            </DialogTitle>
          </DialogHeader>
          <form action={bulkAction} className="space-y-4">
            {selectedPendingIds.map((id) => (
              <input key={id} type="hidden" name="feeRecordIds" value={id} />
            ))}
            {bulkMode === "reject" ? (
              <div className="space-y-2">
                <Label htmlFor="bulk-teacher-note">Note for students</Label>
                <Textarea
                  id="bulk-teacher-note"
                  name="teacherNote"
                  required
                  rows={3}
                  placeholder="Reason for rejection"
                />
                {bulkState.fieldErrors?.teacherNote?.[0] ? (
                  <p className="text-sm text-muted-foreground">
                    {bulkState.fieldErrors.teacherNote[0]}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="bulk-approve-note">Optional note</Label>
                <Input id="bulk-approve-note" name="teacherNote" placeholder="Optional note" />
              </div>
            )}
            {bulkState.message ? (
              <p className="text-sm text-muted-foreground">{bulkState.message}</p>
            ) : null}
            <Button type="submit" disabled={bulkPending || selectedPendingIds.length === 0}>
              {bulkPending
                ? "Saving..."
                : bulkMode === "reject"
                  ? "Confirm bulk reject"
                  : "Confirm bulk approve"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
