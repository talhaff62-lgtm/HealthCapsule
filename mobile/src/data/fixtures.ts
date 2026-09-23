import type {
  DoctorDetail,
  DoctorSummary,
  FacilityDetail,
  FacilitySummary,
  FiltersResponse,
  HomePayload,
} from "@/types/dto";

// Local fixtures used only when the API is unreachable in development.
// Shapes match the /api/v1/public/* response contracts.
// Marked with a clear banner; never sourced from production data.
const BANNER = "FIXTURE";

const doctors: DoctorSummary[] = [
  {
    id: "d1",
    slug: "asif-rahman",
    name: "Dr. Asif Rahman",
    degrees: ["MBBS", "FCPS (Medicine)"],
    currentPosition: "Consultant, Medicine",
    specialties: [
      { name: "Medicine", slug: "medicine" },
      { name: "Diabetes", slug: "diabetes" },
    ],
    chambers: [
      {
        id: "c1",
        address: "1st Floor, House 12, Road 2, Khulshi",
        area: { name: "Khulshi" },
        facility: { name: "Chevron Lab" },
        consultationFee: "800",
      },
    ],
    flags: { verified: true, suggested: true, new: false },
    contact: { phone: "+880317112233", whatsapp: "+8801711223344" },
  },
  {
    id: "d2",
    slug: "nadia-akter",
    name: "Dr. Nadia Akter",
    degrees: ["MBBS", "MCPS", "DDV"],
    currentPosition: null,
    specialties: [{ name: "Dermatology", slug: "dermatology" }],
    chambers: [
      {
        id: "c2",
        address: "Suite 4, Mehnaz Tower, Agrabad",
        area: { name: "Agrabad" },
        facility: { name: "Popular Diagnostic" },
        consultationFee: "700",
      },
    ],
    flags: { verified: true, suggested: false, new: false },
    contact: { phone: null, whatsapp: null },
  },
  {
    id: "d3",
    slug: "mahbub-hossain",
    name: "Dr. Mahbub Hossain",
    degrees: ["MBBS", "MS (Ortho)"],
    currentPosition: null,
    specialties: [{ name: "Orthopedics", slug: "orthopedics" }],
    chambers: [
      {
        id: "c3",
        address: "Ground Floor, M.A. Aziz Road",
        area: { name: "Chawkbazar" },
        facility: null,
        consultationFee: "1000",
      },
    ],
    flags: { verified: true, suggested: false, new: false },
    contact: { phone: null, whatsapp: null },
  },
  {
    id: "d4",
    slug: "sadia-tahsin",
    name: "Dr. Sadia Tahsin",
    degrees: ["MBBS", "FCPS (Gynae)"],
    currentPosition: null,
    specialties: [{ name: "Gynecology", slug: "gynecology" }],
    chambers: [
      {
        id: "c4",
        address: "2nd Floor, GEC Circle",
        area: { name: "GEC" },
        facility: { name: "Lab Aid" },
        consultationFee: "900",
      },
    ],
    flags: { verified: true, suggested: false, new: true },
    contact: { phone: null, whatsapp: null },
  },
  {
    id: "d5",
    slug: "imran-chowdhury",
    name: "Dr. Imran Chowdhury",
    degrees: ["MBBS", "MD (Cardiology)"],
    currentPosition: null,
    specialties: [{ name: "Cardiology", slug: "cardiology" }],
    chambers: [
      {
        id: "c5",
        address: "Block B, Halishahar",
        area: { name: "Halishahar" },
        facility: { name: "Medinova" },
        consultationFee: "1200",
      },
    ],
    flags: { verified: true, suggested: true, new: false },
    contact: { phone: "+880317112233", whatsapp: "+8801711223344" },
  },
];

const facilities: FacilitySummary[] = [
  {
    id: "f1",
    slug: "popular-diagnostic-agrabad",
    name: "Popular Diagnostic Centre — Agrabad",
    type: "DIAGNOSTIC_CENTER",
    area: { name: "Agrabad" },
    address: "20/B, Agrabad C/A",
    phone: "+880317112233",
    hasEmergency: true,
    flags: { verified: true, suggested: true, new: false },
    contact: { phone: "+880317112233", whatsapp: "+8801711223344" },
  },
  {
    id: "f2",
    slug: "chevron-lab",
    name: "Chevron Clinical Lab — Khulshi",
    type: "DIAGNOSTIC_CENTER",
    area: { name: "Khulshi" },
    address: "12/1, Road 2, Khulshi",
    phone: "+880317334455",
    hasEmergency: false,
    flags: { verified: true, suggested: false, new: false },
    contact: { phone: null, whatsapp: null },
  },
  {
    id: "f3",
    slug: "lab-aid",
    name: "Lab Aid — GEC",
    type: "DIAGNOSTIC_CENTER",
    area: { name: "GEC" },
    address: "GEC Circle",
    phone: "+880317556677",
    hasEmergency: false,
    flags: { verified: true, suggested: false, new: true },
    contact: { phone: null, whatsapp: null },
  },
];

const filters: FiltersResponse = {
  specialties: [
    { value: "medicine", label: "Medicine" },
    { value: "diabetes", label: "Diabetes" },
    { value: "dermatology", label: "Dermatology" },
    { value: "orthopedics", label: "Orthopedics" },
    { value: "gynecology", label: "Gynecology" },
    { value: "cardiology", label: "Cardiology" },
  ],
  areas: [
    { value: "khulshi", label: "Khulshi" },
    { value: "agrabad", label: "Agrabad" },
    { value: "chawkbazar", label: "Chawkbazar" },
    { value: "gec", label: "GEC" },
    { value: "halishahar", label: "Halishahar" },
  ],
};

const home: HomePayload = {
  context: {
    city: "Chattogram",
    country: "Bangladesh",
    note: "Verified registry for doctors and diagnostic centres serving Chattogram.",
  },
  suggestedFacilities: facilities.filter((f) => f.flags.suggested).slice(0, 6),
  nearbyFacilities: facilities.slice(0, 6),
  suggestedDoctors: doctors.filter((d) => d.flags.suggested).slice(0, 6),
  newlyAvailableDoctors: doctors.filter((d) => d.flags.new).slice(0, 6),
  recentlyVerifiedDoctors: doctors.slice(0, 4),
};

function findBySlug<T extends { slug: string }>(slug: string, list: T[]): T | undefined {
  return list.find((item) => item.slug === slug);
}

export const fixtures = {
  banner: BANNER,
  doctors,
  facilities,
  filters,
  home,
  doctorDetail(slug: string): DoctorDetail | null {
    const d = findBySlug(slug, doctors);
    if (!d) return null;
    return {
      ...d,
      achievements: null,
      chambers: d.chambers.map((c) => ({
        ...c,
        schedules: [
          { dayOfWeek: 0, startTime: "17:00", endTime: "21:00" },
          { dayOfWeek: 2, startTime: "17:00", endTime: "21:00" },
        ],
      })),
    };
  },
  facilityDetail(slug: string): FacilityDetail | null {
    const f = findBySlug(slug, facilities);
    if (!f) return null;
    return {
      ...f,
      email: null,
      website: null,
      beds: null,
      hasIcu: false,
      hasNicu: false,
      hasAmbulance: false,
      establishedYear: null,
      description: `${f.name} provides diagnostic services across Chattogram.`,
      discountInfo: null,
      amenities: [],
      services: [
        { name: "Blood Test", price: "800" },
        { name: "X-Ray", price: "600" },
      ],
    };
  },
};
