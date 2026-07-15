import "dotenv/config";

import { Prisma, UserRole, VerificationStatus, ListingTier, FacilityType } from "@prisma/client";
import { hashSync } from "bcryptjs";
import { readFileSync } from "fs";
import { resolve } from "path";
import { prisma } from "@/lib/prisma";

const SEED_DATA_DIR = resolve(__dirname, "seed-data");

function loadJson<T>(name: string): T {
  return JSON.parse(readFileSync(resolve(SEED_DATA_DIR, `${name}.json`), "utf-8")) as T;
}

// ========================= Types from JSON =========================

type RawGeographyId = string | number;

type RawDivision = {
  id: RawGeographyId;
  name: string;
  bn_name?: string;
  pcode: string;
  latitude?: number;
  longitude?: number;
};

type RawDistrict = {
  id: RawGeographyId;
  division_id: RawGeographyId;
  name: string;
  bn_name?: string;
  pcode?: string;
  area_sqkm?: number | null;
  latitude?: number | null;
  longitude?: number | null;
};

type RawThana = {
  id: RawGeographyId;
  district_id: RawGeographyId;
  name: string;
  bn_name?: string;
  pcode?: string;
  type: string;
  area_sqkm?: number | null;
  latitude?: number | null;
  longitude?: number | null;
};

type RawArea = {
  id: RawGeographyId;
  thana_id: RawGeographyId;
  name: string;
  bn_name?: string;
  slug: string;
  type: string;
  latitude?: number | null;
  longitude?: number | null;
};

type RawAreaAlias = {
  id: RawGeographyId;
  area_id: RawGeographyId;
  alias: string;
  lang?: string;
};

type RawSchedule = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes?: number;
  maxPatients?: number;
};

type RawChamber = {
  address?: string | null;
  fee?: number | null;
  areaId?: string | null;
  areaName?: string | null;
  areaSlug?: string | null;
  facilitySlug?: string | null;
  schedules: RawSchedule[];
};

type RawDoctor = {
  name: string;
  bnName?: string | null;
  slug: string;
  bio?: string | null;
  photoUrl?: string | null;
  degrees: string[];
  bmdcRegNo?: string | null;
  registrationYear?: number | null;
  yearsExperience?: number | null;
  languages?: string[];
  gender?: string | null;
  consultationFee?: number | null;
  verificationStatus: VerificationStatus;
  listingTier?: ListingTier;
  specialtySlugs: string[];
  chambers: RawChamber[];
  isActive?: boolean;
  deletedAt?: string | null;
};

type RawFacilityService = {
  name: string;
  price?: number | string | null;
  isFeatured?: boolean;
};

type RawFacilityDepartment = {
  name: string;
  description?: string | null;
};

type RawFacilityImage = {
  url: string;
  alt?: string | null;
  sortOrder?: number;
};

type RawFacility = {
  name: string;
  slug: string;
  type: FacilityType;
  description?: string | null;
  longDescription?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  areaId: string;
  areaSlug?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  beds?: number | null;
  hasIcu?: boolean;
  hasNicu?: boolean;
  hasEmergency?: boolean;
  hasAmbulance?: boolean;
  establishedYear?: number | null;
  verificationStatus: VerificationStatus;
  listingTier?: ListingTier;
  departments?: RawFacilityDepartment[];
  services?: RawFacilityService[];
  gallery?: RawFacilityImage[];
  isActive?: boolean;
  deletedAt?: string | null;
};

// ========================= Geography =========================

function normalizeThanaType(raw: string): "UPAZILA" | "METROPOLITAN_THANA" {
  return raw === "METROPOLITAN" ? "METROPOLITAN_THANA" : "UPAZILA";
}

function normalizeAreaType(raw: string): "NEIGHBOURHOOD" | "LANDMARK" | "ROAD" {
  return raw === "ZONE" ? "NEIGHBOURHOOD" : (raw as "NEIGHBOURHOOD" | "LANDMARK" | "ROAD");
}

