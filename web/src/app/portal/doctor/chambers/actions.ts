"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { UserRole } from "@prisma/client";

export type ScheduleInput = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export type ChamberResult =
  | { ok: true; slug: string }
  | { ok: false; error: string };

function isValidSchedule(input: unknown): input is ScheduleInput {
  if (typeof input !== "object" || input === null) return false;
  const s = input as Record<string, unknown>;
  return (
    typeof s.dayOfWeek === "number" &&
    s.dayOfWeek >= 0 &&
    s.dayOfWeek <= 6 &&
    typeof s.startTime === "string" &&
    /^\d{2}:\d{2}$/.test(s.startTime) &&
    typeof s.endTime === "string" &&
    /^\d{2}:\d{2}$/.test(s.endTime)
  );
}

function parseSchedules(raw: unknown): ScheduleInput[] {
  if (!Array.isArray(raw)) throw new Error("Invalid schedules");
  if (!raw.every(isValidSchedule)) throw new Error("Invalid schedule data");
  return raw;
}

async function verifyDoctorOwnsChamber(doctorId: string, chamberId: string) {
  const chamber = await prisma.chamber.findUnique({
    where: { id: chamberId },
    select: { doctorId: true },
  });
  if (!chamber || chamber.doctorId !== doctorId) {
    throw new Error("Unauthorized");
  }
}

export async function createChamber(
  doctorId: string,
  data: {
    address: string;
    areaId?: string;
    consultationFee?: string;
    schedules: ScheduleInput[];
  }
): Promise<ChamberResult> {
  try {
    await requireRole(UserRole.DOCTOR);

    const schedules = parseSchedules(data.schedules);
    const fee = data.consultationFee ? new Prisma.Decimal(data.consultationFee) : null;

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { slug: true },
    });
    if (!doctor) return { ok: false, error: "Doctor not found" };

    await prisma.chamber.create({
      data: {
        doctorId,
        address: data.address.trim() || null,
        areaId: data.areaId || null,
        consultationFee: fee,
        schedules: {
          create: schedules,
        },
      },
    });

    revalidatePath("/doctors");
    revalidatePath(`/doctors/${doctor.slug}`);
    return { ok: true, slug: doctor.slug };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create chamber";
    return { ok: false, error: message };
  }
}

export async function updateChamber(
  doctorId: string,
  chamberId: string,
  data: {
    address: string;
    areaId?: string;
    consultationFee?: string;
    schedules: ScheduleInput[];
  }
): Promise<ChamberResult> {
  try {
    await requireRole(UserRole.DOCTOR);
    await verifyDoctorOwnsChamber(doctorId, chamberId);

    const schedules = parseSchedules(data.schedules);
    const fee = data.consultationFee ? new Prisma.Decimal(data.consultationFee) : null;

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { slug: true },
    });
    if (!doctor) return { ok: false, error: "Doctor not found" };

    await prisma.$transaction([
      prisma.schedule.deleteMany({ where: { chamberId } }),
      prisma.chamber.update({
        where: { id: chamberId },
        data: {
          address: data.address.trim() || null,
          areaId: data.areaId || null,
          consultationFee: fee,
          schedules: {
            create: schedules,
          },
        },
      }),
    ]);

    revalidatePath("/doctors");
    revalidatePath(`/doctors/${doctor.slug}`);
    return { ok: true, slug: doctor.slug };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update chamber";
    return { ok: false, error: message };
  }
}

export async function deleteChamber(
  doctorId: string,
  chamberId: string
): Promise<ChamberResult> {
  try {
    await requireRole(UserRole.DOCTOR);
    await verifyDoctorOwnsChamber(doctorId, chamberId);

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { slug: true },
    });
    if (!doctor) return { ok: false, error: "Doctor not found" };

    await prisma.chamber.update({
      where: { id: chamberId },
      data: { deletedAt: new Date() },
    });

    revalidatePath("/doctors");
    revalidatePath(`/doctors/${doctor.slug}`);
    return { ok: true, slug: doctor.slug };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete chamber";
    return { ok: false, error: message };
  }
}
