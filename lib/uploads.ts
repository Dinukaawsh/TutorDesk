import { uploadFile } from "@/lib/cloudinary";

export {
  buildPublicUploadUrl,
  getUploadDir,
  sanitizeFilename,
} from "@/lib/upload-local";

const MAX_PDF_BYTES = 15 * 1024 * 1024;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export type SaveUploadOptions = {
  subfolder: string;
  allowedMimeTypes?: string[];
  maxBytes?: number;
};

export async function saveUploadedFile(
  file: File,
  options: SaveUploadOptions,
): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error("No file provided.");
  }

  const maxBytes = options.maxBytes ?? MAX_PDF_BYTES;
  if (file.size > maxBytes) {
    throw new Error("File is too large.");
  }

  if (options.allowedMimeTypes?.length) {
    const type = file.type || "application/octet-stream";
    if (!options.allowedMimeTypes.includes(type)) {
      throw new Error("File type is not allowed.");
    }
  }

  return uploadFile(file, options.subfolder);
}

export async function saveLessonPdf(file: File) {
  return saveUploadedFile(file, {
    subfolder: "lessons",
    allowedMimeTypes: ["application/pdf"],
    maxBytes: MAX_PDF_BYTES,
  });
}

export async function saveAssignmentAttachment(file: File) {
  return saveUploadedFile(file, {
    subfolder: "assignments",
    allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
    maxBytes: MAX_PDF_BYTES,
  });
}

export async function saveSubmissionFiles(files: File[]) {
  const urls: string[] = [];
  for (const file of files) {
    const url = await saveUploadedFile(file, {
      subfolder: "submissions",
      allowedMimeTypes: [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp",
      ],
      maxBytes: MAX_IMAGE_BYTES,
    });
    urls.push(url);
  }
  return urls;
}

export async function saveFeeProof(file: File) {
  return saveUploadedFile(file, {
    subfolder: "fees",
    allowedMimeTypes: [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ],
    maxBytes: MAX_IMAGE_BYTES,
  });
}
