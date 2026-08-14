const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "public/uploads";

export function getUploadDir() {
  return UPLOAD_DIR;
}

export function buildPublicUploadUrl(filename: string) {
  const base = process.env.NEXT_PUBLIC_UPLOAD_BASE ?? "/uploads";
  return `${base}/${filename.replace(/^\/+/, "")}`;
}

export function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

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

  const safeName = sanitizeFilename(file.name || "upload");
  const filename = `${randomUUID()}-${safeName}`;
  const dir = path.join(process.cwd(), getUploadDir(), options.subfolder);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return buildPublicUploadUrl(`${options.subfolder}/${filename}`.replace(/\\/g, "/"));
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
