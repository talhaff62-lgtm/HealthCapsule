import { NextRequest, NextResponse } from "next/server";
import { ListingTier, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth, withApi } from "@/lib/api-guard";

const TIERS = new Set<string>([
  ListingTier.FREE,
  ListingTier.VERIFIED,
  ListingTier.FEATURED,
  ListingTier.PREMIUM,
]);

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAuth(request, [UserRole.ADMIN]);
  const { id } = await params;

  const existing = await prisma.facility.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Facility not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as {
    name?: unknown;
    description?: unknown;
    listingTier?: unknown;
    featuredUntil?: unknown;
    logoUrl?: unknown;
    coverImageUrl?: unknown;
  } | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const data: {
    name?: string;
    description?: string | null;
    listingTier?: ListingTier;
    featuredUntil?: Date | null;
    logoUrl?: string | null;
    coverImageUrl?: string | null;
  } = {};

  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    data.name = body.name.trim();
  }

  if (body.description !== undefined) {
    if (body.description !== null && typeof body.description !== "string") {
      return NextResponse.json(
        { error: "Invalid description" },
        { status: 400 }
      );
    }
    data.description = body.description === null ? null : (body.description as string);
  }

  if (body.listingTier !== undefined) {
    if (typeof body.listingTier !== "string" || !TIERS.has(body.listingTier)) {
      return NextResponse.json(
        { error: "Invalid listingTier" },
        { status: 400 }
      );
    }
    data.listingTier = body.listingTier as ListingTier;
  }

  if (body.featuredUntil !== undefined) {
    if (body.featuredUntil === null || body.featuredUntil === "") {
      data.featuredUntil = null;
    } else if (typeof body.featuredUntil !== "string") {
      return NextResponse.json(
        { error: "Invalid featuredUntil" },
        { status: 400 }
      );
    } else {
      const time = Date.parse(body.featuredUntil);
      if (Number.isNaN(time)) {
        return NextResponse.json(
          { error: "Invalid featuredUntil" },
          { status: 400 }
        );
      }
      data.featuredUntil = new Date(time);
    }
  }

  if (body.logoUrl !== undefined) {
    if (body.logoUrl === null) {
      data.logoUrl = null;
    } else if (
      typeof body.logoUrl === "string" &&
      body.logoUrl.trim().length > 0 &&
      (body.logoUrl.startsWith("http://") || body.logoUrl.startsWith("https://"))
    ) {
      data.logoUrl = body.logoUrl;
    } else {
      return NextResponse.json(
        { error: "Invalid logoUrl" },
        { status: 400 }
      );
    }
  }

  if (body.coverImageUrl !== undefined) {
    if (body.coverImageUrl === null) {
      data.coverImageUrl = null;
    } else if (
      typeof body.coverImageUrl === "string" &&
      body.coverImageUrl.trim().length > 0 &&
      (body.coverImageUrl.startsWith("http://") || body.coverImageUrl.startsWith("https://"))
    ) {
      data.coverImageUrl = body.coverImageUrl;
    } else {
      return NextResponse.json(
        { error: "Invalid coverImageUrl" },
        { status: 400 }
      );
    }
  }

  const updated = await prisma.facility.update({ where: { id }, data });
  return NextResponse.json(updated, { status: 200 });
}

async function getHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAuth(request, [UserRole.ADMIN, UserRole.STAFF]);
  const { id } = await params;

  const facility = await prisma.facility.findUnique({
    where: { id },
    include: { collectedBy: { select: { name: true } } },
  });
  if (!facility) {
    return NextResponse.json({ error: "Facility not found" }, { status: 404 });
  }
  return NextResponse.json(facility, { status: 200 });
}

async function deleteHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAuth(request, [UserRole.ADMIN]);
  const { id } = await params;

  const existing = await prisma.facility.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ error: "Facility not found" }, { status: 404 });
  }

  // Chambers detach rather than delete (they belong to doctors); appointments
  // at this facility go with it. Amenities/services/departments/images cascade.
  await prisma.$transaction([
    prisma.appointment.deleteMany({ where: { facilityId: id } }),
    prisma.chamber.updateMany({ where: { facilityId: id }, data: { facilityId: null } }),
    prisma.facility.delete({ where: { id } }),
  ]);

  return NextResponse.json({ ok: true }, { status: 200 });
}

export const GET = withApi(getHandler);
export const PATCH = withApi(handler);
export const DELETE = withApi(deleteHandler);
