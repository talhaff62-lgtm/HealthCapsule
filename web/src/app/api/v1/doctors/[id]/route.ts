import { NextRequest, NextResponse } from "next/server";
import { ListingTier, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth, withApi } from "@/lib/api-guard";

const TIERS = new Set<string>([
  ListingTier.FREE,
  ListingTier.VERIFIED,
  ListingTier.FEATURED,
  ListingTier.PREMIUM,
]);

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAuth(request, [UserRole.ADMIN]);
  const { id } = await params;

  const existing = await prisma.doctor.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as {
    name?: unknown;
    bio?: unknown;
    consultationFee?: unknown;
    listingTier?: unknown;
    featuredUntil?: unknown;
    photoUrl?: unknown;
    degrees?: unknown;
    currentPosition?: unknown;
    achievements?: unknown;
    bmdcRegNo?: unknown;
    yearsExperience?: unknown;
    languages?: unknown;
    gender?: unknown;
    expertise?: unknown;
    medicalCollege?: unknown;
    pgInstitution?: unknown;
    phone?: unknown;
    email?: unknown;
    hasOnlineConsultation?: unknown;
  } | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const data: {
    name?: string;
    bio?: string | null;
    consultationFee?: number | null;
    listingTier?: ListingTier;
    featuredUntil?: Date | null;
    photoUrl?: string | null;
    degrees?: string[];
    currentPosition?: string | null;
    achievements?: string | null;
    bmdcRegNo?: string | null;
    yearsExperience?: number | null;
    languages?: string[];
    gender?: string | null;
    expertise?: string | null;
    medicalCollege?: string | null;
    pgInstitution?: string | null;
    phone?: string | null;
    email?: string | null;
    hasOnlineConsultation?: boolean;
  } = {};

  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    data.name = body.name.trim();
  }

  if (body.bio !== undefined) {
    if (body.bio !== null && typeof body.bio !== "string") {
      return NextResponse.json({ error: "Invalid bio" }, { status: 400 });
    }
    data.bio = body.bio === null ? null : (body.bio as string);
  }

  if (body.consultationFee !== undefined) {
    if (body.consultationFee === null || body.consultationFee === "") {
      data.consultationFee = null;
    } else {
      const fee = Number(body.consultationFee);
      if (!Number.isFinite(fee) || fee < 0) {
        return NextResponse.json(
          { error: "Invalid consultationFee" },
          { status: 400 }
        );
      }
      data.consultationFee = fee;
    }
  }

  if (body.listingTier !== undefined) {
    if (typeof body.listingTier !== "string" || !TIERS.has(body.listingTier)) {
      return NextResponse.json(
        { error: "Invalid listingTier" },
        { status: 400 }
      );
    }
    data.listingTier = body.listingTier as ListingTier;
  }

  if (body.featuredUntil !== undefined) {
    if (body.featuredUntil === null || body.featuredUntil === "") {
      data.featuredUntil = null;
    } else if (typeof body.featuredUntil !== "string") {
      return NextResponse.json(
        { error: "Invalid featuredUntil" },
        { status: 400 }
      );
    } else {
      const time = Date.parse(body.featuredUntil);
      if (Number.isNaN(time)) {
        return NextResponse.json(
          { error: "Invalid featuredUntil" },
          { status: 400 }
        );
      }
      data.featuredUntil = new Date(time);
    }
  }

  if (body.photoUrl !== undefined) {
    if (body.photoUrl === null) {
      data.photoUrl = null;
    } else if (
      typeof body.photoUrl === "string" &&
      body.photoUrl.trim().length > 0 &&
      (body.photoUrl.startsWith("http://") || body.photoUrl.startsWith("https://"))
    ) {
      data.photoUrl = body.photoUrl;
    } else {
      return NextResponse.json(
        { error: "Invalid photoUrl" },
        { status: 400 }
      );
    }
  }

  if (body.degrees !== undefined) {
    if (typeof body.degrees === "string") {
      data.degrees = body.degrees
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean);
    } else if (
      Array.isArray(body.degrees) &&
      body.degrees.every((d) => typeof d === "string")
    ) {
      data.degrees = body.degrees.map((d) => d.trim()).filter(Boolean);
    } else {
      return NextResponse.json({ error: "Invalid degrees" }, { status: 400 });
    }
  }

  if (body.currentPosition !== undefined) {
    if (body.currentPosition === null) {
      data.currentPosition = null;
    } else if (typeof body.currentPosition === "string") {
      data.currentPosition = body.currentPosition.trim() || null;
    } else {
      return NextResponse.json(
        { error: "Invalid currentPosition" },
        { status: 400 }
      );
    }
  }

  if (body.achievements !== undefined) {
    if (body.achievements === null) {
      data.achievements = null;
    } else if (typeof body.achievements === "string") {
      data.achievements = body.achievements.trim() || null;
    } else {
      return NextResponse.json(
        { error: "Invalid achievements" },
        { status: 400 }
      );
    }
  }

  if (body.bmdcRegNo !== undefined) {
    if (body.bmdcRegNo === null) {
      data.bmdcRegNo = null;
    } else if (typeof body.bmdcRegNo === "string") {
      data.bmdcRegNo = body.bmdcRegNo.trim() || null;
    } else {
      return NextResponse.json({ error: "Invalid bmdcRegNo" }, { status: 400 });
    }
  }

  if (body.yearsExperience !== undefined) {
    if (body.yearsExperience === null || body.yearsExperience === "") {
      data.yearsExperience = null;
    } else {
      const exp = Number(body.yearsExperience);
      if (!Number.isFinite(exp) || exp < 0) {
        return NextResponse.json(
          { error: "Invalid yearsExperience" },
          { status: 400 }
        );
      }
      data.yearsExperience = exp;
    }
  }

  if (body.languages !== undefined) {
    if (typeof body.languages === "string") {
      data.languages = body.languages
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean);
    } else if (
      Array.isArray(body.languages) &&
      body.languages.every((l) => typeof l === "string")
    ) {
      data.languages = body.languages.map((l) => l.trim()).filter(Boolean);
    } else {
      return NextResponse.json({ error: "Invalid languages" }, { status: 400 });
    }
  }

  if (body.gender !== undefined) {
    if (body.gender === null) {
      data.gender = null;
    } else if (typeof body.gender === "string") {
      data.gender = body.gender.trim() || null;
    } else {
      return NextResponse.json({ error: "Invalid gender" }, { status: 400 });
    }
  }

  if (body.expertise !== undefined) {
    if (body.expertise === null) {
      data.expertise = null;
    } else if (typeof body.expertise === "string") {
      data.expertise = body.expertise.trim() || null;
    } else {
      return NextResponse.json({ error: "Invalid expertise" }, { status: 400 });
    }
  }

  if (body.medicalCollege !== undefined) {
    if (body.medicalCollege === null) {
      data.medicalCollege = null;
    } else if (typeof body.medicalCollege === "string") {
      data.medicalCollege = body.medicalCollege.trim() || null;
    } else {
      return NextResponse.json(
        { error: "Invalid medicalCollege" },
        { status: 400 }
      );
    }
  }

  if (body.pgInstitution !== undefined) {
    if (body.pgInstitution === null) {
      data.pgInstitution = null;
    } else if (typeof body.pgInstitution === "string") {
      data.pgInstitution = body.pgInstitution.trim() || null;
    } else {
      return NextResponse.json(
        { error: "Invalid pgInstitution" },
        { status: 400 }
      );
    }
  }

  if (body.phone !== undefined) {
    if (body.phone === null) {
      data.phone = null;
    } else if (typeof body.phone === "string") {
      data.phone = body.phone.trim() || null;
    } else {
      return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
    }
  }

  if (body.email !== undefined) {
    if (body.email === null) {
      data.email = null;
    } else if (typeof body.email === "string") {
      data.email = body.email.trim() || null;
    } else {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
  }

  if (body.hasOnlineConsultation !== undefined) {
    if (typeof body.hasOnlineConsultation !== "boolean") {
      return NextResponse.json(
        { error: "Invalid hasOnlineConsultation" },
        { status: 400 }
      );
    }
    data.hasOnlineConsultation = body.hasOnlineConsultation;
  }

  const updated = await prisma.doctor.update({ where: { id }, data });
  return NextResponse.json(updated, { status: 200 });
}

async function getHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAuth(request, [UserRole.ADMIN, UserRole.STAFF]);
  const { id } = await params;

  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: {
      collectedBy: { select: { name: true } },
      specialties: { include: { specialty: { select: { name: true } } } },
      chambers: {
        take: 1,
        where: { deletedAt: null },
        include: { facility: { select: { id: true, name: true } } },
      },
    },
  });
  if (!doctor) {
    return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
  }
  return NextResponse.json(doctor, { status: 200 });
}

async function deleteHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAuth(request, [UserRole.ADMIN]);
  const { id } = await params;

  const existing = await prisma.doctor.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
  }

  // Chamber/Schedule and DoctorSpecialty rows restrict by default, so clear the
  // branches explicitly before removing the doctor.
  await prisma.$transaction([
    prisma.appointment.deleteMany({ where: { doctorId: id } }),
    prisma.chamber.deleteMany({ where: { doctorId: id } }),
    prisma.doctorSpecialty.deleteMany({ where: { doctorId: id } }),
    prisma.doctor.delete({ where: { id } }),
  ]);

  return NextResponse.json({ ok: true }, { status: 200 });
}

export const GET = withApi(getHandler);
export const PATCH = withApi(handler);
export const DELETE = withApi(deleteHandler);
