import { NextRequest, NextResponse } from "next/server";
import { UserRole, VerificationStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth, withApi } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

async function handler(request: NextRequest) {
  await requireAuth(request, [UserRole.STAFF, UserRole.ADMIN]);

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  const where: Prisma.DoctorWhereInput = {
    verificationStatus: VerificationStatus.VERIFIED,
    isActive: true,
    ...(q && q.length >= 1 ? { name: { contains: q, mode: "insensitive" } } : {}),
  };

  const doctors = await prisma.doctor.findMany({
    where,
    select: {
      id: true,
      name: true,
      degrees: true,
      currentPosition: true,
      specialties: {
        select: {
          specialty: { select: { name: true } },
        },
      },
      chambers: {
        take: 1,
        select: {
          facility: { select: { name: true } },
        },
      },
    },
    orderBy: { name: "asc" },
    take: 20,
  });

  return NextResponse.json(doctors);
}

export const GET = withApi(handler);
