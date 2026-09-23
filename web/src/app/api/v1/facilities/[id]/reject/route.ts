import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { UserRole, VerificationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth, withApi } from "@/lib/api-guard";

const rejectSchema = z.object({
  rejectReason: z.string().min(1),
});

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request, [UserRole.ADMIN]);
  const { id } = await params;

  const body = await request.json();
  const parseResult = rejectSchema.safeParse(body);
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

  const existing = await prisma.facility.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Facility not found" }, { status: 404 });
  }

  const updated = await prisma.facility.update({
    where: { id },
    data: {
      verificationStatus: VerificationStatus.REJECTED,
      rejectReason: parseResult.data.rejectReason,
      reviewedById: auth.userId,
      reviewedAt: new Date(),
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
