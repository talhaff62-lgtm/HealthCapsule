// Defensive parsing helpers for DTOs returned by the public API.
// Keeps fixtures honest and lets the UI render even with partial data.

import type {
  ChamberSummary,
  DoctorDetail,
  DoctorSummary,
  DoctorsListResponse,
  FacilityDetail,
  FacilitySummary,
  FacilitiesListResponse,
  FilterOption,
  FiltersResponse,
  HomePayload,
} from "@/types/dto";

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asStringOrNull(value: unknown): string | null {
  return typeof value === "string" && value ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asDayOfWeek(value: unknown): number {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 6) {
    return value;
  }
  const mapped: Record<string, number> = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
  };
  if (typeof value === "string" && mapped[value.toUpperCase()] !== undefined) {
    return mapped[value.toUpperCase()];
  }
  return 0;
}

export function parseChamber(raw: unknown): ChamberSummary | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const area = r.area as Record<string, unknown> | null | undefined;
  const facility = r.facility as Record<string, unknown> | null | undefined;
  return {
    id: typeof r.id === "string" ? r.id : undefined,
    address: (r.address as string | null | undefined) ?? null,
    area: area && asString(area.name) ? { name: asString(area.name) } : null,
    facility:
      facility && asString(facility.name)
        ? { name: asString(facility.name) }
        : null,
    consultationFee: (r.consultationFee as string | null | undefined) ?? null,
  };
}

export function parseDoctor(raw: unknown): DoctorSummary | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = asString(r.id);
  const slug = asString(r.slug);
  const name = asString(r.name);
  if (!id || !slug || !name) return null;
  const flags = (r.flags as Record<string, unknown> | undefined) ?? {};
  const contact = (r.contact as Record<string, unknown> | undefined) ?? {};
  const phoneTop = (r.phone as string | null | undefined) ?? null;
  const rawSpecialties = (r.specialties as unknown[] | undefined) ?? [];
  return {
    id,
    slug,
    name,
    photoUrl: asStringOrNull(r.photoUrl),
    degrees: Array.isArray(r.degrees)
      ? (r.degrees.filter((d) => typeof d === "string") as string[])
      : [],
    currentPosition: (r.currentPosition as string | null | undefined) ?? null,
    specialties: Array.isArray(rawSpecialties)
      ? rawSpecialties
          .map((s) => {
            if (!s || typeof s !== "object") return null;
            const rec = s as Record<string, unknown>;
            // Support both flat {name,slug} and nested {specialty:{name,slug}}
            const nested = rec.specialty as Record<string, unknown> | undefined;
            const name = asString(nested ? nested.name : rec.name);
            const slug = asString(nested ? nested.slug : rec.slug);
            return name && slug ? { name, slug } : null;
          })
          .filter((s): s is { name: string; slug: string } => s !== null)
      : [],
    chambers: Array.isArray(r.chambers)
      ? (r.chambers
          .map(parseChamber)
          .filter((c): c is ChamberSummary => c !== null))
      : [],
    flags: {
      verified: Boolean(flags.verified),
      suggested: Boolean(flags.suggested),
      new: Boolean(flags.new),
    },
    contact: {
      phone: (contact.phone as string | null | undefined) ?? phoneTop,
      whatsapp: (contact.whatsapp as string | null | undefined) ?? null,
    },
  };
}

export function parseDoctorDetail(raw: unknown): DoctorDetail | null {
  const summary = parseDoctor(raw);
  if (!summary) return null;
  const r = raw as Record<string, unknown>;
  const rawChambers = Array.isArray(r.chambers)
    ? (r.chambers as Record<string, unknown>[])
    : [];

  const chambers = rawChambers
    .map((rc) => {
      const parsed = parseChamber(rc);
      if (!parsed) return null;
      const schedules = Array.isArray(rc.schedules)
        ? (rc.schedules as Record<string, unknown>[])
            .map((s) => ({
              dayOfWeek: asDayOfWeek(s.dayOfWeek),
              startTime: asString(s.startTime),
              endTime: asString(s.endTime),
            }))
            .filter((s) => s.startTime && s.endTime)
        : [];
      return { ...parsed, schedules };
    })
    .filter((c): c is ChamberSummary & { schedules: { dayOfWeek: number; startTime: string; endTime: string }[] } => c !== null);

  return {
    ...summary,
    chambers,
    achievements: (r.achievements as string | null | undefined) ?? null,
  };
}

export function parseFacility(raw: unknown): FacilitySummary | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = asString(r.id);
  const slug = asString(r.slug);
  const name = asString(r.name);
  if (!id || !slug || !name) return null;
  const area = r.area as Record<string, unknown> | null | undefined;
  const flags = (r.flags as Record<string, unknown> | undefined) ?? {};
  const contact = (r.contact as Record<string, unknown> | undefined) ?? {};
  const phoneTop = (r.phone as string | null | undefined) ?? null;
  return {
    id,
    slug,
    name,
    type: asString(r.type, "DIAGNOSTIC_CENTER"),
    logoUrl: asStringOrNull(r.logoUrl),
    coverImageUrl: asStringOrNull(r.coverImageUrl),
    area: area && asString(area.name) ? { name: asString(area.name) } : null,
    address: (r.address as string | null | undefined) ?? null,
    phone: phoneTop,
    hasEmergency: Boolean(r.hasEmergency),
    flags: {
      verified: Boolean(flags.verified),
      suggested: Boolean(flags.suggested),
      new: Boolean(flags.new),
    },
    contact: {
      phone: (contact.phone as string | null | undefined) ?? phoneTop,
      whatsapp: (contact.whatsapp as string | null | undefined) ?? null,
    },
  };
}

