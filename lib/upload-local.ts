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

export type SaveUploadLocalOptions = {
  subfolder: string;
};

export async function saveUploadedFileLocal(
  file: File,
  options: SaveUploadLocalOptions,
): Promise<string> {
  const safeName = sanitizeFilename(file.name || "upload");
  const filename = `${randomUUID()}-${safeName}`;
  const dir = path.join(process.cwd(), getUploadDir(), options.subfolder);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    path.join(dir, filename),
    Buffer.from(await file.arrayBuffer()),
  );
  return buildPublicUploadUrl(`${options.subfolder}/${filename}`.replace(/\\/g, "/"));
}
