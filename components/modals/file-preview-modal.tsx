"use client";

import Link from "next/link";
import { AppModal } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";

type FilePreviewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileUrl: string;
  title?: string;
  mimeType?: string;
};

function isPdf(url: string, mimeType?: string) {
  if (mimeType === "application/pdf") {
    return true;
  }
  const lower = url.toLowerCase();
  return lower.endsWith(".pdf") || lower.includes(".pdf?");
}

function isImage(url: string, mimeType?: string) {
  if (mimeType?.startsWith("image/")) {
    return true;
  }
  return /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(url);
}

export function FilePreviewModal({
  open,
  onOpenChange,
  fileUrl,
  title = "File preview",
  mimeType,
}: FilePreviewModalProps) {
  const pdf = isPdf(fileUrl, mimeType);
  const image = isImage(fileUrl, mimeType);

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      size="lg"
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button type="button" asChild>
            <Link href={fileUrl} download target="_blank" rel="noopener noreferrer">
              Download
            </Link>
          </Button>
        </>
      }
    >
      <div className="max-h-[70vh] overflow-auto rounded-md border border-border bg-muted/30">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={fileUrl} alt="Preview" className="mx-auto max-h-[65vh] w-auto max-w-full object-contain" />
        ) : pdf ? (
          <iframe src={fileUrl} title="PDF preview" className="h-[65vh] w-full min-h-[320px]" />
        ) : (
          <p className="p-4 text-sm text-muted-foreground">
            Preview is not available for this file type. Use download to open it.
          </p>
        )}
      </div>
    </AppModal>
  );
}
