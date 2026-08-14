"use client";

import * as React from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type FileUploadProps = {
  id?: string;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  onFilesSelected?: (files: FileList | null) => void;
};

export function FileUpload({
  id,
  accept,
  multiple,
  disabled,
  className,
  onFilesSelected,
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="hidden"
        onChange={(event) => onFilesSelected?.(event.target.files)}
      />
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-4 w-4" />
        Choose file
      </Button>
    </div>
  );
}