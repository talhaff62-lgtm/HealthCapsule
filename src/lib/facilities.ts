import { prisma } from "@/lib/prisma";
import { Prisma, VerificationStatus, ListingTier, FacilityType } from "@prisma/client";
import { parseFacilityType } from "./facility-helpers";

export type SearchFacilitiesParams = {
  type?: string;
  area?: string;
  q?: string;
};

export type FacilityListItem = {
  id: string;
  name: string;
  slug: string;
  type: FacilityType;
  phone: string | null;
  address: string | null;
  area: { name: string } | null;
  listingTier: ListingTier;
  description: string | null;
  coverImageUrl: string | null;
  beds: number | null;
  establishedYear: number | null;
  hasIcu: boolean;
  hasEmergency: boolean;
  hasAmbulance: boolean;
  website: string | null;
};

export async function searchFacilities(
  params: SearchFacilitiesParams
): Promise<FacilityListItem[]> {
  const where: Prisma.FacilityWhereInput = {
    verificationStatus: VerificationStatus.VERIFIED,
    deletedAt: null,
    isActive: true,
  };

  const facilityType = parseFacilityType(params.type);
  if (facilityType) {
    where.type = facilityType;
  }

  if (params.area) {
    where.area = { slug: params.area };
  }

  if (params.q) {
    const term = params.q.trim();
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { address: { contains: term, mode: "insensitive" } },
    ];
  }

  const facilities = await prisma.facility.findMany({
    where,
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      phone: true,
      address: true,
      area: { select: { name: true } },
      listingTier: true,
      description: true,
      coverImageUrl: true,
      beds: true,
      establishedYear: true,
      hasIcu: true,
      hasEmergency: true,
      hasAmbulance: true,
      website: true,
    },
    orderBy: [{ listingTier: "desc" }, { createdAt: "desc" }],
  });

  return facilities;
}

export { parseFacilityType } from "./facility-helpers";
