import { NextRequest, NextResponse } from "next/server";
import { UserRole, VerificationStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth, withApi } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

async function handler(request: NextRequest) {
  await requireAuth(request, [UserRole.STAFF, UserRole.ADMIN]);

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  const where: Prisma.FacilityWhereInput = {
    verificationStatus: VerificationStatus.VERIFIED,
    isActive: true,
    ...(q && q.length >= 1 ? { name: { contains: q, mode: "insensitive" } } : {}),
  };

  const facilities = await prisma.facility.findMany({
    where,
    select: {
      id: true,
      name: true,
      type: true,
      address: true,
      area: { select: { name: true } },
    },
    orderBy: { name: "asc" },
    take: 20,
  });

  return NextResponse.json(facilities);
}

export const GET = withApi(handler);
