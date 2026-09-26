import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth, withApi } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

async function deleteHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId: callerId } = await requireAuth(request, [UserRole.ADMIN]);
  const { id } = await params;

  if (callerId === id) {
    return NextResponse.json(
      { error: "You cannot delete your own account" },
      { status: 409 }
    );
  }

  const existing = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, doctorAccount: { select: { id: true } } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  if (existing.doctorAccount) {
    return NextResponse.json(
      { error: "This account is linked to a doctor profile and cannot be deleted" },
      { status: 409 }
    );
  }

  // Entries collected/reviewed by this user are kept: their collectedById /
  // reviewedById are nulled automatically (onDelete: SetNull in the schema).
  await prisma.$transaction([
    prisma.facility.updateMany({ where: { adminId: id }, data: { adminId: null } }),
    prisma.user.delete({ where: { id } }),
  ]);

  return NextResponse.json({ ok: true }, { status: 200 });
}

export const DELETE = withApi(deleteHandler);
