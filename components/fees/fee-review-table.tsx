"use client";

import { useEffect, useMemo, useState } from "react";
import type { FeeStatus } from "@prisma/client";
import { FiCheck, FiEye, FiX } from "react-icons/fi";
import {
  approveFeeAction,
  bulkApproveFeesAction,
  bulkRejectFeesAction,
  manualMarkPaidAction,
  rejectFeeAction,
} from "@/actions/fee.actions";
import { formatSubjectMonthlyFee, t } from "@/content/navigation";
import { FeeProofViewer } from "@/components/fees/fee-proof-viewer";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { IconButton } from "@/components/modals/icon-button";
import { ViewModal } from "@/components/modals/view-modal";
import { BottomActionBar } from "@/components/ui/bottom-action-bar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/status-badge";
import { Pagination, PAGINATION_PAGE_SIZE } from "@/components/ui/pagination";

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

type BulkDialogMode = "approve" | "reject" | null;

type RowActionTarget = FeeReviewRow | null;

type FeeReviewTableProps = {
  records: FeeReviewRow[];
  highlightId?: string;
};

export function FeeReviewTable({ records, highlightId }: FeeReviewTableProps) {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [gradeFilter, setGradeFilter] = useState("");
  const [bulkMode, setBulkMode] = useState<BulkDialogMode>(null);
  const [proofTarget, setProofTarget] = useState<RowActionTarget>(null);
  const [approveTarget, setApproveTarget] = useState<RowActionTarget>(null);
  const [rejectTarget, setRejectTarget] = useState<RowActionTarget>(null);
  const [markPaidTarget, setMarkPaidTarget] = useState<RowActionTarget>(null);

  const grades = useMemo(
    () =>
      [...new Set(records.map((r) => r.student.grade).filter((g): g is string => Boolean(g)))].sort(),
    [records],
  );

  const visibleRecords = useMemo(
    () => records.filter((r) => !gradeFilter || r.student.grade === gradeFilter),
    [records, gradeFilter],
  );

  useEffect(() => {
    setPage(1);
  }, [records, gradeFilter]);

  const pagedRecords = useMemo(() => {
    const start = (page - 1) * PAGINATION_PAGE_SIZE;
    return visibleRecords.slice(start, start + PAGINATION_PAGE_SIZE);
  }, [visibleRecords, page]);

  const pendingVisibleIds = pagedRecords.filter((r) => r.status === "PENDING").map((r) => r.id);
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

  const bulkAction = bulkMode === "reject" ? bulkRejectFeesAction : bulkApproveFeesAction;

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
            {pagedRecords.map((record) => {
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
                  <td className="p-3 align-top text-muted-foreground">{feeLabel ?? "-"}</td>
                  <td className="p-3 align-top">
                    <StatusBadge
                      label={paymentStatusLabel(record.status)}
                      tone={record.status === "PAID" ? "default" : "outline"}
                    />
                  </td>
                  <td className="p-3 align-top">
                    <div className="flex flex-wrap gap-1">
                      {record.proofUrl ? (
                        <IconButton
                          labelKey="action.viewProof"
                          icon={<FiEye className="h-4 w-4" />}
                          onClick={() => setProofTarget(record)}
                        />
                      ) : null}
                      {record.status === "PENDING" ? (
                        <>
                          <IconButton
                            labelKey="action.approve"
                            variant="default"
                            icon={<FiCheck className="h-4 w-4" />}
                            onClick={() => setApproveTarget(record)}
                          />
                          <IconButton
                            labelKey="action.reject"
                            icon={<FiX className="h-4 w-4" />}
                            onClick={() => setRejectTarget(record)}
                          />
                        </>
                      ) : null}
                      {record.status === "UNPAID" ? (
                        <IconButton
                          labelKey="action.markPaid"
                          icon={<FiCheck className="h-4 w-4" />}
                          onClick={() => setMarkPaidTarget(record)}
                        />
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
            {pagedRecords.length === 0 && visibleRecords.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  No records for this grade.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Pagination
        totalItems={visibleRecords.length}
        page={page}
        onPageChange={setPage}
      />

      <ViewModal
        open={Boolean(proofTarget?.proofUrl)}
        onOpenChange={(open) => !open && setProofTarget(null)}
        title={t("action.viewProof")}
        size="lg"
      >
        {proofTarget?.proofUrl ? <FeeProofViewer proofUrl={proofTarget.proofUrl} /> : null}
      </ViewModal>

      <ConfirmModal
        open={Boolean(approveTarget)}
        onOpenChange={(open) => !open && setApproveTarget(null)}
        title={t("modal.approveFee.title")}
        description={approveTarget ? `${approveTarget.student.name} - ${approveTarget.subject.name}` : undefined}
        confirmLabel={t("action.approve")}
        formAction={approveFeeAction}
        note={{
          name: "teacherNote",
          label: "Optional note",
          required: false,
          placeholder: "Optional note",
          multiline: false,
        }}
        onSuccess={() => setApproveTarget(null)}
      >
        {approveTarget ? (
          <input type="hidden" name="feeRecordId" value={approveTarget.id} />
        ) : null}
      </ConfirmModal>

      <ConfirmModal
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        title={t("modal.rejectFee.title")}
        description={rejectTarget ? `${rejectTarget.student.name} - ${rejectTarget.subject.name}` : undefined}
        confirmLabel={t("action.reject")}
        confirmVariant="destructive"
        formAction={rejectFeeAction}
        note={{
          name: "teacherNote",
          label: "Note for student",
          required: true,
          placeholder: "Reason for rejection",
        }}
        onSuccess={() => setRejectTarget(null)}
      >
        {rejectTarget ? (
          <input type="hidden" name="feeRecordId" value={rejectTarget.id} />
        ) : null}
      </ConfirmModal>

      <ConfirmModal
        open={Boolean(markPaidTarget)}
        onOpenChange={(open) => !open && setMarkPaidTarget(null)}
        title={t("modal.markPaid.title")}
        description={
          markPaidTarget
            ? `${markPaidTarget.student.name} - ${markPaidTarget.subject.name}`
            : undefined
        }
        confirmLabel={t("action.markPaid")}
        formAction={manualMarkPaidAction}
        note={{
          name: "teacherNote",
          label: "Optional note",
          required: false,
          placeholder: "Optional note",
          multiline: false,
        }}
        onSuccess={() => setMarkPaidTarget(null)}
      >
        {markPaidTarget ? (
          <input type="hidden" name="feeRecordId" value={markPaidTarget.id} />
        ) : null}
      </ConfirmModal>

      <BottomActionBar open={selectedPendingIds.length > 0}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium">{selectedPendingIds.length} fee record(s) selected</p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="rounded-[4px]"
              onClick={() => setBulkMode("approve")}
            >
              {t("action.bulkApprove")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-[4px]"
              onClick={() => setBulkMode("reject")}
            >
              {t("action.bulkReject")}
            </Button>
          </div>
        </div>
      </BottomActionBar>

      <ConfirmModal
        open={bulkMode !== null}
        onOpenChange={(open) => !open && setBulkMode(null)}
        title={bulkMode === "reject" ? t("modal.bulkReject.title") : t("modal.bulkApprove.title")}
        description={`${selectedPendingIds.length} fee record(s) selected`}
        confirmLabel={bulkMode === "reject" ? t("action.bulkReject") : t("action.bulkApprove")}
        confirmVariant={bulkMode === "reject" ? "destructive" : "default"}
        formAction={bulkAction}
        note={
          bulkMode === "reject"
            ? {
                name: "teacherNote",
                label: "Note for students",
                required: true,
                placeholder: "Reason for rejection",
              }
            : {
                name: "teacherNote",
                label: "Optional note",
                required: false,
                placeholder: "Optional note",
                multiline: false,
              }
        }
        onSuccess={() => {
          setBulkMode(null);
          setSelected(new Set());
        }}
      >
        {selectedPendingIds.map((id) => (
          <input key={id} type="hidden" name="feeRecordIds" value={id} />
        ))}
      </ConfirmModal>
    </div>
  );
}

