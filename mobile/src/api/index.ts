import { apiFetch, ApiError } from "./config";
import type {
  DoctorDetail,
  DoctorsListResponse,
  FacilityDetail,
  FacilitiesListResponse,
  FiltersResponse,
  HomePayload,
} from "@/types/dto";
import {
  parseDoctorDetail,
  parseDoctorsListResponse,
  parseFacilitiesListResponse,
  parseFacilityDetail,
  parseFilters,
} from "@/utils/dto";
import { fixtures } from "@/data/fixtures";

type ListParams = { q?: string; specialty?: string; area?: string; type?: string };

// --- Fixture source tracking (minimum change) ---
let _lastFixtureSource: string | null = null;

/** Read the fixture source flag. Returns null when live API data was used. */
export function getFixtureSource(): string | null {
  return _lastFixtureSource;
}

function shouldUseFixture(): boolean {
  return (
    __DEV__ &&
    (!process.env.EXPO_PUBLIC_API_URL ||
      process.env.EXPO_PUBLIC_API_URL.includes("localhost"))
  );
}

async function withFallback<T>(
  live: () => Promise<T>,
  fallback: T | (() => T),
): Promise<T> {
  try {
    const result = await live();
    _lastFixtureSource = null;
    return result;
  } catch (err) {
    if (shouldUseFixture()) {
      console.warn(
        "[HealthCapsule] using offline fixture:",
        (err as Error).message,
      );
      _lastFixtureSource = fixtures.banner;
      return typeof fallback === "function" ? (fallback as () => T)() : fallback;
    }
    throw err;
  }
}

async function fetchAndParse<T>(
  path: string,
  parse: (raw: unknown) => T,
  fallback: T,
): Promise<T> {
  return withFallback(async () => parse(await apiFetch<unknown>(path)), fallback);
}

async function fetchAndParseDetail<T>(
  path: string,
  parse: (raw: unknown) => T | null,
  fallback: T | null,
): Promise<T> {
  return withFallback(async () => {
    const parsed = parse(await apiFetch<unknown>(path));
    if (parsed === null || parsed === undefined) {
      throw new ApiError("Malformed response", 0, "PARSE");
    }
    return parsed;
  }, () => {
    if (fallback === null) {
      throw new ApiError("Not found", 404, "NOT_FOUND");
    }
    return fallback;
  });
}

export function getFilters(): Promise<FiltersResponse> {
  return fetchAndParse<FiltersResponse>(
    "/api/v1/public/filters",
    parseFilters,
    parseFilters(fixtures.filters),
  );
}

export function listDoctors(
  params: ListParams = {},
): Promise<DoctorsListResponse> {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.specialty) qs.set("specialty", params.specialty);
  if (params.area) qs.set("area", params.area);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  const fallback: DoctorsListResponse = {
    results: applyDoctorClientFilters(fixtures.doctors, params),
    total: applyDoctorClientFilters(fixtures.doctors, params).length,
  };
  return fetchAndParse<DoctorsListResponse>(
    `/api/v1/public/doctors${suffix}`,
    parseDoctorsListResponse,
    fallback,
  );
}

function applyDoctorClientFilters(
  list: typeof fixtures.doctors,
  params: ListParams,
) {
  const q = params.q?.toLowerCase().trim();
  const specialty = params.specialty?.toLowerCase().trim();
  const area = params.area?.toLowerCase().trim();
  return list.filter((d) => {
    if (
      q &&
      !(
        d.name.toLowerCase().includes(q) ||
        d.degrees.some((deg) => deg.toLowerCase().includes(q))
      )
    ) {
      return false;
    }
    if (specialty && !d.specialties.some((s) => s.slug.toLowerCase() === specialty)) {
      return false;
    }
    if (
      area &&
      !d.chambers.some(
        (c) => c.area && c.area.name.toLowerCase() === area,
      )
    ) {
      return false;
    }
    return true;
  });
}

function applyFacilityClientFilters(
  list: typeof fixtures.facilities,
  params: ListParams,
) {
  const q = params.q?.toLowerCase().trim();
  const area = params.area?.toLowerCase().trim();
  const type = params.type?.toUpperCase().trim();
  return list.filter((f) => {
    if (q && !f.name.toLowerCase().includes(q)) return false;
    if (type && f.type.toUpperCase() !== type) return false;
    if (area && !(f.area && f.area.name.toLowerCase() === area)) return false;
    return true;
  });
}

export async function getHome(): Promise<HomePayload> {
  // Client-side composite: fetch doctors and diagnostic centres, shape to DTO.
  const doctors = await listDoctors({});
  const facilities = await listFacilities({ type: "DIAGNOSTIC_CENTER" });
  const verifiedDoctors = doctors.results.filter((d) => d.flags.verified);
  return {
    context: {
      city: "Chattogram",
      country: "Bangladesh",
      note: "",
    },
    suggestedFacilities: facilities.results.filter((f) => f.flags.suggested).slice(0, 6),
    nearbyFacilities: facilities.results.slice(0, 6),
    suggestedDoctors: doctors.results.filter((d) => d.flags.suggested).slice(0, 6),
    newlyAvailableDoctors: doctors.results.filter((d) => d.flags.new).slice(0, 6),
    recentlyVerifiedDoctors: verifiedDoctors.slice(0, 4),
  };
}

export function getDoctor(slug: string): Promise<DoctorDetail> {
  const fallback = parseDoctorDetail(fixtures.doctorDetail(slug));
  return fetchAndParseDetail<DoctorDetail>(
    `/api/v1/public/doctors/${encodeURIComponent(slug)}`,
    parseDoctorDetail,
    fallback,
  );
}

export function listFacilities(
  params: ListParams = {},
): Promise<FacilitiesListResponse> {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.type) qs.set("type", params.type);
  if (params.area) qs.set("area", params.area);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  const filtered = applyFacilityClientFilters(fixtures.facilities, params);
  const fallback: FacilitiesListResponse = {
    results: filtered,
    total: filtered.length,
  };
  return fetchAndParse<FacilitiesListResponse>(
    `/api/v1/public/facilities${suffix}`,
    parseFacilitiesListResponse,
    fallback,
  );
}

export function getFacility(slug: string): Promise<FacilityDetail> {
  const fallback = parseFacilityDetail(fixtures.facilityDetail(slug));
  return fetchAndParseDetail<FacilityDetail>(
    `/api/v1/public/facilities/${encodeURIComponent(slug)}`,
    parseFacilityDetail,
    fallback,
  );
}

export { ApiError };
