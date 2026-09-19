import { NextRequest, NextResponse } from "next/server";
import { Prisma, VerificationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withApi } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

async function handler(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const specialty = searchParams.get("specialty")?.trim();
  const area = searchParams.get("area")?.trim();

  const where: Prisma.DoctorWhereInput = {
    verificationStatus: VerificationStatus.VERIFIED,
    isActive: true,
    deletedAt: null,
    ...(q && q.length >= 1 ? { name: { contains: q, mode: "insensitive" } } : {}),
    ...(specialty ? { specialties: { some: { specialty: { slug: specialty } } } } : {}),
    ...(area ? { chambers: { some: { areaId: area } } } : {}),
  };

  const doctors = await prisma.doctor.findMany({
    where,
    select: {
      id: true,
      name: true,
      slug: true,
      degrees: true,
      currentPosition: true,
      specialties: {
        select: {
          specialty: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      },
      chambers: {
        where: { isActive: true },
        take: 1,
        select: {
          facility: {
            select: {
              name: true,
            },
          },
          area: {
            select: {
              name: true,
            },
          },
          consultationFee: true,
        },
      },
    },
    orderBy: { name: "asc" },
    take: 100,
  });

  return NextResponse.json(doctors);
}

export const GET = withApi(handler);
