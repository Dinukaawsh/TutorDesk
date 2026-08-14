import { saveUploadedFile } from "@/lib/uploads";

export async function saveAvatarFile(file: File): Promise<string | null> {
  if (!file || file.size === 0) {
    return null;
  }

  return saveUploadedFile(file, {
    subfolder: "avatars",
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    maxBytes: 8 * 1024 * 1024,
  });
}
