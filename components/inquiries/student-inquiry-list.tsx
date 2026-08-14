"use client";

import { useState } from "react";
import type { Inquiry, InquiryEdit, InquiryStatus } from "@prisma/client";
import { FiEdit2, FiPlus } from "react-icons/fi";
import { InquiryForm } from "@/components/inquiries/inquiry-form";
import { FormModal } from "@/components/modals/form-modal";
import { IconButton } from "@/components/modals/icon-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime } from "@/lib/utils";

type InquiryWithEdits = Inquiry & { edits: InquiryEdit[] };

function statusLabel(status: InquiryStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

type StudentInquiryListProps = {
  inquiries: InquiryWithEdits[];
};

export function StudentInquiryList({ inquiries }: StudentInquiryListProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<InquiryWithEdits | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <IconButton
          labelKey="action.add"
          icon={<FiPlus className="h-4 w-4" />}
          variant="default"
          onClick={() => setCreateOpen(true)}
        />
      </div>
      {inquiries.length === 0 ? (
        <p className="text-sm text-muted-foreground">You have not submitted any inquiries yet.</p>
      ) : (
        <ul className="space-y-3">
          {inquiries.map((inquiry) => (
            <li
              key={inquiry.id}
              className="rounded-xl border border-border bg-white/80 p-4 backdrop-blur"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="font-medium">{inquiry.title}</h3>
                <StatusBadge label={statusLabel(inquiry.status)} tone="outline" />
              </div>
              <time className="mt-1 block text-xs text-muted-foreground">
                {formatDateTime(inquiry.createdAt)}
              </time>
              <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{inquiry.body}</p>
              {inquiry.attachmentUrls.length > 0 ? (
                <ul className="mt-2 space-y-1 text-sm">
                  {inquiry.attachmentUrls.map((url) => (
                    <li key={url}>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
                        Attachment
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
              {inquiry.teacherNote ? (
                <p className="mt-3 rounded-md bg-muted/50 p-2 text-sm">
                  Teacher note: {inquiry.teacherNote}
                </p>
              ) : null}
              {inquiry.status === "OPEN" ? (
                <div className="mt-3">
                  <IconButton
                    labelKey="action.edit"
                    icon={<FiEdit2 className="h-4 w-4" />}
                    onClick={() => setEditTarget(inquiry)}
                  />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <FormModal open={createOpen} onOpenChange={setCreateOpen} title="New inquiry" className="max-w-lg">
        <InquiryForm onSuccess={() => setCreateOpen(false)} onCancel={() => setCreateOpen(false)} />
      </FormModal>

      <FormModal
        open={Boolean(editTarget)}
        onOpenChange={(open) => !open && setEditTarget(null)}
        title="Edit inquiry"
        className="max-w-lg"
      >
        {editTarget ? (
          <InquiryForm
            inquiry={editTarget}
            onSuccess={() => setEditTarget(null)}
            onCancel={() => setEditTarget(null)}
          />
        ) : null}
      </FormModal>
    </div>
  );
}
