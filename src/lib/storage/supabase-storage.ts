import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import type { StoredImage, StoreImageInput, StoreImage } from "./index";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_FORMATS = new Set(["jpeg", "jpg", "png", "webp", "avif"]);

let cachedClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient(): ReturnType<typeof createClient> {
  if (cachedClient) {
    return cachedClient;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const missing: string[] = [];
  if (!supabaseUrl || supabaseUrl.trim() === "") {
    missing.push("SUPABASE_URL");
  }
  if (!serviceRoleKey || serviceRoleKey.trim() === "") {
    missing.push("SUPABASE_SERVICE_ROLE_KEY");
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required Supabase configuration: ${missing.join(", ")}`
    );
  }

  cachedClient = createClient(supabaseUrl!.trim(), serviceRoleKey!.trim());
  return cachedClient;
}

export const storeImageSupabase: StoreImage = async (
  input: StoreImageInput
): Promise<StoredImage> => {
  const bucket =
    process.env.SUPABASE_STORAGE_BUCKET &&
    process.env.SUPABASE_STORAGE_BUCKET.trim() !== ""
      ? process.env.SUPABASE_STORAGE_BUCKET.trim()
      : "healthcapsule";

  if (!input.data || input.data.length === 0) {
    throw new Error("Cannot store empty image data.");
  }

  if (input.data.length > MAX_BYTES) {
    throw new Error(
      `Image size (${input.data.length} bytes) exceeds maximum allowed limit of ${MAX_BYTES} bytes (8MB).`
    );
  }

  const initialMeta = await sharp(input.data).metadata();
  const detectedFormat = initialMeta.format?.toLowerCase();

  if (!detectedFormat || !ALLOWED_FORMATS.has(detectedFormat)) {
    throw new Error(
      `Unsupported image format: "${detectedFormat ?? "unknown"}". Allowed formats: jpeg, png, webp, avif.`
    );
  }

  // ponytail: lossy webp compression with 1600x1600 cap; swap for multi-size responsive variants or dynamic transformation pipeline if original fidelity or multiple breakpoints are needed.
  const { data: outputBuffer, info } = await sharp(input.data)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer({ resolveWithObject: true });

  const width = info.width ?? 0;
  const height = info.height ?? 0;

  const safeFolder = input.folder.toLowerCase().replace(/[^a-z0-9_-]/g, "");
  if (!safeFolder) {
    throw new Error(
      `Invalid folder name: "${input.folder}". Folder must contain alphanumeric characters, hyphens, or underscores.`
    );
  }

  const key = `${safeFolder}/${randomUUID()}.webp`;

  const supabase = getSupabaseClient();
  const { error } = await supabase.storage.from(bucket).upload(key, outputBuffer, {
    contentType: "image/webp",
    upsert: false,
    cacheControl: "31536000",
  });

  if (error) {
    throw new Error(
      `Supabase storage upload failed for key "${key}": ${error.message}`
    );
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(key);
  const url = data.publicUrl;

  return {
    url,
    key,
    width,
    height,
    bytes: info.size,
    contentType: "image/webp",
  };
};

export const storeImage = storeImageSupabase;
