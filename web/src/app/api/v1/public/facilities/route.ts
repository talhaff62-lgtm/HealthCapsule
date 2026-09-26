import { NextRequest, NextResponse } from "next/server";
import { Prisma, VerificationStatus, FacilityType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withApi } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

async function handler(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const typeStr = searchParams.get("type")?.trim();
  const area = searchParams.get("area")?.trim();

  let facilityType: FacilityType | undefined = undefined;
  if (typeStr && Object.values(FacilityType).includes(typeStr as FacilityType)) {
    facilityType = typeStr as FacilityType;
  }

  const where: Prisma.FacilityWhereInput = {
    verificationStatus: VerificationStatus.VERIFIED,
    isActive: true,
    deletedAt: null,
    ...(q && q.length >= 1 ? { name: { contains: q, mode: "insensitive" } } : {}),
    ...(facilityType ? { type: facilityType } : {}),
    ...(area ? { areaId: area } : {}),
  };

  const facilities = await prisma.facility.findMany({
    where,
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      logoUrl: true,
      address: true,
      phone: true,
      hasEmergency: true,
      coverImageUrl: true,
      area: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { name: "asc" },
    take: 100,
  });

  return NextResponse.json(facilities);
}

export const GET = withApi(handler);
