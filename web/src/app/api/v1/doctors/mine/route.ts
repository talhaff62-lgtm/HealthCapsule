import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth, withApi } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

async function handler(request: NextRequest) {
  const auth = await requireAuth(request, [UserRole.STAFF, UserRole.ADMIN]);

  const doctors = await prisma.doctor.findMany({
    where: { collectedById: auth.userId },
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
    orderBy: { collectedAt: "desc" },
  });

  return NextResponse.json(doctors);
}

export const GET = withApi(handler);
