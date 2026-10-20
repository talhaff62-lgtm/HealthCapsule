// Shared Zod schemas for the admin blog/video API routes.
import { z } from "zod";

export function extractYoutubeVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?\S*?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

const dateString = z
  .string()
  .optional()
  .nullable()
  .refine(
    (v) => v == null || v === "" || !Number.isNaN(Date.parse(v)),
    { message: "Invalid date" }
  )
  .transform((v) => (v == null || v === "" ? null : new Date(v)));

const nullableTrimmed = z
  .string()
  .optional()
  .nullable()
  .transform((v) => {
    const trimmed = v?.trim();
    return trimmed ? trimmed : null;
  });

export const createBlogPostSchema = z.object({
  title: z.string().min(1),
  excerpt: nullableTrimmed,
  content: z.string().min(1),
  coverImageUrl: nullableTrimmed,
  tags: z.array(z.string()).default([]),
  status: z
    .enum(["DRAFT", "PENDING_REVIEW", "PUBLISHED", "ARCHIVED"])
    .default("PUBLISHED"),
  publishedAt: dateString,
  isFeatured: z.boolean().default(false),
  doctorId: z.string().optional().nullable(),
  authorName: nullableTrimmed,
});

export const updateBlogPostSchema = createBlogPostSchema.partial();

export const createVideoSchema = z.object({
  title: z.string().min(1),
  description: nullableTrimmed,
  youtubeUrl: z
    .string()
    .min(1)
    .refine((u) => extractYoutubeVideoId(u) !== null, {
      message: "Invalid YouTube URL",
    }),
  thumbnailUrl: nullableTrimmed,
  duration: nullableTrimmed,
  isFeatured: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
  doctorId: z.string().optional().nullable(),
  authorName: nullableTrimmed,
});

export const updateVideoSchema = createVideoSchema.partial();
