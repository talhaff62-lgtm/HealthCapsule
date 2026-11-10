import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public: districts that actually have content (active facilities or chambers),
// so the district switcher never offers an empty district.
async function handler() {
  const districts = await prisma.district.findMany({
    where: {
      OR: [
        {
          thanas: {
            some: { areas: { some: { facilities: { some: { isActive: true, deletedAt: null } } } } },
          },
        },
        {
          thanas: {
            some: { areas: { some: { chambers: { some: { isActive: true, deletedAt: null } } } } },
          },
        },
      ],
    },
    select: { name: true, bnName: true, slug: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(districts, {
    headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" },
  });
}

export { handler as GET };
