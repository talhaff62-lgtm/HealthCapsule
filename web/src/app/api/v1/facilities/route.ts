import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { UserRole, VerificationStatus, FacilityType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth, withApi } from "@/lib/api-guard";
import { generateUniqueSlug } from "@/lib/slug";

export const dynamic = "force-dynamic";

const createFacilitySchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  type: z.enum(["HOSPITAL", "DIAGNOSTIC_CENTER"]).default("HOSPITAL"),
  areaId: z.string().min(1),
  amenityIds: z.array(z.string()).default([]),
  discountInfo: z.string().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  coverImageUrl: z.string().url().optional().nullable(),
});

async function postHandler(request: NextRequest) {
  const auth = await requireAuth(request, [UserRole.STAFF, UserRole.ADMIN]);

  const body = await request.json();
  const parseResult = createFacilitySchema.safeParse(body);
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

  const area = await prisma.area.findUnique({
    where: { id: data.areaId },
    select: { id: true, name: true, latitude: true, longitude: true },
  });

  if (!area) {
    return NextResponse.json({ error: "Invalid area" }, { status: 400 });
  }

  let validAmenityIds: string[] = [];
  if (data.amenityIds.length > 0) {
    const amenities = await prisma.amenity.findMany({
      where: { id: { in: data.amenityIds } },
      select: { id: true },
    });
    validAmenityIds = amenities.map((a) => a.id);
  }

  const slug = await generateUniqueSlug(data.name, async (s) => {
    const found = await prisma.facility.findUnique({ where: { slug: s } });
    return Boolean(found);
  });

  const facility = await prisma.facility.create({
    data: {
      name: data.name,
      slug,
      type: data.type as FacilityType,
      address: data.address,
      areaId: area.id,
      discountInfo: data.discountInfo || null,
      logoUrl: data.logoUrl || null,
      coverImageUrl: data.coverImageUrl || null,
      latitude: area.latitude,
      longitude: area.longitude,
      verificationStatus: VerificationStatus.PENDING,
      collectedById: auth.userId,
      collectedAt: new Date(),
      amenities: {
        create: validAmenityIds.map((amenityId) => ({ amenityId })),
      },
    },
    include: {
      amenities: {
        include: {
          amenity: { select: { id: true, name: true } },
        },
      },
      area: { select: { id: true, name: true } },
      collectedBy: { select: { id: true, name: true } },
      reviewedBy: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(facility, { status: 201 });
}

async function getHandler(request: NextRequest) {
  await requireAuth(request, [UserRole.ADMIN]);

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("verificationStatus");
  const collectedById = searchParams.get("collectedById");

  const where: Prisma.FacilityWhereInput = {};

  if (statusParam) {
    if (!Object.values(VerificationStatus).includes(statusParam as VerificationStatus)) {
      return NextResponse.json({ error: "Invalid verificationStatus" }, { status: 400 });
    }
    where.verificationStatus = statusParam as VerificationStatus;
  }

  if (collectedById) {
    where.collectedById = collectedById;
  }

  const facilities = await prisma.facility.findMany({
    where,
    include: {
      collectedBy: { select: { id: true, name: true } },
      reviewedBy: { select: { id: true, name: true } },
      amenities: {
        include: {
          amenity: { select: { id: true, name: true } },
        },
      },
      area: { select: { id: true, name: true } },
    },
    orderBy: { collectedAt: "desc" },
  });

  return NextResponse.json(facilities);
}

export const POST = withApi(postHandler);
export const GET = withApi(getHandler);
