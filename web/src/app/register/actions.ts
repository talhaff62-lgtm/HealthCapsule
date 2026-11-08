"use server";

import { hash } from "bcryptjs";
import { FacilityType, UserRole, VerificationStatus, ListingTier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateUniqueSlug } from "@/lib/slug";
import { getServerLocale } from "@/lib/i18n-server";
import { getT } from "@/lib/i18n";

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

function validateCommon(email: string, password: string, name: string, t: (key: string) => string): string | null {
  const cleanEmail = normalizeEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return t("register.errors.invalidEmail");
  }
  if (password.length < 6) {
    return t("register.errors.passwordMinLength");
  }
  if (!name.trim()) {
    return t("register.errors.nameRequired");
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
    const locale = await getServerLocale();
    const t = getT(locale);

    const commonError = validateCommon(input.email, input.password, input.name, t);
    if (commonError) {
      return { ok: false, error: commonError };
    }

    const bmdcRegNo = input.bmdcRegNo.trim();
    if (!bmdcRegNo) {
      return { ok: false, error: t("register.errors.bmdcRequired") };
    }

    const specialtyId = input.specialtyId.trim();
    if (!specialtyId) {
      return { ok: false, error: t("register.errors.specialtyRequired") };
    }

    const specialty = await prisma.specialty.findUnique({
      where: { id: specialtyId, deletedAt: null },
    });
    if (!specialty) {
      return { ok: false, error: t("register.errors.specialtyInvalid") };
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
    const locale = await getServerLocale();
    const t = getT(locale);
    
    if (isUniqueConstraintError(err)) {
      const target = (err as { meta?: { target?: string[] } }).meta?.target;
      if (target?.includes("email")) {
        return { ok: false, error: t("register.errors.emailTaken") };
      }
      if (target?.includes("bmdcRegNo")) {
        return { ok: false, error: t("register.errors.bmdcTaken") };
      }
      return { ok: false, error: t("register.errors.uniqueConflict") };
    }

    const message = err instanceof Error ? err.message : t("register.errors.registrationFailed");
    return { ok: false, error: message };
  }
}

export async function registerFacility(input: RegisterFacilityInput): Promise<RegisterResult> {
  try {
    const locale = await getServerLocale();
    const t = getT(locale);
    
    const commonError = validateCommon(input.email, input.password, input.name, t);
    if (commonError) {
      return { ok: false, error: commonError };
    }

    const areaId = input.areaId.trim();
    if (!areaId) {
      return { ok: false, error: t("form.facility.messages.areaRequired") };
    }

    const address = input.address.trim();
    if (!address) {
      return { ok: false, error: t("register.errors.addressRequired") };
    }

    const area = await prisma.area.findUnique({
      where: { id: areaId, deletedAt: null },
    });
    if (!area) {
      return { ok: false, error: t("register.errors.invalidArea") };
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
    const locale = await getServerLocale();
    const t = getT(locale);
    if (isUniqueConstraintError(err)) {
      const target = (err as { meta?: { target?: string[] } }).meta?.target;
      if (target?.includes("email")) {
        return { ok: false, error: t("register.errors.emailTaken") };
      }
      return { ok: false, error: t("register.errors.uniqueConflict") };
    }

    const message = err instanceof Error ? err.message : t("register.errors.registrationFailed");
    return { ok: false, error: message };
  }
}
