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

  const existing = await prisma.doctor.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as {
    name?: unknown;
    bio?: unknown;
    consultationFee?: unknown;
    listingTier?: unknown;
    featuredUntil?: unknown;
  } | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const data: {
    name?: string;
    bio?: string | null;
    consultationFee?: number | null;
    listingTier?: ListingTier;
    featuredUntil?: Date | null;
  } = {};

  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    data.name = body.name.trim();
  }

  if (body.bio !== undefined) {
    if (body.bio !== null && typeof body.bio !== "string") {
      return NextResponse.json({ error: "Invalid bio" }, { status: 400 });
    }
    data.bio = body.bio === null ? null : (body.bio as string);
  }

  if (body.consultationFee !== undefined) {
    if (body.consultationFee === null || body.consultationFee === "") {
      data.consultationFee = null;
    } else {
      const fee = Number(body.consultationFee);
      if (!Number.isFinite(fee) || fee < 0) {
        return NextResponse.json(
          { error: "Invalid consultationFee" },
          { status: 400 }
        );
      }
      data.consultationFee = fee;
    }
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

  const updated = await prisma.doctor.update({ where: { id }, data });
  return NextResponse.json(updated, { status: 200 });
}

async function getHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAuth(request, [UserRole.ADMIN, UserRole.STAFF]);
  const { id } = await params;

  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: {
      collectedBy: { select: { name: true } },
      specialties: { include: { specialty: { select: { name: true } } } },
    },
  });
  if (!doctor) {
    return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
  }
  return NextResponse.json(doctor, { status: 200 });
}

async function deleteHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAuth(request, [UserRole.ADMIN]);
  const { id } = await params;

  const existing = await prisma.doctor.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
  }

  // Chamber/Schedule and DoctorSpecialty rows restrict by default, so clear the
  // branches explicitly before removing the doctor.
  await prisma.$transaction([
    prisma.appointment.deleteMany({ where: { doctorId: id } }),
    prisma.chamber.deleteMany({ where: { doctorId: id } }),
    prisma.doctorSpecialty.deleteMany({ where: { doctorId: id } }),
    prisma.doctor.delete({ where: { id } }),
  ]);

  return NextResponse.json({ ok: true }, { status: 200 });
}

export const GET = withApi(getHandler);
export const PATCH = withApi(handler);
export const DELETE = withApi(deleteHandler);
