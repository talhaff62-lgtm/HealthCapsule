import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth, withApi } from "@/lib/api-guard";
import { generateUniqueSlug } from "@/lib/slug";
import { createVideoSchema, extractYoutubeVideoId } from "@/lib/admin-content";

export const dynamic = "force-dynamic";

export const videoInclude = {
  doctor: { select: { id: true, name: true } },
  createdBy: { select: { id: true, name: true } },
} as const;

async function getHandler(request: NextRequest) {
  await requireAuth(request, [UserRole.ADMIN]);

  const videos = await prisma.video.findMany({
    where: { deletedAt: null },
    include: videoInclude,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(videos);
}

async function postHandler(request: NextRequest) {
  const auth = await requireAuth(request, [UserRole.ADMIN]);

  const body = await request.json();
  const parseResult = createVideoSchema.safeParse(body);
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
    const found = await prisma.video.findUnique({ where: { slug: s } });
    return Boolean(found);
  });

  const video = await prisma.video.create({
    data: {
      title: data.title.trim(),
      slug,
      description: data.description,
      youtubeUrl: data.youtubeUrl,
      youtubeVideoId: extractYoutubeVideoId(data.youtubeUrl)!,
      thumbnailUrl: data.thumbnailUrl,
      duration: data.duration,
      isFeatured: data.isFeatured,
      displayOrder: data.displayOrder,
      authorName: data.doctorId ? null : data.authorName,
      doctorId: data.doctorId || null,
      createdById: auth.userId,
    },
    include: videoInclude,
  });

  return NextResponse.json(video, { status: 201 });
}

export const GET = withApi(getHandler);
export const POST = withApi(postHandler);