export function parseFacilityDetail(raw: unknown): FacilityDetail | null {
  const summary = parseFacility(raw);
  if (!summary) return null;
  const r = raw as Record<string, unknown>;
  const rawAmenities = Array.isArray(r.amenities) ? (r.amenities as unknown[]) : [];
  return {
    ...summary,
    email: (r.email as string | null | undefined) ?? null,
    website: (r.website as string | null | undefined) ?? null,
    beds: r.beds != null ? String(r.beds) : null,
    hasIcu: Boolean(r.hasIcu),
    hasNicu: Boolean(r.hasNicu),
    hasAmbulance: Boolean(r.hasAmbulance),
    establishedYear: asNumber(r.establishedYear),
    description: (r.description as string | null | undefined) ?? null,
    discountInfo: (r.discountInfo as string | null | undefined) ?? null,
    amenities: rawAmenities
      .map((a) => {
        if (!a || typeof a !== "object") return null;
        const rec = a as Record<string, unknown>;
        const nested = rec.amenity as Record<string, unknown> | undefined;
        const name = asString(nested ? nested.name : rec.name);
        if (!name) return null;
        const iconRaw = nested ? nested.icon : rec.icon;
        return { name, icon: typeof iconRaw === "string" ? iconRaw : null };
      })
      .filter((a): a is { name: string; icon: string | null } => a !== null),
    services: Array.isArray(r.services)
      ? (r.services as Record<string, unknown>[])
          .map((s) => ({
            name: asString(s.name),
            price: s.price != null ? String(s.price) : null,
          }))
          .filter((s) => s.name)
      : [],
  };
}

function parseFilterOption(raw: unknown): FilterOption | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  // Support legacy {value,label} and new {id,name,slug} / {id,name}
  const value = asString(r.value) || asString(r.slug) || asString(r.id);
  const label = asString(r.label) || asString(r.name);
  if (!value || !label) return null;
  return { value, label };
}

export function parseFilters(raw: unknown): FiltersResponse {
  if (!raw || typeof raw !== "object") {
    return { specialties: [], areas: [] };
  }
  const r = raw as Record<string, unknown>;
  return {
    specialties: Array.isArray(r.specialties)
      ? (r.specialties
          .map(parseFilterOption)
          .filter((o): o is FilterOption => o !== null))
      : [],
    areas: Array.isArray(r.areas)
      ? (r.areas
          .map(parseFilterOption)
          .filter((o): o is FilterOption => o !== null))
      : [],
  };
}

function parseDoctorList(raw: unknown): DoctorSummary[] {
  // Accept both {results:[...]} envelope items and bare arrays from the API
  const list = Array.isArray(raw)
    ? raw
    : (raw as Record<string, unknown>)?.results;
  return Array.isArray(list)
    ? (list
        .map(parseDoctor)
        .filter((d): d is DoctorSummary => d !== null))
    : [];
}

function parseFacilityList(raw: unknown): FacilitySummary[] {
  const list = Array.isArray(raw)
    ? raw
    : (raw as Record<string, unknown>)?.results;
  return Array.isArray(list)
    ? (list
        .map(parseFacility)
        .filter((f): f is FacilitySummary => f !== null))
    : [];
}

export function parseDoctorsListResponse(raw: unknown): DoctorsListResponse {
  if (!raw) return { results: [], total: 0 };
  // The v1 public endpoints return a bare array; legacy shape has {results,total}
  if (Array.isArray(raw)) {
    const results = parseDoctorList(raw);
    return { results, total: results.length };
  }
  if (typeof raw !== "object") return { results: [], total: 0 };
  const r = raw as Record<string, unknown>;
  const results = parseDoctorList(r.results ?? r);
  const reportedTotal = asNumber(r.total);
  return { results, total: reportedTotal ?? results.length };
}

export function parseFacilitiesListResponse(raw: unknown): FacilitiesListResponse {
  if (!raw) return { results: [], total: 0 };
  if (Array.isArray(raw)) {
    const results = parseFacilityList(raw);
    return { results, total: results.length };
  }
  if (typeof raw !== "object") return { results: [], total: 0 };
  const r = raw as Record<string, unknown>;
  const results = parseFacilityList(r.results ?? r);
  const reportedTotal = asNumber(r.total);
  return { results, total: reportedTotal ?? results.length };
}

export function parseHomePayload(raw: unknown): HomePayload {
  const emptyContext = { city: "Chattogram", country: "Bangladesh", note: "" };
  if (!raw || typeof raw !== "object") {
    return {
      context: emptyContext,
      suggestedFacilities: [],
      nearbyFacilities: [],
      suggestedDoctors: [],
      newlyAvailableDoctors: [],
      recentlyVerifiedDoctors: [],
    };
  }
  const r = raw as Record<string, unknown>;
  const ctx = (r.context as Record<string, unknown> | undefined) ?? {};
  return {
    context: {
      city: asString(ctx.city, "Chattogram"),
      country: asString(ctx.country, "Bangladesh"),
      note: asString(ctx.note),
    },
    suggestedFacilities: parseFacilityList(r.suggestedFacilities),
    nearbyFacilities: parseFacilityList(r.nearbyFacilities),
    suggestedDoctors: parseDoctorList(r.suggestedDoctors),
    newlyAvailableDoctors: parseDoctorList(r.newlyAvailableDoctors),
    recentlyVerifiedDoctors: parseDoctorList(r.recentlyVerifiedDoctors),
  };
}
