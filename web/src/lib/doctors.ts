import { prisma } from "@/lib/prisma";
import { Prisma, VerificationStatus, ListingTier } from "@prisma/client";

export type SearchDoctorsParams = {
  specialty?: string;
  area?: string;
  q?: string;
  page?: number;
  pageSize?: number;
  minRating?: number;
  maxFee?: number;
  day?: number;
  online?: boolean;
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
  rating: number | null;
  totalReviews: number | null;
  hasOnlineConsultation: boolean;
  specialties: { specialty: { name: string; slug: string } }[];
  chambers: {
    area: { name: string; slug: string } | null;
    schedules: { dayOfWeek: number; startTime: string; endTime: string }[];
  }[];
};

export async function searchDoctors(
  params: SearchDoctorsParams
): Promise<{ items: DoctorListItem[]; total: number; page: number; pageSize: number }> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ?? 24;

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

  if (params.area || params.day !== undefined) {
    const chambersSome: Prisma.ChamberWhereInput = {};
    if (params.area) {
      chambersSome.area = { slug: params.area };
    }
    if (params.day !== undefined) {
      chambersSome.deletedAt = null;
      chambersSome.isActive = true;
      chambersSome.schedules = {
        some: {
          deletedAt: null,
          isActive: true,
          dayOfWeek: params.day,
        },
      };
    }
    where.chambers = { some: chambersSome };
  }

  if (params.minRating !== undefined) {
    where.rating = { gte: params.minRating };
  }

  if (params.maxFee !== undefined) {
    where.consultationFee = { lte: params.maxFee };
  }

  if (params.online) {
    where.hasOnlineConsultation = true;
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

  const [total, doctors] = await Promise.all([
    prisma.doctor.count({ where }),
    prisma.doctor.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        specialties: {
          include: { specialty: { select: { name: true, slug: true } } },
        },
        chambers: {
          where: { deletedAt: null, isActive: true },
          include: {
            area: { select: { name: true, slug: true } },
            schedules: {
              where: { deletedAt: null, isActive: true },
              select: { dayOfWeek: true, startTime: true, endTime: true },
              orderBy: { dayOfWeek: "asc" },
            },
          },
        },
      },
      orderBy: [
        { listingTier: "desc" },
        { createdAt: "desc" },
      ],
    }),
  ]);

  const items = doctors.map((d) => ({
    id: d.id,
    name: d.name,
    slug: d.slug,
    photoUrl: d.photoUrl,
    degrees: d.degrees,
    yearsExperience: d.yearsExperience,
    consultationFee: d.consultationFee?.toString() ?? null,
    registrationYear: d.registrationYear,
    listingTier: d.listingTier,
    rating: d.rating,
    totalReviews: d.totalReviews,
    hasOnlineConsultation: d.hasOnlineConsultation,
    specialties: d.specialties,
    chambers: d.chambers,
  }));

  return { items, total, page, pageSize };
}

export function formatScheduleSummary(
  schedules: { dayOfWeek: number; startTime: string; endTime: string }[]
): string | null {
  if (!schedules || schedules.length === 0) return null;

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const uniqueDays = Array.from(
    new Set(
      schedules
        .map((s) => s.dayOfWeek)
        .filter((d) => typeof d === "number" && d >= 0 && d <= 6)
    )
  ).sort((a, b) => a - b);

  const dayPart =
    uniqueDays.length > 0
      ? uniqueDays.map((d) => dayNames[d]).join(", ")
      : null;

  function parseTime(timeStr: string) {
    if (!timeStr) return null;
    const parts = timeStr.split(":");
    if (parts.length < 2) return null;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return null;
    const meridiem = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    const display = m > 0 ? `${hour12}:${parts[1].padStart(2, "0")}` : `${hour12}`;
    return { h, m, hour12, meridiem, display, totalMinutes: h * 60 + m };
  }

  const validStartTimes = schedules
    .map((s) => parseTime(s.startTime))
    .filter((t): t is NonNullable<ReturnType<typeof parseTime>> => t !== null);

  const validEndTimes = schedules
    .map((s) => parseTime(s.endTime))
    .filter((t): t is NonNullable<ReturnType<typeof parseTime>> => t !== null);

  let timePart: string | null = null;

  if (validStartTimes.length > 0 && validEndTimes.length > 0) {
    const minStart = [...validStartTimes].sort(
      (a, b) => a.totalMinutes - b.totalMinutes
    )[0];
    const maxEnd = [...validEndTimes].sort(
      (a, b) => b.totalMinutes - a.totalMinutes
    )[0];

    if (minStart.meridiem === maxEnd.meridiem) {
      if (minStart.display === maxEnd.display) {
        timePart = `${minStart.display} ${minStart.meridiem}`;
      } else {
        timePart = `${minStart.display}–${maxEnd.display} ${maxEnd.meridiem}`;
      }
    } else {
      timePart = `${minStart.display} ${minStart.meridiem}–${maxEnd.display} ${maxEnd.meridiem}`;
    }
  }

  if (!dayPart && !timePart) return null;
  if (dayPart && timePart) return `${dayPart} · ${timePart}`;
  return dayPart ?? timePart;
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
