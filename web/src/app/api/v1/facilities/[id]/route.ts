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
  } | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const data: {
    name?: string;
    description?: string | null;
    listingTier?: ListingTier;
    featuredUntil?: Date | null;
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

  const updated = await prisma.facility.update({ where: { id }, data });
  return NextResponse.json(updated, { status: 200 });
}

export const PATCH = withApi(handler);
