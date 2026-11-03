// seed-real.ts — seeds REAL collected data (web/prisma/seed-data/real/<region>/)
// into any fresh or existing database. Non-destructive: upserts by slug, never
// deletes, never creates login accounts, never fabricates fees/schedules/phones.
// Regions are differentiated by the geography chain Area -> Thana -> District ->
// Division, which this seed ensures for every facility/chamber.
// Usage: npx tsx prisma/seed-real.ts [--dry-run]
import "dotenv/config";

import {
  AreaType,
  FacilityType,
  ListingTier,
  ThanaType,
  VerificationStatus,
} from "@prisma/client";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { join, resolve } from "path";
import { prisma } from "@/lib/prisma";

const SEED_REAL_DIR = resolve(__dirname, "seed-data", "real");
const DRY_RUN = process.argv.includes("--dry-run");

type RealFacility = {
  name: string;
  slug: string;
  bnName: string | null;
  type: FacilityType;
  description: string | null;
  longDescription: string | null;
  address: string | null;
  phone: string | null;
  mobile: string | null;
  emergencyPhone: string | null;
  email: string | null;
  website: string | null;
  openingHours: string | null;
  ownership: string | null;
  establishedYear: number | null;
  beds: number | null;
  icuBeds: number | null;
  nicuBeds: number | null;
  operationTheaters: number | null;
  hasIcu: boolean;
  hasNicu: boolean;
  hasEmergency: boolean;
  hasAmbulance: boolean;
  hasBloodBank: boolean;
  hasPharmacy: boolean;
  hasPathologyLab: boolean;
  hasHomeSampleCollection: boolean;
  hasOnlineReport: boolean;
  hasParkingAvailable: boolean;
  accreditation: string | null;
  insurancePanels: string[];
  diagnosticTests: string[];
  imagingServices: string[];
  amenities: string[];
  services: { name: string }[];
  departments: { name: string }[];
  region: { division: string; district: string; thana: string; area: string };
};

type RealDoctor = {
  name: string;
  slug: string;
  bio: string | null;
  degrees: string[];
  currentPosition: string | null;
  expertise: string | null;
  specialties: string[];
  chambers: { facilitySlug: string | null; address: string | null }[];
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9\u0980-\u09FF]+/g, "");
const kebab = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "area";

// canonical slugs + aliases from the base seed (seed.ts) so the two seed
// systems share areas instead of creating duplicates under different slugs
type SeedArea = { id: string; name: string; slug: string };
const SEED_DATA_DIR = resolve(__dirname, "seed-data");
const seedAreas: SeedArea[] = JSON.parse(readFileSync(join(SEED_DATA_DIR, "areas.json"), "utf-8"));
const seedAliases: { area_id: string; alias: string }[] = JSON.parse(
  readFileSync(join(SEED_DATA_DIR, "area_aliases.json"), "utf-8")
);
const canonicalSlugByName = new Map<string, string>();
seedAreas.forEach((a) => canonicalSlugByName.set(norm(a.name), a.slug));
const aliasToAreaNorm = new Map<string, string>();
seedAliases.forEach((al) => {
  const area = seedAreas.find((a) => String(a.id) === String(al.area_id));
  if (area) aliasToAreaNorm.set(norm(al.alias), norm(area.name));
});

function loadRegion(name: string) {
  const dir = join(SEED_REAL_DIR, name);
  const facilities = JSON.parse(readFileSync(join(dir, "facilities.json"), "utf-8")) as RealFacility[];
  const doctors = JSON.parse(readFileSync(join(dir, "doctors.json"), "utf-8")) as RealDoctor[];
  return { name, facilities, doctors };
}

// ========================= Geography =========================

const geoCache = {
  division: new Map<string, string>(), // name -> id
  district: new Map<string, string>(), // `${divisionName}|${name}` -> id
  thana: new Map<string, string>(), // `${districtId}|${name}` -> id
  area: new Map<string, string>(), // norm(name) -> id
  facilityArea: new Map<string, string>(), // facility slug -> area id
};

