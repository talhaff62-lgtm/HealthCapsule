import { NextRequest, NextResponse } from "next/server";
import { UserRole, VerificationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth, withApi } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

async function handler(request: NextRequest) {
  const auth = await requireAuth(request, [UserRole.STAFF, UserRole.ADMIN]);

  const options = await prisma.facility.findMany({
    where: {
      OR: [
        { collectedById: auth.userId },
        { verificationStatus: VerificationStatus.VERIFIED },
      ],
    },
    select: { id: true, name: true, type: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(options);
}

export const GET = withApi(handler);
