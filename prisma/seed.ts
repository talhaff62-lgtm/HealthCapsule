import "dotenv/config";

import {
  Prisma,
  VerificationStatus,
  ListingTier,
  UserRole,
  ThanaType,
  AreaType,
} from "@prisma/client";
import { hashSync } from "bcryptjs";
import { readFileSync } from "fs";
import { resolve } from "path";
import { prisma } from "@/lib/prisma";

const LOCATION_DIR = process.env.LOCATION_SEED_DIR || "D:/Work/location";

function loadJson<T>(name: string): T {
  return JSON.parse(readFileSync(resolve(LOCATION_DIR, name), "utf-8")) as T;
}

async function seedGeography() {
  const divisions = loadJson<
    Array<{
      id: string | number;
      name: string;
      bn_name: string;
      pcode: string;
      latitude: number;
      longitude: number;
    }>
  >("divisions.json");

  const districts = loadJson<
    Array<{
      id: string | number;
      division_id: string | number;
      name: string;
      bn_name: string;
      pcode: string;
      area_sqkm: number;
      latitude: number;
      longitude: number;
    }>
  >("districts.json");

  const thanas = loadJson<
    Array<{
      id: string | number;
      district_id: string | number;
      name: string;
      bn_name: string;
      pcode: string;
      type: string;
      area_sqkm: number;
      latitude: number;
      longitude: number;
    }>
  >("thanas.json");

  const areas = loadJson<
    Array<{
      id: string | number;
      thana_id: string | number;
      name: string;
      bn_name: string;
      type: string;
      latitude: number;
      longitude: number;
      slug: string;
    }>
  >("areas.json");

  const aliases = loadJson<
    Array<{
      id: string | number;
      area_id: string | number;
      alias: string;
      lang: string;
    }>
  >("area_aliases.json");

  await prisma.division.createMany({
    data: divisions.map((d) => ({
      id: String(d.id),
      name: d.name,
      bnName: d.bn_name,
      pcode: d.pcode,
      latitude: d.latitude,
      longitude: d.longitude,
    })),
    skipDuplicates: true,
  });

  await prisma.district.createMany({
    data: districts.map((d) => ({
      id: String(d.id),
      divisionId: String(d.division_id),
      name: d.name,
      bnName: d.bn_name,
      pcode: d.pcode,
      areaSqkm: d.area_sqkm,
      latitude: d.latitude,
      longitude: d.longitude,
    })),
    skipDuplicates: true,
  });

  await prisma.thana.createMany({
    data: thanas.map((t) => ({
      id: String(t.id),
      districtId: String(t.district_id),
      name: t.name,
      bnName: t.bn_name,
      pcode: t.pcode,
      type: t.type as ThanaType,
      areaSqkm: t.area_sqkm,
      latitude: t.latitude,
      longitude: t.longitude,
    })),
    skipDuplicates: true,
  });

  await prisma.area.createMany({
    data: areas.map((a) => ({
      id: String(a.id),
      thanaId: String(a.thana_id),
      name: a.name,
      bnName: a.bn_name,
      slug: a.slug,
      type: a.type as AreaType,
      latitude: a.latitude,
      longitude: a.longitude,
    })),
    skipDuplicates: true,
  });

  await prisma.areaAlias.createMany({
    data: aliases.map((a) => ({
      id: String(a.id),
      areaId: String(a.area_id),
      alias: a.alias,
      lang: a.lang,
    })),
    skipDuplicates: true,
  });

  console.log(
    `Seeded ${divisions.length} divisions, ${districts.length} districts, ${thanas.length} thanas, ${areas.length} areas, ${aliases.length} aliases.`
  );
}

const specialties = [
  { name: "Cardiology", bnName: "কার্ডিওলজি", slug: "cardiology", icon: "heart-pulse" },
  { name: "General Physician", bnName: "সাধারণ চিকিৎসক", slug: "general-physician", icon: "stethoscope" },
  { name: "Pediatrics", bnName: "শিশু রোগ বিশেষজ্ঞ", slug: "pediatrics", icon: "baby" },
  { name: "Dermatology", bnName: "চর্মরোগ বিশেষজ্ঞ", slug: "dermatology", icon: "scan-face" },
  { name: "Orthopedics", bnName: "অর্থোপেডিক্স", slug: "orthopedics", icon: "bone" },
  { name: "Gynecology", bnName: "গাইনোকলোজি", slug: "gynecology", icon: "user-round" },
  { name: "Neurology", bnName: "নিউরোলজি", slug: "neurology", icon: "brain" },
  { name: "Psychiatry", bnName: "মনোরোগ বিশেষজ্ঞ", slug: "psychiatry", icon: "smile" },
];

async function seedSpecialties() {
  await prisma.specialty.createMany({
    data: specialties.map((s, index) => ({
      ...s,
      isPopular: index < 4,
    })),
    skipDuplicates: true,
  });
}

async function seedUsers() {
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

  const doctorUsers = await Promise.all(
    [
      { phone: "01711111111", name: "Dr. Sarah Rahman" },
      { phone: "01722222222", name: "Dr. Kamal Hossain" },
      { phone: "01733333333", name: "Dr. Farhana Akter" },
    ].map((u) =>
      prisma.user.upsert({
        where: { phone: u.phone },
        update: {},
        create: {
          phone: u.phone,
          passwordHash,
          role: UserRole.DOCTOR,
        },
      })
    )
  );

  return { admin, doctorUsers };
}

