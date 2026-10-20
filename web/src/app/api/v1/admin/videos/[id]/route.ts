import { NextRequest, NextResponse } from "next/server";
import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth, withApi } from "@/lib/api-guard";
import { generateUniqueSlug } from "@/lib/slug";
import { updateVideoSchema, extractYoutubeVideoId } from "@/lib/admin-content";

export const dynamic = "force-dynamic";

const videoInclude = {
  doctor: { select: { id: true, name: true } },
  createdBy: { select: { id: true, name: true } },
} as const;

async function getHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAuth(request, [UserRole.ADMIN]);
  const { id } = await params;

  const video = await prisma.video.findUnique({ where: { id }, include: videoInclude });
  if (!video || video.deletedAt) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  return NextResponse.json(video);
}

async function patchHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAuth(request, [UserRole.ADMIN]);
  const { id } = await params;

  const existing = await prisma.video.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  const body = await request.json();
  const parseResult = updateVideoSchema.safeParse(body);
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

  const updateData: Prisma.VideoUncheckedUpdateInput = {};

  if (data.title !== undefined) {
    updateData.title = data.title.trim();
    updateData.slug = await generateUniqueSlug(data.title, async (s) => {
      const found = await prisma.video.findFirst({
        where: { slug: s, id: { not: id } },
        select: { id: true },
      });
      return Boolean(found);
    });
  }

  if (data.description !== undefined) updateData.description = data.description;
  if (data.youtubeUrl !== undefined) {
    updateData.youtubeUrl = data.youtubeUrl;
    if (data.youtubeUrl !== existing.youtubeUrl) {
      updateData.youtubeVideoId = extractYoutubeVideoId(data.youtubeUrl)!;
    }
  }
  if (data.thumbnailUrl !== undefined)
    updateData.thumbnailUrl = data.thumbnailUrl;
  if (data.duration !== undefined) updateData.duration = data.duration;
  if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
  if (data.displayOrder !== undefined)
    updateData.displayOrder = data.displayOrder;

  // A doctor attribution overrides any custom author name.
  if (data.doctorId !== undefined) {
    updateData.doctorId = data.doctorId || null;
    updateData.authorName = data.doctorId ? null : data.authorName;
  } else if (data.authorName !== undefined) {
    updateData.authorName = data.authorName;
  }

  const updated = await prisma.video.update({
    where: { id },
    data: updateData,
    include: videoInclude,
  });

  return NextResponse.json(updated);
}

async function deleteHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAuth(request, [UserRole.ADMIN]);
  const { id } = await params;

  const existing = await prisma.video.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  await prisma.video.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}

export const GET = withApi(getHandler);
export const PATCH = withApi(patchHandler);
export const DELETE = withApi(deleteHandler);