async function seedGeography() {
  const divisions = loadJson<RawDivision[]>("divisions");
  const districts = loadJson<RawDistrict[]>("districts");
  const thanas = loadJson<RawThana[]>("thanas");
  const areas = loadJson<RawArea[]>("areas");
  const aliases = loadJson<RawAreaAlias[]>("area_aliases");

  await prisma.division.createMany({
    data: divisions.map((d) => ({
      id: String(d.id),
      name: d.name,
      bnName: d.bn_name ?? null,
      pcode: d.pcode ?? null,
      latitude: d.latitude ?? null,
      longitude: d.longitude ?? null,
    })),
    skipDuplicates: true,
  });

  await prisma.district.createMany({
    data: districts.map((d) => ({
      id: String(d.id),
      divisionId: String(d.division_id),
      name: d.name,
      bnName: d.bn_name ?? null,
      pcode: d.pcode ?? null,
      areaSqkm: d.area_sqkm ?? null,
      latitude: d.latitude ?? null,
      longitude: d.longitude ?? null,
    })),
    skipDuplicates: true,
  });

  await prisma.thana.createMany({
    data: thanas.map((t) => ({
      id: String(t.id),
      districtId: String(t.district_id),
      name: t.name,
      bnName: t.bn_name ?? null,
      pcode: t.pcode ?? null,
      type: normalizeThanaType(t.type),
      areaSqkm: t.area_sqkm ?? null,
      latitude: t.latitude ?? null,
      longitude: t.longitude ?? null,
    })),
    skipDuplicates: true,
  });

  await prisma.area.createMany({
    data: areas.map((a) => ({
      id: String(a.id),
      thanaId: String(a.thana_id),
      name: a.name,
      bnName: a.bn_name ?? null,
      slug: a.slug,
      type: normalizeAreaType(a.type),
      latitude: a.latitude ?? null,
      longitude: a.longitude ?? null,
    })),
    skipDuplicates: true,
  });

  await prisma.areaAlias.createMany({
    data: aliases.map((a) => ({
      id: String(a.id),
      areaId: String(a.area_id),
      alias: a.alias,
      lang: a.lang ?? "en",
    })),
    skipDuplicates: true,
  });

  console.log(
    `Seeded ${divisions.length} divisions, ${districts.length} districts, ${thanas.length} thanas, ${areas.length} areas, ${aliases.length} aliases.`
  );
}

// ========================= Users =========================

async function ensureAdminUser() {
  const passwordHash = hashSync("password123", 10);
  const admin = await prisma.user.upsert({
    where: { phone: "01800000000" },
    update: {},
    create: {
      phone: "01800000000",
      passwordHash,
      role: UserRole.ADMIN,
    },
  });
  return admin;
}

// ========================= Specialties =========================

async function seedSpecialties(doctors: RawDoctor[], facilities: RawFacility[]) {
  const specialtySlugs = new Set<string>();

  doctors.forEach((d) => d.specialtySlugs.forEach((s) => specialtySlugs.add(s)));
  facilities.forEach((f) =>
    (f.departments ?? []).forEach((dept) => {
      // Derive a clean slug from department names when useful
      const slug = dept.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .replace(/--+/g, "-");
      if (slug && slug.length < 40) specialtySlugs.add(slug);
    })
  );

  const specialties = [...specialtySlugs].map((slug) => ({
    name: slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    bnName: null as string | null,
    slug,
    icon: null as string | null,
    isPopular: false,
  }));

  await prisma.specialty.createMany({
    data: specialties,
    skipDuplicates: true,
  });

  console.log(`Seeded ${specialties.length} specialties.`);
  return new Map(specialties.map((s) => [s.slug, s]));
}

// ========================= Facilities =========================

async function seedFacilities(
  facilities: RawFacility[],
  areaMap: Map<string, string>,
  passwordHash: string
) {
  const facilityIdMap = new Map<string, string>();

  for (const data of facilities) {
    const existing = await prisma.facility.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    });

    if (existing) {
      facilityIdMap.set(data.slug, existing.id);
      continue;
    }

    // Create a facility admin user for each facility
    const adminUser = await prisma.user.create({
      data: {
        phone: `018${String(Math.floor(10000000 + Math.random() * 89999999))}`,
        passwordHash,
        role: UserRole.FACILITY_ADMIN,
      },
    });

    const facility = await prisma.facility.create({
      data: {
        name: data.name,
        slug: data.slug,
        type: data.type,
        adminId: adminUser.id,
        description: data.description ?? null,
        longDescription: data.longDescription ?? null,
        logoUrl: data.logoUrl ?? null,
        coverImageUrl: data.coverImageUrl ?? null,
        areaId: areaMap.get(String(data.areaId)) ?? String(data.areaId),
        address: data.address ?? null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        phone: data.phone ?? null,
        email: data.email ?? null,
        website: data.website ?? null,
        beds: data.beds ?? null,
        hasIcu: data.hasIcu ?? false,
        hasNicu: data.hasNicu ?? false,
        hasEmergency: data.hasEmergency ?? false,
        hasAmbulance: data.hasAmbulance ?? false,
        establishedYear: data.establishedYear ?? null,
        verificationStatus: data.verificationStatus,
        listingTier: data.listingTier ?? ListingTier.FREE,
        isActive: data.isActive ?? true,
        deletedAt: data.deletedAt ? new Date(data.deletedAt) : null,
        departments: {
          create: (data.departments ?? []).map((d) => ({
            name: d.name,
            description: d.description ?? null,
          })),
        },
        services: {
          create: (data.services ?? []).map((s) => ({
            name: s.name,
            price: s.price != null ? new Prisma.Decimal(String(s.price)) : null,
            isFeatured: s.isFeatured ?? false,
          })),
        },
        gallery: {
          create: (data.gallery ?? []).map((img, index) => ({
            url: img.url,
            alt: img.alt ?? null,
            sortOrder: img.sortOrder ?? index,
          })),
        },
      },
    });

    facilityIdMap.set(data.slug, facility.id);
  }

  console.log(`Seeded ${facilities.length} facilities.`);
  return facilityIdMap;
}

