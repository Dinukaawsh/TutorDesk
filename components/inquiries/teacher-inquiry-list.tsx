"use client";

import { useActionState, useEffect, useState } from "react";
import type { Inquiry, InquiryEdit, InquiryStatus } from "@prisma/client";
import { FiEye } from "react-icons/fi";
import { updateInquiryStatusAction } from "@/actions/inquiry.actions";
import type { ActionResult } from "@/actions/auth.actions";
import { IconButton } from "@/components/modals/icon-button";
import { ViewModal } from "@/components/modals/view-modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui/status-badge";
import { useActionToast } from "@/hooks/use-action-toast";
import { formatDateTime } from "@/lib/utils";

type InquiryRow = Inquiry & {
  student: {
    id: string;
    name: string;
    email: string;
    grade: string | null;
    institute: { id: string; name: string; location: string } | null;
  };
  edits: InquiryEdit[];
};

function statusLabel(status: InquiryStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

const statusInitial: ActionResult = { success: false };

function StatusForm({
  inquiry,
  onSuccess,
}: {
  inquiry: InquiryRow;
  onSuccess: () => void;
}) {
  const [state, formAction, pending] = useActionState(updateInquiryStatusAction, statusInitial);
  useActionToast(state);

  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} className="space-y-3 border-t border-border pt-4">
      <input type="hidden" name="id" value={inquiry.id} />
      <div className="space-y-2">
        <Label htmlFor={`status-${inquiry.id}`}>Status</Label>
        <select
          id={`status-${inquiry.id}`}
          name="status"
          className="flex h-10 w-full rounded-md border border-border bg-white px-3 text-sm"
          defaultValue={inquiry.status}
        >
          <option value="OPEN">Open</option>
          <option value="REVIEWED">Reviewed</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`note-${inquiry.id}`}>Teacher note</Label>
        <Textarea
          id={`note-${inquiry.id}`}
          name="teacherNote"
          rows={3}
          defaultValue={inquiry.teacherNote ?? ""}
        />
      </div>
      <Button type="submit" size="sm" className="rounded-[4px]" disabled={pending}>
        {pending ? "Saving..." : "Update status"}
      </Button>
    </form>
  );
}

type TeacherInquiryListProps = {
  inquiries: InquiryRow[];
};

export function TeacherInquiryList({ inquiries }: TeacherInquiryListProps) {
  const [viewTarget, setViewTarget] = useState<InquiryRow | null>(null);

  if (inquiries.length === 0) {
    return <p className="text-sm text-muted-foreground">No inquiries yet.</p>;
  }

  const originalFromEdits = (inquiry: InquiryRow) => {
    if (inquiry.edits.length === 0) {
      return null;
    }
    const first = inquiry.edits[0];
    return {
      title: first.titleBefore,
      body: first.bodyBefore,
      attachments: first.attachmentsBefore,
    };
  };

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-border bg-white/80 backdrop-blur">
        <table className="min-w-full text-sm">
          <thead className="border-b border-border bg-muted/50 text-left">
            <tr>
              <th className="p-3 font-medium">Student</th>
              <th className="p-3 font-medium">Institute</th>
              <th className="p-3 font-medium">Title</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Submitted</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inquiry) => (
              <tr key={inquiry.id} className="border-b border-border last:border-0">
                <td className="p-3 align-top">
                  <div className="font-medium">{inquiry.student.name}</div>
                  <div className="text-muted-foreground">{inquiry.student.email}</div>
                  {inquiry.student.grade ? (
                    <div className="text-muted-foreground">Grade {inquiry.student.grade}</div>
                  ) : null}
                </td>
                <td className="p-3 align-top">
                  {inquiry.student.institute ? (
                    <div>
                      <div className="font-medium">{inquiry.student.institute.name}</div>
                      <div className="text-muted-foreground">{inquiry.student.institute.location}</div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="p-3 align-top">{inquiry.title}</td>
                <td className="p-3 align-top">
                  <StatusBadge label={statusLabel(inquiry.status)} tone="outline" />
                </td>
                <td className="p-3 align-top text-muted-foreground">
                  {formatDateTime(inquiry.createdAt)}
                </td>
                <td className="p-3 align-top">
                  <IconButton
                    labelKey="action.view"
                    icon={<FiEye className="h-4 w-4" />}
                    onClick={() => setViewTarget(inquiry)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ViewModal
        open={Boolean(viewTarget)}
        onOpenChange={(open) => !open && setViewTarget(null)}
        title={viewTarget?.title ?? "Inquiry"}
        size="lg"
      >
        {viewTarget ? (
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium">Current</p>
              <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{viewTarget.body}</p>
              {viewTarget.attachmentUrls.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {viewTarget.attachmentUrls.map((url) => (
                    <li key={url}>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
                        Current attachment
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            {(() => {
              const original = originalFromEdits(viewTarget);
              if (!original) {
                return (
                  <p className="text-muted-foreground">No edits — current version is the original.</p>
                );
              }
              return (
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="font-medium">Original (before edits)</p>
                  <p className="mt-1 font-medium text-foreground">{original.title}</p>
                  <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{original.body}</p>
                  {original.attachments.length > 0 ? (
                    <ul className="mt-2 space-y-1">
                      {original.attachments.map((url) => (
                        <li key={url}>
                          <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
                            Original attachment
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              );
            })()}

            {viewTarget.edits.length > 0 ? (
              <div>
                <p className="font-medium">Edit history</p>
                <ul className="mt-2 space-y-2">
                  {viewTarget.edits.map((edit) => (
                    <li key={edit.id} className="rounded-md border border-border p-2 text-muted-foreground">
                      <time className="text-xs">{formatDateTime(edit.editedAt)}</time>
                      <p className="mt-1 font-medium text-foreground">{edit.titleBefore}</p>
                      <p className="mt-1 whitespace-pre-wrap">{edit.bodyBefore}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <StatusForm inquiry={viewTarget} onSuccess={() => setViewTarget(null)} />
          </div>
        ) : null}
      </ViewModal>
    </>
  );
}
