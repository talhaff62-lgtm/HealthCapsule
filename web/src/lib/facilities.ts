import { prisma } from "@/lib/prisma";
import { Prisma, VerificationStatus, ListingTier, FacilityType } from "@prisma/client";
import { parseFacilityType } from "./facility-helpers";

export type SearchFacilitiesParams = {
  type?: string;
  area?: string;
  q?: string;
  page?: number;
  pageSize?: number;
  district?: string;
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
  rating: number | null;
  totalReviews: number | null;
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
): Promise<{ items: FacilityListItem[]; total: number; page: number; pageSize: number }> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ?? 24;

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

  if (params.district) {
    where.area = {
      ...(where.area as object || {}),
      thana: {
        district: { slug: params.district },
      },
    };
  }

  if (params.q) {
    const term = params.q.trim();
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { address: { contains: term, mode: "insensitive" } },
    ];
  }

  const [total, facilities] = await Promise.all([
    prisma.facility.count({ where }),
    prisma.facility.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        phone: true,
        address: true,
        area: { select: { name: true } },
        listingTier: true,
        rating: true,
        totalReviews: true,
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
    }),
  ]);

  return { items: facilities, total, page, pageSize };
}

export { parseFacilityType } from "./facility-helpers";
