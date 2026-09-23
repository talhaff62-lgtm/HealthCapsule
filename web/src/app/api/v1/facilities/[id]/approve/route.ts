import { NextRequest, NextResponse } from "next/server";
import { UserRole, VerificationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth, withApi } from "@/lib/api-guard";

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request, [UserRole.ADMIN]);
  const { id } = await params;

  const existing = await prisma.facility.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Facility not found" }, { status: 404 });
  }

  const updated = await prisma.facility.update({
    where: { id },
    data: {
      verificationStatus: VerificationStatus.VERIFIED,
      reviewedById: auth.userId,
      reviewedAt: new Date(),
      rejectReason: null,
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

  return NextResponse.json(updated, { status: 200 });
}

export const PATCH = withApi(handler);
