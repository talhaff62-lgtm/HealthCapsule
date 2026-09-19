"use server";

import { hash } from "bcryptjs";
import { FacilityType, UserRole, VerificationStatus, ListingTier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateUniqueSlug } from "@/lib/slug";

export type RegisterResult = { ok: true } | { ok: false; error: string };

type RegisterDoctorInput = {
  email: string;
  password: string;
  name: string;
  bmdcRegNo: string;
  specialtyId: string;
};

type RegisterFacilityInput = {
  email: string;
  password: string;
  name: string;
  type: FacilityType;
  areaId: string;
  address: string;
};

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

function validateCommon(email: string, password: string, name: string): string | null {
  const cleanEmail = normalizeEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return "Enter a valid email address.";
  }
  if (password.length < 6) {
    return "Password must be at least 6 characters.";
  }
  if (!name.trim()) {
    return "Name is required.";
  }
  return null;
}

function isUniqueConstraintError(err: unknown): boolean {
  return (
    err instanceof Error &&
    "code" in err &&
    (err as { code?: string }).code === "P2002"
  );
}

export async function registerDoctor(input: RegisterDoctorInput): Promise<RegisterResult> {
  try {
    const commonError = validateCommon(input.email, input.password, input.name);
    if (commonError) {
      return { ok: false, error: commonError };
    }

    const bmdcRegNo = input.bmdcRegNo.trim();
    if (!bmdcRegNo) {
      return { ok: false, error: "BMDC registration number is required." };
    }

    const specialtyId = input.specialtyId.trim();
    if (!specialtyId) {
      return { ok: false, error: "Primary specialty is required." };
    }

    const specialty = await prisma.specialty.findUnique({
      where: { id: specialtyId, deletedAt: null },
    });
    if (!specialty) {
      return { ok: false, error: "Selected specialty is invalid." };
    }

    const passwordHash = await hash(input.password, 10);
    const email = normalizeEmail(input.email);

    const slug = await generateUniqueSlug(input.name, async (candidate) => {
      const existing = await prisma.doctor.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });
      return !!existing;
    });

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: UserRole.DOCTOR,
        },
        select: { id: true },
      });

      await tx.doctor.create({
        data: {
          name: input.name.trim(),
          slug,
          bmdcRegNo,
          verificationStatus: VerificationStatus.PENDING,
          listingTier: ListingTier.FREE,
          userId: user.id,
          specialties: {
            create: {
              specialtyId: specialty.id,
            },
          },
        },
      });
    });

    return { ok: true };
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      const target = (err as { meta?: { target?: string[] } }).meta?.target;
      if (target?.includes("email")) {
        return { ok: false, error: "This email is already registered." };
      }
      if (target?.includes("bmdcRegNo")) {
        return { ok: false, error: "This BMDC registration number is already registered." };
      }
      return { ok: false, error: "A unique field conflict occurred. Please check your details." };
    }

    const message = err instanceof Error ? err.message : "Registration failed. Please try again.";
    return { ok: false, error: message };
  }
}

export async function registerFacility(input: RegisterFacilityInput): Promise<RegisterResult> {
  try {
    const commonError = validateCommon(input.email, input.password, input.name);
    if (commonError) {
      return { ok: false, error: commonError };
    }

    const areaId = input.areaId.trim();
    if (!areaId) {
      return { ok: false, error: "Area is required." };
    }

    const address = input.address.trim();
    if (!address) {
      return { ok: false, error: "Address is required." };
    }

    const area = await prisma.area.findUnique({
      where: { id: areaId, deletedAt: null },
    });
    if (!area) {
      return { ok: false, error: "Selected area is invalid." };
    }

    const passwordHash = await hash(input.password, 10);
    const email = normalizeEmail(input.email);

    const slug = await generateUniqueSlug(input.name, async (candidate) => {
      const existing = await prisma.facility.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });
      return !!existing;
    });

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: UserRole.FACILITY_ADMIN,
        },
        select: { id: true },
      });

      await tx.facility.create({
        data: {
          name: input.name.trim(),
          slug,
          type: input.type,
          areaId: area.id,
          address,
          verificationStatus: VerificationStatus.PENDING,
          listingTier: ListingTier.FREE,
          adminId: user.id,
        },
      });
    });

    return { ok: true };
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      const target = (err as { meta?: { target?: string[] } }).meta?.target;
      if (target?.includes("email")) {
        return { ok: false, error: "This email is already registered." };
      }
      return { ok: false, error: "A unique field conflict occurred. Please check your details." };
    }

    const message = err instanceof Error ? err.message : "Registration failed. Please try again.";
    return { ok: false, error: message };
  }
}
