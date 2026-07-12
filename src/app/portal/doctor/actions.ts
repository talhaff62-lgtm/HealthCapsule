"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type UpdateProfileResult =
  | { ok: true; slug: string }
  | { ok: false; error: string };

export async function updateDoctorProfile(
  doctorId: string,
  formData: FormData
): Promise<UpdateProfileResult> {
  try {
    const bio = (formData.get("bio") as string | null) ?? undefined;
    const photoUrl = (formData.get("photoUrl") as string | null) ?? undefined;
    const feeRaw = formData.get("consultationFee") as string | null;
    const degreesRaw = formData.get("degrees") as string | null;
    const languagesRaw = formData.get("languages") as string | null;

    const degrees = degreesRaw
      ? degreesRaw
          .split(/[,\n]+/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const languages = languagesRaw
      ? languagesRaw
          .split(/[,\n]+/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const consultationFee = feeRaw ? new Prisma.Decimal(feeRaw) : undefined;

    const doctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        bio: bio ?? null,
        photoUrl: photoUrl && photoUrl.trim() ? photoUrl.trim() : null,
        consultationFee,
        degrees,
        languages,
      },
      select: { slug: true },
    });

    revalidatePath("/doctors");
    revalidatePath(`/doctors/${doctor.slug}`);

    return { ok: true, slug: doctor.slug };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return { ok: false, error: message };
  }
}