async function ensureDivision(name: string): Promise<string> {
  const hit = geoCache.division.get(name);
  if (hit) return hit;
  const existing = await prisma.division.findUnique({ where: { name } });
  if (existing) {
    geoCache.division.set(name, existing.id);
    return existing.id;
  }
  log(`  + division: ${name}`);
  const created = DRY_RUN
    ? null
    : await prisma.division.create({ data: { name }, select: { id: true } });
  const id = created?.id ?? `dry:${name}`;
  geoCache.division.set(name, id);
  return id;
}

async function ensureDistrict(divisionName: string, name: string): Promise<string> {
  const divisionId = await ensureDivision(divisionName);
  const key = `${divisionName}|${name}`;
  const hit = geoCache.district.get(key);
  if (hit) return hit;
  const existing = await prisma.district.findFirst({
    where: { divisionId, name },
    select: { id: true },
  });
  if (existing) {
    geoCache.district.set(key, existing.id);
    return existing.id;
  }
  log(`  + district: ${name} (${divisionName})`);
  const created = DRY_RUN
    ? null
    : await prisma.district.create({ data: { divisionId, name }, select: { id: true } });
  const id = created?.id ?? `dry:${key}`;
  geoCache.district.set(key, id);
  return id;
}

async function ensureThana(districtName: string, divisionName: string, name: string): Promise<string> {
  const districtId = await ensureDistrict(divisionName, districtName);
  const key = `${districtId}|${name}`;
  const hit = geoCache.thana.get(key);
  if (hit) return hit;
  const existing = await prisma.thana.findFirst({
    where: { districtId, name },
    select: { id: true },
  });
  if (existing) {
    geoCache.thana.set(key, existing.id);
    return existing.id;
  }
  log(`  + thana: ${name} (${districtName})`);
  const created = DRY_RUN
    ? null
    : await prisma.thana.create({
        data: {
          districtId,
          name,
          type: districtName === "Chattogram" ? ThanaType.METROPOLITAN_THANA : ThanaType.UPAZILA,
        },
        select: { id: true },
      });
  const id = created?.id ?? `dry:${key}`;
  geoCache.thana.set(key, id);
  return id;
}

async function ensureArea(
  areaName: string,
  thanaName: string,
  districtName: string,
  divisionName: string
): Promise<string> {
  const key = norm(areaName);
  const hit = geoCache.area.get(key);
  if (hit) return hit;

  const existing = await prisma.area.findFirst({
    where: {
      OR: [
        { slug: canonicalSlugByName.get(key) ?? kebab(areaName) },
        { name: { equals: areaName, mode: "insensitive" } },
      ],
    },
    select: { id: true },
  });
  if (existing) {
    geoCache.area.set(key, existing.id);
    return existing.id;
  }
  // record used an alias of a seeded area (e.g. "O. R. Nizam Road")
  const aliasNorm = aliasToAreaNorm.get(key);
  if (aliasNorm && aliasNorm !== key) {
    const viaAlias = await prisma.area.findFirst({
      where: {
        OR: [
          { slug: canonicalSlugByName.get(aliasNorm) ?? "" },
          { name: { equals: aliasNorm, mode: "insensitive" } },
        ],
      },
      select: { id: true },
    });
    if (viaAlias) {
      geoCache.area.set(key, viaAlias.id);
      return viaAlias.id;
    }
  }

  const thanaId = await ensureThana(districtName, divisionName, thanaName);
  let slug = canonicalSlugByName.get(key) ?? kebab(areaName);
  const slugTaken = await prisma.area.findUnique({ where: { slug }, select: { id: true } });
  if (slugTaken) slug = kebab(`${areaName} ${thanaName}`);
  log(`  + area: ${areaName} (${thanaName})`);
  const created = DRY_RUN
    ? null
    : await prisma.area.create({
        data: { thanaId, name: areaName, slug, type: AreaType.NEIGHBOURHOOD },
        select: { id: true },
      });
  const id = created?.id ?? `dry:${key}`;
  geoCache.area.set(key, id);
  return id;
}

