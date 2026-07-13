"use server";

import { revalidatePath } from "next/cache";
import { ListingTier, VerificationStatus, UserRole } from "@prisma/client";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export type AdminActionResult = { ok: true } | { ok: false; error: string };

export async function setVerificationStatus(
  doctorId: string,
  status: VerificationStatus
): Promise<AdminActionResult> {
  try {
    const admin = await requireRole(UserRole.ADMIN);

    await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        verificationStatus: status,
        verifiedAt: status === VerificationStatus.VERIFIED ? new Date() : null,
        verifiedById: status === VerificationStatus.VERIFIED ? admin.id : null,
      },
    });

    revalidatePath("/doctors");
    revalidatePath(`/portal/admin`);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return { ok: false, error: message };
  }
}

export async function setListingTier(
  doctorId: string,
  tier: ListingTier
): Promise<AdminActionResult> {
  try {
    await requireRole(UserRole.ADMIN);

    await prisma.doctor.update({
      where: { id: doctorId },
      data: { listingTier: tier },
    });

    revalidatePath("/doctors");
    revalidatePath(`/portal/admin`);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return { ok: false, error: message };
  }
}

export async function setFacilityVerificationStatus(
  facilityId: string,
  status: VerificationStatus
): Promise<AdminActionResult> {
  try {
    await requireRole(UserRole.ADMIN);

    await prisma.facility.update({
      where: { id: facilityId },
      data: { verificationStatus: status },
    });

    revalidatePath("/healthcares");
    revalidatePath("/portal/admin");
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return { ok: false, error: message };
  }
}

export async function setFacilityListingTier(
  facilityId: string,
  tier: ListingTier
): Promise<AdminActionResult> {
  try {
    await requireRole(UserRole.ADMIN);

    await prisma.facility.update({
      where: { id: facilityId },
      data: { listingTier: tier },
    });

    revalidatePath("/healthcares");
    revalidatePath("/portal/admin");
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return { ok: false, error: message };
  }
}
