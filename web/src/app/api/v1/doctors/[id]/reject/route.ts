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
  const result = rejectSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: result.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; "),
      },
      { status: 400 }
    );
  }

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
      verificationStatus: VerificationStatus.REJECTED,
      rejectReason: result.data.rejectReason,
      reviewedById: auth.userId,
      reviewedAt: new Date(),
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