// ========================= Specialties & amenities =========================

async function ensureSpecialties(doctors: RealDoctor[]): Promise<Map<string, string>> {
  const slugs = new Set<string>();
  doctors.forEach((d) =>
    d.specialties.forEach((name) => slugs.add(kebab(name)))
  );
  const map = new Map<string, string>();
  for (const slug of slugs) {
    const name = slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    const created = DRY_RUN
      ? null
      : await prisma.specialty.upsert({
          where: { slug },
          update: {},
          create: { name, slug, isPopular: false },
          select: { id: true },
        });
    map.set(slug, created?.id ?? `dry:${slug}`);
  }
  return map; // specialty slug -> id
}

async function ensureAmenities(names: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  for (const name of names) {
    const created = DRY_RUN
      ? null
      : await prisma.amenity.upsert({
          where: { name },
          update: {},
          create: { name },
          select: { id: true },
        });
    map.set(name, created?.id ?? `dry:${name}`);
  }
  return map;
}

// ========================= Facilities =========================

async function seedFacilities(
  facilities: RealFacility[],
  amenityMap: Map<string, string>
): Promise<{ facilityMap: Map<string, { id: string; areaId: string | null }>; created: number; updated: number }> {
  const facilityMap = new Map<string, { id: string; areaId: string | null }>();
  let createdCount = 0;
  let updatedCount = 0;

  const existingBySlug = new Map<string, string>();
  if (!DRY_RUN) {
    const rows = await prisma.facility.findMany({ select: { id: true, slug: true } });
    rows.forEach((r) => existingBySlug.set(r.slug, r.id));
  }

  for (const data of facilities) {
    const { division, district, thana, area } = data.region;
    const areaId = await ensureArea(area, thana, district, division);
    geoCache.facilityArea.set(data.slug, areaId);

    const scalars = {
      name: data.name,
      areaId,
      type: data.type,
      description: data.description,
      longDescription: data.longDescription,
      address: data.address,
      phone: data.phone,
      mobile: data.mobile,
      emergencyPhone: data.emergencyPhone,
      email: data.email,
      website: data.website,
      openingHours: data.openingHours,
      ownership: data.ownership,
      establishedYear: data.establishedYear,
      beds: data.beds,
      icuBeds: data.icuBeds,
      nicuBeds: data.nicuBeds,
      operationTheaters: data.operationTheaters,
      hasIcu: data.hasIcu,
      hasNicu: data.hasNicu,
      hasEmergency: data.hasEmergency,
      hasAmbulance: data.hasAmbulance,
      hasBloodBank: data.hasBloodBank,
      hasPharmacy: data.hasPharmacy,
      hasPathologyLab: data.hasPathologyLab,
      hasHomeSampleCollection: data.hasHomeSampleCollection,
      hasOnlineReport: data.hasOnlineReport,
      hasParkingAvailable: data.hasParkingAvailable,
      accreditation: data.accreditation,
      insurancePanels: data.insurancePanels,
      diagnosticTests: data.diagnosticTests,
      imagingServices: data.imagingServices,
      verificationStatus: VerificationStatus.VERIFIED,
      listingTier: ListingTier.FREE,
      isActive: true,
    };

    const existingId = existingBySlug.get(data.slug);
    if (!existingId) {
      log(`  + facility: ${data.name}`);
      if (!DRY_RUN) {
        const created = await prisma.facility.create({
          data: {
            ...scalars,
            slug: data.slug,
            areaId,
            departments: { create: data.departments },
            services: {
              create: data.services.map((s) => ({ name: s.name, price: null })),
            },
            amenities: {
              create: data.amenities
                .map((name) => amenityMap.get(name))
                .filter((id): id is string => Boolean(id))
                .map((amenityId) => ({ amenityId })),
            },
          },
          select: { id: true },
        });
        facilityMap.set(data.slug, { id: created.id, areaId });
      }
      createdCount++;
    } else {
      if (!DRY_RUN) {
        await prisma.facility.update({ where: { slug: data.slug }, data: scalars });
        // add missing departments/services/amenities, never delete admin edits
        const [deptNames, serviceNames, linkedAmenities] = await Promise.all([
          prisma.facilityDepartment.findMany({
            where: { facilityId: existingId },
            select: { name: true },
          }),
          prisma.facilityService.findMany({
            where: { facilityId: existingId, deletedAt: null },
            select: { name: true },
          }),
          prisma.facilityAmenity.findMany({
            where: { facilityId: existingId },
            select: { amenityId: true },
          }),
        ]);
        const missingDepts = data.departments.filter(
          (d) => !deptNames.some((x) => x.name === d.name)
        );
        const missingServices = data.services.filter(
          (s) => !serviceNames.some((x) => x.name === s.name)
        );
        const haveAmenity = new Set(linkedAmenities.map((a) => a.amenityId));
        const missingAmenities = data.amenities
          .map((name) => amenityMap.get(name))
          .filter((id): id is string => {
            if (!id) return false;
            return !haveAmenity.has(id);
          });
        if (missingDepts.length) {
          await prisma.facilityDepartment.createMany({
            data: missingDepts.map((d) => ({ facilityId: existingId, name: d.name })),
          });
        }
        if (missingServices.length) {
          await prisma.facilityService.createMany({
            data: missingServices.map((s) => ({
              facilityId: existingId,
              name: s.name,
              price: null,
            })),
          });
        }
        if (missingAmenities.length) {
          await prisma.facilityAmenity.createMany({
            data: missingAmenities.map((amenityId) => ({
              facilityId: existingId,
              amenityId,
            })),
            skipDuplicates: true,
          });
        }
      }
      updatedCount++;
    }
    if (!facilityMap.has(data.slug)) {
      facilityMap.set(data.slug, { id: existingId ?? `dry:${data.slug}`, areaId });
    }
  }

  log(`  facilities: ${createdCount} to create, ${updatedCount} to update`);
  return { facilityMap, created: createdCount, updated: updatedCount };
}

