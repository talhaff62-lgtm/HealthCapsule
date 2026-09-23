// Local storage provider: runtime writes under public/ are served in next dev, but are NOT served in a production build. This provider is intended for local development only.

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { StoredImage, StoreImageInput, StoreImage } from "./index";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_FORMATS = new Set(["jpeg", "jpg", "png", "webp", "avif"]);

export const storeImageLocal: StoreImage = async (
  input: StoreImageInput
): Promise<StoredImage> => {
  const rawDir = process.env.STORAGE_DIRECTORY;
  if (!rawDir || rawDir.trim() === "") {
    throw new Error(
      "STORAGE_DIRECTORY is required when STORAGE_PROVIDER=local"
    );
  }

  const baseDir = path.resolve(process.cwd(), rawDir.trim());
  const publicDir = path.resolve(process.cwd(), "public");

  if (baseDir !== publicDir && !baseDir.startsWith(publicDir + path.sep)) {
    throw new Error(
      `Locally stored images must live under "public/" to be servable. Current STORAGE_DIRECTORY resolves to "${baseDir}".`
    );
  }

  if (!input.data || input.data.length === 0) {
    throw new Error("Cannot store empty image data.");
  }

  if (input.data.length > MAX_BYTES) {
    throw new Error(
      `Image size (${input.data.length} bytes) exceeds maximum allowed limit of ${MAX_BYTES} bytes (8MB).`
    );
  }

  const metadata = await sharp(input.data).metadata();
  const detectedFormat = metadata.format?.toLowerCase();

  if (!detectedFormat || !ALLOWED_FORMATS.has(detectedFormat)) {
    throw new Error(
      `Unsupported image format: "${detectedFormat ?? "unknown"}". Allowed formats: jpeg, png, webp, avif.`
    );
  }

  let outputBuffer: Buffer;
  let info: { width?: number; height?: number; size: number };
  let contentType: string;
  let ext: string;

  if (detectedFormat === "png") {
    const result = await sharp(input.data)
      .rotate()
      .png({ compressionLevel: 9 })
      .toBuffer({ resolveWithObject: true });
    outputBuffer = result.data;
    info = result.info;
    contentType = "image/png";
    ext = "png";
  } else if (detectedFormat === "webp") {
    const result = await sharp(input.data)
      .rotate()
      .webp({ lossless: true })
      .toBuffer({ resolveWithObject: true });
    outputBuffer = result.data;
    info = result.info;
    contentType = "image/webp";
    ext = "webp";
  } else if (detectedFormat === "avif") {
    const result = await sharp(input.data)
      .rotate()
      .avif({ lossless: true })
      .toBuffer({ resolveWithObject: true });
    outputBuffer = result.data;
    info = result.info;
    contentType = "image/avif";
    ext = "avif";
  } else if (detectedFormat === "jpeg" || detectedFormat === "jpg") {
    // ponytail: jpeg cannot be re-encoded bit-exact by sharp; quality 100 + 4:4:4 + mozjpeg is near-lossless. Swap for a true-lossless jpeg encoder (e.g. jpegtran) if bit-exactness is ever needed.
    const result = await sharp(input.data)
      .rotate()
      .jpeg({ quality: 100, chromaSubsampling: "4:4:4", mozjpeg: true })
      .toBuffer({ resolveWithObject: true });
    outputBuffer = result.data;
    info = result.info;
    contentType = "image/jpeg";
    ext = "jpg";
  } else {
    throw new Error(
      `Unsupported image format: "${detectedFormat}". Allowed formats: jpeg, png, webp, avif.`
    );
  }

  const safeFolder = input.folder.toLowerCase().replace(/[^a-z0-9_-]/g, "");
  if (!safeFolder) {
    throw new Error(
      `Invalid folder name: "${input.folder}". Folder must contain alphanumeric characters, hyphens, or underscores.`
    );
  }

  const filename = `${randomUUID()}.${ext}`;
  const targetDir = path.join(baseDir, safeFolder);
  const fullPath = path.join(targetDir, filename);

  const resolvedFullPath = path.resolve(fullPath);
  const resolvedBaseDir = path.resolve(baseDir);
  if (!resolvedFullPath.startsWith(resolvedBaseDir + path.sep)) {
    throw new Error(
      "Path traversal detected: resolved file path is outside the storage directory."
    );
  }

  await mkdir(targetDir, { recursive: true });
  await writeFile(resolvedFullPath, outputBuffer);

  const width = info.width ?? 0;
  const height = info.height ?? 0;

  const relToPublic = path
    .relative(publicDir, resolvedFullPath)
    .split(path.sep)
    .join("/");
  const url = `/${relToPublic}`;
  const key = `${safeFolder}/${filename}`;

  return {
    url,
    key,
    width,
    height,
    bytes: info.size,
    contentType,
  };
};

export const storeImage = storeImageLocal;
