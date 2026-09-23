import { NextRequest, NextResponse } from "next/server";
import { UserRole, VerificationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth, withApi } from "@/lib/api-guard";

// Unverify = hide from public site (resets status to PENDING)
async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request, [UserRole.ADMIN]);
  const { id } = await params;

  const doctor = await prisma.doctor.findUnique({
    where: { id },
  });

  if (!doctor) {
    return NextResponse.json(
      { error: "Doctor not found" },
      { status: 404 }
    );
  }

  const updated = await prisma.doctor.update({
    where: { id },
    data: {
      verificationStatus: VerificationStatus.PENDING,
      reviewedById: auth.userId,
      reviewedAt: new Date(),
      rejectReason: null,
    },
    include: {
      specialties: {
        include: {
          specialty: { select: { id: true, name: true, slug: true } },
        },
      },
      chambers: {
        take: 1,
        include: {
          facility: { select: { id: true, name: true } },
        },
      },
      collectedBy: { select: { id: true, name: true } },
      reviewedBy: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(updated, { status: 200 });
}

export const PATCH = withApi(handler);
