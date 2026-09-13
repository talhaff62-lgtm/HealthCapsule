import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, withApi } from "@/lib/api-guard";

async function handler(request: NextRequest) {
  const auth = await requireAuth(request);

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, name: true, role: true },
  });

  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(user, { status: 200 });
}

export const GET = withApi(handler);
