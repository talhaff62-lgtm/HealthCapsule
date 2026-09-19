import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withApi } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

async function handler() {
  const specialties = await prisma.specialty.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: { name: "asc" },
  });

  const areas = await prisma.area.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: "asc" },
    take: 100,
  });

  return NextResponse.json({ specialties, areas });
}

export const GET = withApi(handler);
