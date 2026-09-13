import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, withApi } from "@/lib/api-guard";
import { UserRole, VerificationStatus, Prisma } from "@prisma/client";
import { hashPassword } from "@/lib/jwt-auth";

export const dynamic = "force-dynamic";

const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["ADMIN", "STAFF"]),
});

async function postHandler(request: NextRequest) {
  await requireAuth(request, [UserRole.ADMIN]);

  const body = await request.json();
  const result = userSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: result.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; "),
      },
      { status: 400 }
    );
  }

  const { name, email, password, role } = result.data;
  const passwordHash = await hashPassword(password);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role as UserRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }
    throw e;
  }
}

async function getHandler(request: NextRequest) {
  await requireAuth(request, [UserRole.ADMIN]);

  const [users, facilityCounts, doctorCounts, verifiedFacilityCounts, verifiedDoctorCounts] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: [UserRole.STAFF, UserRole.ADMIN] } },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    prisma.facility.groupBy({
      by: ["collectedById"],
      _count: { _all: true },
    }),
    prisma.doctor.groupBy({
      by: ["collectedById"],
      _count: { _all: true },
    }),
    prisma.facility.groupBy({
      by: ["collectedById"],
      where: { verificationStatus: VerificationStatus.VERIFIED },
      _count: { _all: true },
    }),
    prisma.doctor.groupBy({
      by: ["collectedById"],
      where: { verificationStatus: VerificationStatus.VERIFIED },
      _count: { _all: true },
    }),
  ]);

  const countMap = new Map<string, { total: number; approved: number }>();

  const addCounts = (
    items: Array<{ collectedById: string | null; _count: { _all: number } }>,
    type: "total" | "approved"
  ) => {
    for (const item of items) {
      if (!item.collectedById) continue;
      const entry = countMap.get(item.collectedById) || { total: 0, approved: 0 };
      if (type === "total") {
        entry.total += item._count._all;
      } else {
        entry.approved += item._count._all;
      }
      countMap.set(item.collectedById, entry);
    }
  };

  addCounts(facilityCounts, "total");
  addCounts(doctorCounts, "total");
  addCounts(verifiedFacilityCounts, "approved");
  addCounts(verifiedDoctorCounts, "approved");

  const result = users.map((user) => {
    const counts = countMap.get(user.id) || { total: 0, approved: 0 };
    return {
      ...user,
      submissionCount: counts.total,
      approvedCount: counts.approved,
    };
  });

  return NextResponse.json(result, { status: 200 });
}

export const POST = withApi(postHandler);
export const GET = withApi(getHandler);
