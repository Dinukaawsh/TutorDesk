"use client";

import { useActionState, useMemo, useState, type ChangeEvent } from "react";
import { submitAssignmentAction } from "@/actions/assignment.actions";
import type { ActionResult } from "@/actions/auth.actions";
import { FilePreviewModal } from "@/components/modals/file-preview-modal";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionResult = { success: false };

type SubmissionUploadProps = {
  assignmentId: string;
  canSubmit: boolean;
  helperText?: string;
};

export function SubmissionUpload({ assignmentId, canSubmit, helperText }: SubmissionUploadProps) {
  const [state, formAction, pending] = useActionState(submitAssignmentAction, initialState);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const previewFileUrl = useMemo(() => {
    if (!selectedFiles[0]) {
      return null;
    }
    return URL.createObjectURL(selectedFiles[0]);
  }, [selectedFiles]);

  if (!canSubmit) {
    return helperText ? (
      <p className="text-sm text-muted-foreground">{helperText}</p>
    ) : null;
  }

  function handleFilesChange(event: ChangeEvent<HTMLInputElement>) {
    const list = event.target.files ? Array.from(event.target.files) : [];
    setSelectedFiles(list);
  }

  function openPreview() {
    if (!previewFileUrl) {
      return;
    }
    setPreviewUrl(previewFileUrl);
    setPreviewOpen(true);
  }

  function handlePreviewOpenChange(open: boolean) {
    setPreviewOpen(open);
    if (!open && previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }

  return (
    <>
      <form action={formAction} noValidate className="space-y-3 rounded-lg border border-border bg-white/80 p-4">
        <input type="hidden" name="assignmentId" value={assignmentId} />
        <div className="space-y-2">
          <Label htmlFor="files" required>
            Upload homework (photo or PDF)
          </Label>
          <Input
            id="files"
            name="files"
            type="file"
            accept="application/pdf,image/*"
            multiple
            onChange={handleFilesChange}
          />
          {selectedFiles.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                {selectedFiles.length} file{selectedFiles.length === 1 ? "" : "s"} selected
              </span>
              <Button type="button" variant="outline" size="sm" onClick={openPreview} disabled={!previewFileUrl}>
                Preview first file
              </Button>
            </div>
          ) : null}
          <FieldError message={state.fieldErrors?.files?.[0]} />
        </div>
        {state.message ? <p className="text-sm text-muted-foreground">{state.message}</p> : null}
        <Button type="submit" disabled={pending || selectedFiles.length === 0}>
          {pending ? "Uploading..." : "Submit assignment"}
        </Button>
      </form>
      {previewUrl ? (
        <FilePreviewModal
          open={previewOpen}
          onOpenChange={handlePreviewOpenChange}
          fileUrl={previewUrl}
          mimeType={selectedFiles[0]?.type}
          title={selectedFiles[0]?.name ?? "File preview"}
        />
      ) : null}
    </>
  );
}
