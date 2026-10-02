import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { UserRole, VerificationStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth, withApi } from "@/lib/api-guard";
import { generateUniqueSlug, slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";

const createDoctorSchema = z.object({
  name: z.string().min(1),
  specialization: z.string().min(1),
  degrees: z.string().min(1),
  currentPosition: z.string().optional().nullable(),
  achievements: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  facilityId: z.string().optional().nullable(),
  expertise: z.string().optional().nullable(),
  medicalCollege: z.string().optional().nullable(),
  pgInstitution: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  bmdcRegNo: z.string().optional().nullable(),
  yearsExperience: z.number().int().optional().nullable(),
  gender: z.string().optional().nullable(),
  languages: z.string().optional().nullable(),
  consultationFee: z.number().optional().nullable(),
  bio: z.string().optional().nullable(),
  hasOnlineConsultation: z.boolean().default(false).optional(),
});

async function postHandler(request: NextRequest) {
  const auth = await requireAuth(request, [UserRole.STAFF, UserRole.ADMIN]);

  const body = await request.json();
  const parseResult = createDoctorSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: parseResult.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; "),
      },
      { status: 400 }
    );
  }

  const data = parseResult.data;

  // Split degrees on comma, trim, drop empties
  const degreesArray = data.degrees
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean);

  const languagesArray = data.languages
    ? data.languages.split(",").map((l) => l.trim()).filter(Boolean)
    : [];

  let facilityAreaId: string | null = null;
  if (data.facilityId) {
    const facility = await prisma.facility.findUnique({
      where: { id: data.facilityId },
      select: { id: true, collectedById: true, verificationStatus: true, areaId: true },
    });

    if (
      !facility ||
      (facility.collectedById !== auth.userId &&
        facility.verificationStatus !== VerificationStatus.VERIFIED)
    ) {
      return NextResponse.json({ error: "Invalid facility" }, { status: 400 });
    }
    facilityAreaId = facility.areaId;
  }

  const slug = await generateUniqueSlug(data.name, async (s) => {
    const found = await prisma.doctor.findUnique({ where: { slug: s } });
    return Boolean(found);
  });

  const specSlug = slugify(data.specialization) || "general";
  const specialty = await prisma.specialty.upsert({
    where: { slug: specSlug },
    update: {},
    create: { name: data.specialization, slug: specSlug },
  });

  const doctor = await prisma.doctor.create({
    data: {
      name: data.name,
      slug,
      photoUrl: data.photoUrl || null,
      degrees: degreesArray,
      currentPosition: data.currentPosition || null,
      achievements: data.achievements || null,
      expertise: data.expertise || null,
      medicalCollege: data.medicalCollege || null,
      pgInstitution: data.pgInstitution || null,
      phone: data.phone || null,
      email: data.email || null,
      bmdcRegNo: data.bmdcRegNo || null,
      yearsExperience: data.yearsExperience ?? null,
      gender: data.gender || null,
      languages: languagesArray,
      consultationFee: data.consultationFee ?? null,
      bio: data.bio || null,
      hasOnlineConsultation: data.hasOnlineConsultation ?? false,
      verificationStatus:
        auth.role === UserRole.ADMIN
          ? VerificationStatus.VERIFIED
          : VerificationStatus.PENDING,
      collectedById: auth.userId,
      collectedAt: new Date(),
      specialties: {
        create: [{ specialtyId: specialty.id }],
      },
      chambers: data.facilityId
        ? {
            create: [
              {
                facilityId: data.facilityId,
                areaId: facilityAreaId,
                isActive: true,
              },
            ],
          }
        : undefined,
    },
    include: {
      specialties: {
        include: {
          specialty: { select: { id: true, name: true, slug: true } },
        },
      },
      chambers: {
        take: 1,
        include: {
          facility: { select: { id: true, name: true } },
        },
      },
      collectedBy: { select: { id: true, name: true } },
      reviewedBy: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(doctor, { status: 201 });
}

async function getHandler(request: NextRequest) {
  await requireAuth(request, [UserRole.ADMIN]);

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("verificationStatus");
  const collectedById = searchParams.get("collectedById");

  const where: Prisma.DoctorWhereInput = {};

  if (statusParam) {
    if (!Object.values(VerificationStatus).includes(statusParam as VerificationStatus)) {
      return NextResponse.json({ error: "Invalid verificationStatus" }, { status: 400 });
    }
    where.verificationStatus = statusParam as VerificationStatus;
  }

  if (collectedById) {
    where.collectedById = collectedById;
  }

  const doctors = await prisma.doctor.findMany({
    where,
    include: {
      specialties: {
        include: {
          specialty: { select: { id: true, name: true, slug: true } },
        },
      },
      chambers: {
        take: 1,
        include: {
          facility: { select: { id: true, name: true } },
        },
      },
      collectedBy: { select: { id: true, name: true } },
      reviewedBy: { select: { id: true, name: true } },
    },
    orderBy: { collectedAt: "desc" },
  });

  return NextResponse.json(doctors);
}

export const POST = withApi(postHandler);
export const GET = withApi(getHandler);
