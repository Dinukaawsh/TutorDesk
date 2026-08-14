import { v2 as cloudinary } from "cloudinary";
import { saveUploadedFileLocal } from "@/lib/upload-local";

function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

function ensureCloudinaryConfig() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function uploadFile(file: File, folder: string): Promise<string> {
  if (!isCloudinaryConfigured()) {
    return saveUploadedFileLocal(file, { subfolder: folder });
  }

  ensureCloudinaryConfig();
  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        if (!result?.secure_url) {
          reject(new Error("Cloudinary upload failed."));
          return;
        }
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}
