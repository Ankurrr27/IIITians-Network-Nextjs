// src/lib/cloudinary.ts
// Cloudinary v2 SDK — configured from env vars.
// Exports helpers for uploading and deleting assets.
// Used ONLY in API Route handlers (server-side).

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

/**
 * Upload a file buffer to Cloudinary.
 * @param buffer  - Raw file buffer (from `file.arrayBuffer()`)
 * @param options - Cloudinary upload options (folder, transformation, etc.)
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder?: string;
    public_id?: string;
    transformation?: Record<string, unknown>[];
    resource_type?: "image" | "video" | "raw" | "auto";
  } = {}
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder ?? "iiitians",
        resource_type: options.resource_type ?? "image",
        public_id: options.public_id,
        transformation: options.transformation,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
        } else {
          resolve(result as CloudinaryUploadResult);
        }
      }
    );
    uploadStream.end(buffer);
  });
}

/**
 * Delete an asset from Cloudinary by its public_id.
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