// ========================= Doctors =========================

async function seedDoctors(
  doctors: RealDoctor[],
  facilityMap: Map<string, { id: string; areaId: string | null }>,
  specialtyMap: Map<string, string>
): Promise<{ created: number; updated: number; chambers: number }> {
  let created = 0;
  let updated = 0;
  let chambers = 0;

  const existingCounts = new Map<string, { id: string; chambers: number }>();
  if (!DRY_RUN) {
    const [rows, counts] = await Promise.all([
      prisma.doctor.findMany({ select: { id: true, slug: true } }),
      prisma.chamber.groupBy({ by: ["doctorId"], _count: { _all: true } }),
    ]);
    const countByDoctor = new Map(counts.map((c) => [c.doctorId, c._count._all]));
    rows.forEach((r) =>
      existingCounts.set(r.slug, { id: r.id, chambers: countByDoctor.get(r.id) ?? 0 })
    );
  }

  for (const data of doctors) {
    const specialtyIds = [
      ...new Set(data.specialties.map((name) => specialtyMap.get(kebab(name))).filter((id): id is string => Boolean(id))),
    ];

    const scalars = {
      name: data.name,
      bio: data.bio,
      degrees: data.degrees,
      currentPosition: data.currentPosition,
      expertise: data.expertise,
      verificationStatus: VerificationStatus.VERIFIED,
      listingTier: ListingTier.FREE,
      isActive: true,
    };

    const chamberData = data.chambers.map((c) => {
      const facility = c.facilitySlug ? facilityMap.get(c.facilitySlug) : undefined;
      return {
        address: c.address,
        facilityId: facility?.id ?? null,
        areaId: facility?.areaId ?? null,
      };
    });

    const existing = existingCounts.get(data.slug);

    if (!existing) {
      if (!DRY_RUN) {
        await prisma.doctor.create({
          data: {
            ...scalars,
            slug: data.slug,
            specialties: {
              create: specialtyIds.map((specialtyId) => ({ specialtyId })),
            },
            chambers: { create: chamberData },
          },
        });
      }
      created++;
      chambers += chamberData.length;
    } else {
      if (!DRY_RUN) {
        await prisma.doctor.update({ where: { slug: data.slug }, data: scalars });
        // add missing specialty links, never remove existing ones
        const current = await prisma.doctorSpecialty.findMany({
          where: { doctorId: existing.id },
          select: { specialtyId: true },
        });
        const have = new Set(current.map((s) => s.specialtyId));
        const missing = specialtyIds.filter((id) => !have.has(id));
        if (missing.length) {
          await prisma.doctorSpecialty.createMany({
            data: missing.map((specialtyId) => ({
              doctorId: existing.id,
              specialtyId,
            })),
            skipDuplicates: true,
          });
        }
        // only add chambers when the doctor has none in the DB yet
        if (existing.chambers === 0 && chamberData.length) {
          await prisma.chamber.createMany({
            data: chamberData.map((c) => ({ ...c, doctorId: existing.id })),
          });
          chambers += chamberData.length;
        }
      }
      updated++;
    }
  }

  return { created, updated, chambers };
}

