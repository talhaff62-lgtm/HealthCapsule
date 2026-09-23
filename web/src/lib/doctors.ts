import { prisma } from "@/lib/prisma";
import { Prisma, VerificationStatus, ListingTier } from "@prisma/client";

export type SearchDoctorsParams = {
  specialty?: string;
  area?: string;
  q?: string;
};

export type DoctorListItem = {
  id: string;
  name: string;
  slug: string;
  photoUrl: string | null;
  degrees: string[];
  yearsExperience: number | null;
  consultationFee: string | null;
  registrationYear: number | null;
  listingTier: ListingTier;
  specialties: { specialty: { name: string; slug: string } }[];
  chambers: { area: { name: string; slug: string } | null }[];
};

export async function searchDoctors(
  params: SearchDoctorsParams
): Promise<DoctorListItem[]> {
  const where: Prisma.DoctorWhereInput = {
    verificationStatus: VerificationStatus.VERIFIED,
    deletedAt: null,
    isActive: true,
  };

  if (params.specialty) {
    where.specialties = {
      some: {
        specialty: { slug: params.specialty },
      },
    };
  }

  if (params.area) {
    where.chambers = {
      some: {
        area: { slug: params.area },
      },
    };
  }

  if (params.q) {
    const term = params.q.trim();
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { degrees: { has: term } },
      {
        specialties: {
          some: {
            specialty: { name: { contains: term, mode: "insensitive" } },
          },
        },
      },
    ];
  }

  const doctors = await prisma.doctor.findMany({
    where,
    include: {
      specialties: {
        include: { specialty: { select: { name: true, slug: true } } },
      },
      chambers: {
        where: { deletedAt: null, isActive: true },
        include: { area: { select: { name: true, slug: true } } },
      },
    },
    orderBy: [
      { listingTier: "desc" },
      { createdAt: "desc" },
    ],
  });

  return doctors.map((d) => ({
    id: d.id,
    name: d.name,
    slug: d.slug,
    photoUrl: d.photoUrl,
    degrees: d.degrees,
    yearsExperience: d.yearsExperience,
    consultationFee: d.consultationFee?.toString() ?? null,
    registrationYear: d.registrationYear,
    listingTier: d.listingTier,
    specialties: d.specialties,
    chambers: d.chambers,
  }));
}

export function isFeaturedDoctor(listingTier: ListingTier): boolean {
  return listingTier === ListingTier.FEATURED;
}

export function isNewDoctor(registrationYear: number | null): boolean {
  if (!registrationYear) return false;
  const currentYear = new Date().getFullYear();
  return currentYear - registrationYear <= 1;
}

export const EXPERIENCED_YEARS_THRESHOLD = 10;

export function isExperiencedDoctor(
  yearsExperience: number | null
): boolean {
  return (
    yearsExperience !== null && yearsExperience >= EXPERIENCED_YEARS_THRESHOLD
  );
}

export function isEmergingDoctor(yearsExperience: number | null): boolean {
  return !isExperiencedDoctor(yearsExperience);
}

export function getNextAvailableSlot(
  schedules: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[]
): { day: string; time: string; date: Date; label: string } | null {
  if (schedules.length === 0) return null;

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const now = new Date();
  const today = now.getDay();
  const sorted = [...schedules].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  function slotDate(schedule: (typeof schedules)[number]): Date {
    let daysUntil = schedule.dayOfWeek - today;
    if (daysUntil < 0) daysUntil += 7;

    const [hourStr, minuteStr] = schedule.startTime.split(":");
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr || "0", 10);

    const candidate = new Date(now);
    candidate.setDate(now.getDate() + daysUntil);
    candidate.setHours(hour, minute, 0, 0);

    if (candidate.getTime() <= now.getTime()) {
      candidate.setDate(candidate.getDate() + 7);
    }

    return candidate;
  }

  const next = sorted
    .map((s) => ({ schedule: s, date: slotDate(s) }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0];

  const day = days[next.schedule.dayOfWeek];
  const time = `${next.schedule.startTime} - ${next.schedule.endTime}`;
  const label = `${day}, ${next.date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })} · ${time}`;

  return { day, time, date: next.date, label };
}
