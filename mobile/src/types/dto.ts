// Shared DTO shapes returned by the Next.js public API.
// Mirrors the public-facing subset of the Prisma models.

export type ListingTier = "FREE" | "VERIFIED" | "FEATURED" | "PREMIUM";
export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

export type AreaRef = { name: string };
export type SpecialtyRef = { name: string; slug: string };

export type ChamberSummary = {
  id?: string;
  address: string | null;
  area: AreaRef | null;
  facility: { name: string } | null;
  consultationFee: string | null;
};

export type DoctorSummary = {
  id: string;
  slug: string;
  name: string;
  photoUrl: string | null;
  degrees: string[];
  currentPosition: string | null;
  specialties: { name: string; slug: string }[];
  chambers: ChamberSummary[];
  flags: {
    verified: boolean;
    suggested: boolean;
    new: boolean;
  };
  contact: { phone: string | null; whatsapp: string | null };
};

export type DoctorDetail = Omit<DoctorSummary, "chambers"> & {
  achievements: string | null;
  chambers: (ChamberSummary & {
    schedules: { dayOfWeek: number; startTime: string; endTime: string }[];
  })[];
};

export type FacilitySummary = {
  id: string;
  slug: string;
  name: string;
  type: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  address: string | null;
  phone: string | null;
  hasEmergency: boolean;
  area: AreaRef | null;
  flags: {
    verified: boolean;
    suggested: boolean;
    new: boolean;
  };
  contact: { phone: string | null; whatsapp: string | null };
};

export type FacilityDetail = Omit<FacilitySummary, "contact"> & {
  email: string | null;
  website: string | null;
  beds: string | null;
  hasIcu: boolean;
  hasNicu: boolean;
  hasAmbulance: boolean;
  establishedYear: number | null;
  description: string | null;
  discountInfo: string | null;
  amenities: { name: string; icon: string | null }[];
  services: { name: string; price: string | null }[];
  contact: { phone: string | null; whatsapp: string | null };
};

export type FilterOption = { value: string; label: string };

export type HomePayload = {
  context: {
    city: string;
    country: string;
    note: string;
  };
  suggestedFacilities: FacilitySummary[];
  nearbyFacilities: FacilitySummary[];
  suggestedDoctors: DoctorSummary[];
  newlyAvailableDoctors: DoctorSummary[];
  recentlyVerifiedDoctors: DoctorSummary[];
};

export type DoctorsListResponse = {
  results: DoctorSummary[];
  total: number;
};

export type FacilitiesListResponse = {
  results: FacilitySummary[];
  total: number;
};

export type FiltersResponse = {
  specialties: FilterOption[];
  areas: FilterOption[];
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};