// ========================= Main =========================

function log(msg: string) {
  if (!DRY_RUN) console.log(msg);
  else console.log(`[dry] ${msg}`);
}

async function main() {
  const regions = readdirSync(SEED_REAL_DIR).filter((name) => {
    const p = join(SEED_REAL_DIR, name);
    return (
      statSync(p).isDirectory() &&
      existsSync(join(p, "facilities.json")) &&
      existsSync(join(p, "doctors.json"))
    );
  });
  if (!regions.length) {
    console.error(`No region folders with facilities.json + doctors.json under ${SEED_REAL_DIR}`);
    process.exit(1);
  }

  console.log(`seed-real${DRY_RUN ? " (DRY RUN)" : ""}: regions = ${regions.join(", ")}`);

  const loaded = regions.map(loadRegion);
  const allDoctors = loaded.flatMap((r) => r.doctors);
  const allFacilities = loaded.flatMap((r) => r.facilities);

  console.log("Ensuring specialties...");
  const specialtyMap = await ensureSpecialties(allDoctors);
  log(`  specialties: ${specialtyMap.size}`);

  console.log("Ensuring amenities...");
  const amenityMap = await ensureAmenities([
    ...new Set(allFacilities.flatMap((f) => f.amenities)),
  ]);
  log(`  amenities: ${amenityMap.size}`);

  const totals = { facilitiesC: 0, facilitiesU: 0, doctorsC: 0, doctorsU: 0, chambers: 0 };
  for (const region of loaded) {
    console.log(`Region [${region.name}]: ${region.facilities.length} facilities, ${region.doctors.length} doctors`);
    console.log("Ensuring geography + facilities...");
    const { facilityMap, created: fc, updated: fu } = await seedFacilities(region.facilities, amenityMap);
    console.log("Seeding doctors and chambers...");
    const { created, updated, chambers } = await seedDoctors(region.doctors, facilityMap, specialtyMap);
    totals.facilitiesC += fc;
    totals.facilitiesU += fu;
    totals.doctorsC += created;
    totals.doctorsU += updated;
    totals.chambers += chambers;
    const byDistrict = new Map<string, number>();
    region.facilities.forEach((f) =>
      byDistrict.set(f.region.district, (byDistrict.get(f.region.district) ?? 0) + 1)
    );
    log(`  districts: ${[...byDistrict.entries()].map(([d, n]) => `${d}=${n}`).join(", ")}`);
  }

  console.log(
    `Done. Facilities: ${totals.facilitiesC} created / ${totals.facilitiesU} existing. Doctors: ${totals.doctorsC} created / ${totals.doctorsU} existing. Chambers touched: ${totals.chambers}.`
  );
  if (DRY_RUN) console.log("DRY RUN — nothing was written.");
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
