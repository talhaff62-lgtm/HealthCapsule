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

  const facility = await prisma.facility.findFirst({
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
      type: true,
      address: true,
      phone: true,
      email: true,
      website: true,
      beds: true,
      hasIcu: true,
      hasNicu: true,
      hasEmergency: true,
      hasAmbulance: true,
      establishedYear: true,
      description: true,
      discountInfo: true,
      area: {
        select: {
          name: true,
        },
      },
      amenities: {
        select: {
          amenity: {
            select: {
              name: true,
              icon: true,
            },
          },
        },
      },
      services: {
        select: {
          name: true,
          price: true,
        },
      },
    },
  });

  if (!facility) {
    return NextResponse.json(
      { error: "Facility not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(facility);
}

export const GET = withApi(handler);
