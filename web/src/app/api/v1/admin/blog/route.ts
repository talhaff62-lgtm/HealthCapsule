import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth, withApi } from "@/lib/api-guard";
import { generateUniqueSlug } from "@/lib/slug";
import { createBlogPostSchema } from "@/lib/admin-content";

export const dynamic = "force-dynamic";

export const blogPostInclude = {
  doctor: { select: { id: true, name: true } },
  createdBy: { select: { id: true, name: true } },
} as const;

async function getHandler(request: NextRequest) {
  await requireAuth(request, [UserRole.ADMIN]);

  const blogPosts = await prisma.blogPost.findMany({
    where: { deletedAt: null },
    include: blogPostInclude,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(blogPosts);
}

async function postHandler(request: NextRequest) {
  const auth = await requireAuth(request, [UserRole.ADMIN]);

  const body = await request.json();
  const parseResult = createBlogPostSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: parseResult.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; "),
      },
      { status: 400 }
    );
  }

  const data = parseResult.data;

  if (data.doctorId) {
    const doctor = await prisma.doctor.findUnique({
      where: { id: data.doctorId },
      select: { id: true },
    });
    if (!doctor) {
      return NextResponse.json({ error: "Invalid doctor" }, { status: 400 });
    }
  }

  const slug = await generateUniqueSlug(data.title, async (s) => {
    const found = await prisma.blogPost.findUnique({ where: { slug: s } });
    return Boolean(found);
  });

  const blogPost = await prisma.blogPost.create({
    data: {
      title: data.title.trim(),
      slug,
      excerpt: data.excerpt,
      content: data.content,
      coverImageUrl: data.coverImageUrl,
      tags: data.tags,
      status: data.status,
      publishedAt: data.publishedAt,
      isFeatured: data.isFeatured,
      authorName: data.doctorId ? null : data.authorName,
      doctorId: data.doctorId || null,
      createdById: auth.userId,
    },
    include: blogPostInclude,
  });

  return NextResponse.json(blogPost, { status: 201 });
}

export const GET = withApi(getHandler);
export const POST = withApi(postHandler);
