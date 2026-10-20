"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { UserRole } from "@prisma/client";
import { generateUniqueSlug } from "@/lib/slug";
import { createBlogPostSchema } from "@/lib/admin-content";

export type SubmitBlogPostResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitBlogPost(input: {
  title: string;
  excerpt?: string;
  content: string;
  tags?: string[];
}): Promise<SubmitBlogPostResult> {
  const user = await requireRole(UserRole.DOCTOR).catch(() => null);
  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  const doctor = await prisma.doctor.findUnique({
    where: { userId: user.id },
    select: { id: true, name: true },
  });
  if (!doctor) {
    return { ok: false, error: "Doctor profile not found" };
  }

  const parseResult = createBlogPostSchema
    .pick({ title: true, excerpt: true, content: true, tags: true })
    .safeParse(input);
  if (!parseResult.success) {
    return {
      ok: false,
      error: parseResult.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; "),
    };
  }

  const data = parseResult.data;

  const slug = await generateUniqueSlug(data.title, async (s) => {
    const found = await prisma.blogPost.findUnique({ where: { slug: s } });
    return Boolean(found);
  });

  try {
    await prisma.blogPost.create({
      data: {
        title: data.title.trim(),
        slug,
        excerpt: data.excerpt,
        content: data.content,
        tags: data.tags,
        status: "PENDING_REVIEW",
        doctorId: doctor.id,
        authorName: null,
        isFeatured: false,
        publishedAt: null,
        coverImageUrl: null,
        createdById: user.id,
      },
    });

    revalidatePath("/portal/doctor/blog");
    return { ok: true };
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return {
        ok: false,
        error: "A post with this title already exists. Please use a different title.",
      };
    }
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}