const sampleDoctors = [
  {
    userIndex: 0,
    name: "Dr. Sarah Rahman",
    slug: "dr-sarah-rahman",
    bio: "Consultant cardiologist with over 10 years of experience in interventional cardiology and heart failure management.",
    degrees: ["MBBS", "MD (Cardiology)", "FACC"],
    bmdcRegNo: "BMDC-C-12345",
    registrationYear: 2014,
    yearsExperience: 10,
    languages: ["English", "Bengali"],
    gender: "Female",
    consultationFee: 800,
    verificationStatus: VerificationStatus.VERIFIED,
    listingTier: ListingTier.FEATURED,
    specialtySlugs: ["cardiology"],
    chambers: [
      {
        address: "Room 304, HealthPoint Hospital, O.R. Nizam Road",
        fee: 800,
        areaName: "O.R. Nizam Road",
        schedules: [
          { dayOfWeek: 6, startTime: "09:00", endTime: "13:00", slotDurationMinutes: 15, maxPatients: 16 },
          { dayOfWeek: 3, startTime: "15:00", endTime: "18:00", slotDurationMinutes: 15, maxPatients: 12 },
        ],
      },
    ],
  },
  {
    userIndex: 1,
    name: "Dr. Kamal Hossain",
    slug: "dr-kamal-hossain",
    bio: "Experienced general physician providing comprehensive primary care and chronic disease management.",
    degrees: ["MBBS", "BCS (Health)", "FCPS (Medicine)"],
    bmdcRegNo: "BMDC-G-23456",
    registrationYear: 2012,
    yearsExperience: 12,
    languages: ["Bengali", "English"],
    gender: "Male",
    consultationFee: 500,
    verificationStatus: VerificationStatus.VERIFIED,
    listingTier: ListingTier.VERIFIED,
    specialtySlugs: ["general-physician"],
    chambers: [
      {
        address: "Chamber 12, K.B. Fazlul Kader Road",
        fee: 500,
        areaName: "K.B. Fazlul Kader Road",
        schedules: [
          { dayOfWeek: 1, startTime: "10:00", endTime: "14:00", slotDurationMinutes: 10, maxPatients: 24 },
          { dayOfWeek: 4, startTime: "10:00", endTime: "14:00", slotDurationMinutes: 10, maxPatients: 24 },
        ],
      },
    ],
  },
  {
    userIndex: 2,
    name: "Dr. Farhana Akter",
    slug: "dr-farhana-akter",
    bio: "Pediatrician focused on newborn care, vaccinations, and childhood illnesses.",
    degrees: ["MBBS", "MD (Pediatrics)"],
    bmdcRegNo: "BMDC-P-34567",
    registrationYear: 2023,
    yearsExperience: 2,
    languages: ["Bengali", "English"],
    gender: "Female",
    consultationFee: 600,
    verificationStatus: VerificationStatus.PENDING,
    listingTier: ListingTier.FREE,
    specialtySlugs: ["pediatrics"],
    chambers: [
      {
        address: "Probortok More, Chattogram",
        fee: 600,
        areaName: "Probortok More",
        schedules: [
          { dayOfWeek: 2, startTime: "16:00", endTime: "20:00", slotDurationMinutes: 20, maxPatients: 12 },
        ],
      },
    ],
  },
];

async function seedDoctors(adminId: string, userIds: string[]) {
  const areaMap = new Map(
    await prisma.area.findMany({ select: { id: true, name: true } }).then((areas) =>
      areas.map((a) => [a.name, a.id] as const)
    )
  );

  const specialtyMap = new Map(
    await prisma.specialty.findMany({ select: { id: true, slug: true } }).then((specs) =>
      specs.map((s) => [s.slug, s.id] as const)
    )
  );

  for (const data of sampleDoctors) {
    const userId = userIds[data.userIndex];

    const existing = await prisma.doctor.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      console.log(`Doctor ${data.slug} already exists; skipping.`);
      continue;
    }

    const specialtyIds = data.specialtySlugs
      .map((slug) => specialtyMap.get(slug))
      .filter((id): id is string => Boolean(id));

    await prisma.doctor.create({
      data: {
        name: data.name,
        slug: data.slug,
        bio: data.bio,
        degrees: data.degrees,
        bmdcRegNo: data.bmdcRegNo,
        registrationYear: data.registrationYear,
        yearsExperience: data.yearsExperience,
        languages: data.languages,
        gender: data.gender,
        consultationFee: new Prisma.Decimal(data.consultationFee),
        verificationStatus: data.verificationStatus,
        verifiedById: data.verificationStatus === VerificationStatus.VERIFIED ? adminId : null,
        verifiedAt: data.verificationStatus === VerificationStatus.VERIFIED ? new Date() : null,
        listingTier: data.listingTier,
        userId,
        specialties: {
          create: specialtyIds.map((specialtyId) => ({ specialtyId })),
        },
        chambers: {
          create: data.chambers.map((chamber) => ({
            address: chamber.address,
            consultationFee: new Prisma.Decimal(chamber.fee),
            areaId: areaMap.get(chamber.areaName) ?? null,
            schedules: {
              create: chamber.schedules.map((schedule) => ({
                dayOfWeek: schedule.dayOfWeek,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                slotDurationMinutes: schedule.slotDurationMinutes,
                maxPatients: schedule.maxPatients,
              })),
            },
          })),
        },
      },
    });
  }
}

async function main() {
  console.log("Seeding geography...");
  await seedGeography();
  console.log("Seeding specialties...");
  await seedSpecialties();
  console.log("Seeding users...");
  const { admin, doctorUsers } = await seedUsers();
  console.log("Seeding doctors, chambers, and schedules...");
  await seedDoctors(admin.id, doctorUsers.map((u) => u.id));
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
