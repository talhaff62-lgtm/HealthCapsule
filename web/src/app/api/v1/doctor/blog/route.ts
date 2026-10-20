import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth, withApi } from "@/lib/api-guard";
import { generateUniqueSlug } from "@/lib/slug";
import { createBlogPostSchema } from "@/lib/admin-content";

export const dynamic = "force-dynamic";

const doctorBlogPostInclude = {
  doctor: { select: { id: true, name: true } },
} as const;

const doctorBlogPostSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  status: true,
  createdAt: true,
  viewsCount: true,
} as const;

async function getHandler(request: NextRequest) {
  const auth = await requireAuth(request, [UserRole.DOCTOR]);

  const doctor = await prisma.doctor.findUnique({
    where: { userId: auth.userId },
    select: { id: true },
  });
  if (!doctor) {
    return NextResponse.json(
      { error: "Doctor profile not found" },
      { status: 404 }
    );
  }

  const blogPosts = await prisma.blogPost.findMany({
    where: { doctorId: doctor.id, deletedAt: null },
    select: doctorBlogPostSelect,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(blogPosts);
}

async function postHandler(request: NextRequest) {
  const auth = await requireAuth(request, [UserRole.DOCTOR]);

  const doctor = await prisma.doctor.findUnique({
    where: { userId: auth.userId },
    select: { id: true },
  });
  if (!doctor) {
    return NextResponse.json(
      { error: "Doctor profile not found" },
      { status: 404 }
    );
  }

  const body = await request.json();
  const parseResult = createBlogPostSchema
    .pick({ title: true, excerpt: true, content: true, tags: true })
    .safeParse(body);
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
      tags: data.tags,
      status: "PENDING_REVIEW",
      doctorId: doctor.id,
      authorName: null,
      isFeatured: false,
      publishedAt: null,
      coverImageUrl: null,
      createdById: auth.userId,
    },
    include: doctorBlogPostInclude,
  });

  return NextResponse.json(blogPost, { status: 201 });
}

export const GET = withApi(getHandler);
export const POST = withApi(postHandler);
