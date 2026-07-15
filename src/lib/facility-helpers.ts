import type { FacilityType, ListingTier } from "@prisma/client";

export function parseFacilityType(raw: string | undefined): FacilityType | undefined {
  if (!raw) return undefined;
  const upper = raw.toUpperCase();
  if (["HOSPITAL", "DIAGNOSTIC_CENTER", "CLINIC"].includes(upper)) {
    return upper as FacilityType;
  }
  return undefined;
}

export function getFacilityTypeLabel(type: FacilityType): string {
  const labels: Record<FacilityType, string> = {
    HOSPITAL: "Hospital",
    DIAGNOSTIC_CENTER: "Diagnostic Center",
    CLINIC: "Clinic",
  };
  return labels[type];
}

export function isFeaturedFacility(listingTier: ListingTier): boolean {
  return listingTier === "FEATURED";
}
