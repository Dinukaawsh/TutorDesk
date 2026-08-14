import { uploadFile } from "@/lib/cloudinary";

export async function saveAvatarFile(file: File): Promise<string | null> {
  if (!file || file.size === 0) {
    return null;
  }

  const maxBytes = 8 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error("File is too large.");
  }

  const type = file.type || "application/octet-stream";
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(type)) {
    throw new Error("File type is not allowed.");
  }

  return uploadFile(file, "avatars");
}
