import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth, withApi } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

async function handler(request: NextRequest) {
  const auth = await requireAuth(request, [UserRole.STAFF, UserRole.ADMIN]);

  const facilities = await prisma.facility.findMany({
    where: { collectedById: auth.userId },
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

export const GET = withApi(handler);