// ========================= Doctors =========================

async function seedDoctors(
  doctors: RawDoctor[],
  areaMap: Map<string, string>,
  facilityIdMap: Map<string, string>,
  specialtyMap: Map<string, { name: string; slug: string }>,
  passwordHash: string
) {
  for (const data of doctors) {
    const existing = await prisma.doctor.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    });

    if (existing) {
      console.log(`Doctor ${data.slug} already exists; skipping.`);
      continue;
    }

    // Create a doctor user for each doctor
    const doctorUser = await prisma.user.create({
      data: {
        phone: `017${String(Math.floor(10000000 + Math.random() * 89999999))}`,
        passwordHash,
        role: UserRole.DOCTOR,
      },
    });

    const specialtyIds = data.specialtySlugs
      .map((slug) => specialtyMap.get(slug)?.slug)
      .filter((slug): slug is string => Boolean(slug));

    const specialtyRecords = await prisma.specialty.findMany({
      where: { slug: { in: specialtyIds } },
      select: { id: true, slug: true },
    });

    const doctor = await prisma.doctor.create({
      data: {
        name: data.name,
        bnName: data.bnName ?? null,
        slug: data.slug,
        bio: data.bio ?? null,
        photoUrl: data.photoUrl ?? null,
        degrees: data.degrees,
        bmdcRegNo: data.bmdcRegNo ?? null,
        registrationYear: data.registrationYear ?? null,
        yearsExperience: data.yearsExperience ?? null,
        languages: data.languages ?? ["Bengali", "English"],
        gender: data.gender ?? null,
        consultationFee:
          data.consultationFee != null
            ? new Prisma.Decimal(String(data.consultationFee))
            : null,
        verificationStatus: data.verificationStatus,
        listingTier: data.listingTier ?? ListingTier.FREE,
        userId: doctorUser.id,
        isActive: data.isActive ?? true,
        deletedAt: data.deletedAt ? new Date(data.deletedAt) : null,
        specialties: {
          create: specialtyRecords.map((s) => ({ specialtyId: s.id })),
        },
        chambers: {
          create: data.chambers.map((chamber) => ({
            address: chamber.address ?? null,
            consultationFee:
              chamber.fee != null
                ? new Prisma.Decimal(String(chamber.fee))
                : data.consultationFee != null
                  ? new Prisma.Decimal(String(data.consultationFee))
                  : null,
            areaId: chamber.areaId ? areaMap.get(String(chamber.areaId)) ?? String(chamber.areaId) : null,
            facilityId: chamber.facilitySlug
              ? facilityIdMap.get(chamber.facilitySlug) ?? null
              : null,
            schedules: {
              create: (chamber.schedules ?? []).map((schedule) => ({
                dayOfWeek: schedule.dayOfWeek,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                slotDurationMinutes: schedule.slotDurationMinutes ?? 15,
                maxPatients: schedule.maxPatients ?? 20,
              })),
            },
          })),
        },
      },
    });

    console.log(`Seeded doctor: ${doctor.name}`);
  }

  console.log(`Seeded ${doctors.length} doctors.`);
}

// ========================= Main =========================

async function main() {
  const doctors = loadJson<RawDoctor[]>("doctors");
  const facilities = loadJson<RawFacility[]>("facilities");

  console.log("Seeding geography...");
  await seedGeography();

  console.log("Seeding admin user...");
  await ensureAdminUser();

  console.log("Building area map...");
  const areas = await prisma.area.findMany({ select: { id: true, slug: true } });
  const areaMap = new Map<string, string>();
  areas.forEach((a) => {
    areaMap.set(a.id, a.id);
    areaMap.set(a.slug, a.id);
    areaMap.set(String(a.id), a.id);
  });

  console.log("Seeding specialties...");
  const specialtyMap = await seedSpecialties(doctors, facilities);

  const passwordHash = hashSync("password123", 10);

  console.log("Seeding facilities...");
  const facilityIdMap = await seedFacilities(facilities, areaMap, passwordHash);

  console.log("Seeding doctors, chambers, and schedules...");
  await seedDoctors(doctors, areaMap, facilityIdMap, specialtyMap, passwordHash);

  console.log("Seed complete.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
