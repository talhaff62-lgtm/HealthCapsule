import { NextRequest, NextResponse } from "next/server";
import { VerificationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withApi } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

async function handler(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const doctor = await prisma.doctor.findFirst({
    where: {
      slug,
      verificationStatus: VerificationStatus.VERIFIED,
      isActive: true,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      photoUrl: true,
      degrees: true,
      currentPosition: true,
      achievements: true,
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
        select: {
          address: true,
          consultationFee: true,
          facility: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          area: {
            select: {
              name: true,
            },
          },
          schedules: {
            where: { isActive: true },
            select: {
              dayOfWeek: true,
              startTime: true,
              endTime: true,
            },
          },
        },
      },
    },
  });

  if (!doctor) {
    return NextResponse.json(
      { error: "Doctor not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(doctor);
}

export const GET = withApi(handler);
