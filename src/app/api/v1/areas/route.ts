import { NextRequest, NextResponse } from "next/server";
import { UserRole, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth, withApi } from "@/lib/api-guard";

async function handler(request: NextRequest) {
  await requireAuth(request, [UserRole.STAFF, UserRole.ADMIN]);

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim();

  const where: Prisma.AreaWhereInput = {};
  if (query && query.length >= 1) {
    where.name = { contains: query, mode: "insensitive" };
  }

  const areas = await prisma.area.findMany({
    where,
    take: 25,
    select: {
      id: true,
      name: true,
      latitude: true,
      longitude: true,
      thana: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(areas);
}

export const GET = withApi(handler);
