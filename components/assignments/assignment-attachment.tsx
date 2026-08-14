"use client";

import { useState } from "react";
import { FilePreviewModal } from "@/components/modals/file-preview-modal";
import { Button } from "@/components/ui/button";

type AssignmentAttachmentProps = {
  attachmentUrl: string;
  title?: string;
};

export function AssignmentAttachment({ attachmentUrl, title = "Assignment attachment" }: AssignmentAttachmentProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Preview attachment
      </Button>
      <Button type="button" variant="ghost" size="sm" asChild>
        <a href={attachmentUrl} download target="_blank" rel="noopener noreferrer">
          Download
        </a>
      </Button>
      <FilePreviewModal open={open} onOpenChange={setOpen} fileUrl={attachmentUrl} title={title} />
    </div>
  );
}
