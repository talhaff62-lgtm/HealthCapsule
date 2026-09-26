import type sharp from "sharp";

let cachedSharp: typeof sharp | null | undefined = undefined;

export function getSharp(): typeof sharp | null {
  if (cachedSharp !== undefined) {
    return cachedSharp;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedSharp = require("sharp") as typeof sharp;
  } catch {
    cachedSharp = null;
  }

  return cachedSharp;
}

export type SniffedImageFormat = {
  contentType: string;
  ext: string;
};

export function sniffImageFormat(data: Buffer): SniffedImageFormat {
  if (
    data.length >= 3 &&
    data[0] === 0xff &&
    data[1] === 0xd8 &&
    data[2] === 0xff
  ) {
    return { contentType: "image/jpeg", ext: "jpg" };
  }

  if (
    data.length >= 4 &&
    data[0] === 0x89 &&
    data[1] === 0x50 &&
    data[2] === 0x4e &&
    data[3] === 0x47
  ) {
    return { contentType: "image/png", ext: "png" };
  }

  if (
    data.length >= 12 &&
    data.toString("ascii", 0, 4) === "RIFF" &&
    data.toString("ascii", 8, 12) === "WEBP"
  ) {
    return { contentType: "image/webp", ext: "webp" };
  }

  if (data.length >= 12) {
    const ftypSlice = data.toString("ascii", 4, 12);
    if (
      ftypSlice.includes("ftyp") &&
      (ftypSlice.includes("avif") ||
        ftypSlice.includes("avis") ||
        ftypSlice.includes("mif1"))
    ) {
      return { contentType: "image/avif", ext: "avif" };
    }
  }

  throw new Error("Unsupported image format.");
}
