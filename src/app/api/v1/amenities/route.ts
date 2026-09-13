import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth, withApi } from "@/lib/api-guard";

async function handler(request: NextRequest) {
  await requireAuth(request, [UserRole.STAFF, UserRole.ADMIN]);

  const amenities = await prisma.amenity.findMany({
    select: { id: true, name: true, icon: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(amenities);
}

export const GET = withApi(handler);
