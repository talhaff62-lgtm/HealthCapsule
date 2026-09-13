/*
 * Data sources for Chattogram healthcare data:
 * - drctg.com top-10 directory pages
 * - nationalhospital.com.bd
 * - ibnsinatrust.com
 * - doctoraidbd.com
 * - parkview.com.bd
 * Researched: 2026-09-13
 */

import "dotenv/config";
import { UserRole, VerificationStatus, FacilityType } from "@prisma/client";
import { hashSync } from "bcryptjs";
import { prisma } from "../src/lib/prisma";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type FacilitySeed = {
  name: string;
  type: FacilityType;
  address: string;
  area: string;
  phone: string;
  amenities: string[];
  description: string;
};

type DoctorSeed = {
  name: string;
  specialty: string;
  degrees: string;
  currentPosition: string;
  facilityName: string;
};

const rawFacilities: FacilitySeed[] = [
  {
    name: "National Hospital Chattogram",
    type: FacilityType.HOSPITAL,
    address: "14/15, Dampara Lane, Mehedibag, Chattogram",
    area: "Mehedibag",
    phone: "+88031627914",
    amenities: ["MRI", "CT Scan", "ICU", "Emergency", "Pathology Lab"],
    description: "150-bed private hospital at Mehedibag.",
  },
  {
    name: "Evercare Hospital Chattogram",
    type: FacilityType.HOSPITAL,
    address: "Ananna Residential Area, CDA, Oxygen–Kuwaish Road, Chattogram",
    area: "Pahartali",
    phone: "+8809612310663",
    amenities: ["MRI", "CT Scan", "ICU", "NICU", "Emergency", "Dialysis", "Pathology Lab", "Blood Bank"],
    description: "470-bed multi-disciplinary tertiary-care hospital.",
  },
  {
    name: "Chattogram Metropolitan Hospital",
    type: FacilityType.HOSPITAL,
    address: "698/752, O.R. Nizam Road, Panchlaish, Chattogram",
    area: "Panchlaish",
    phone: "+8801814651077",
    amenities: ["ICU", "Emergency", "Pathology Lab", "ECG", "Ultrasonography"],
    description: "Private hospital with heart center.",
  },
  {
    name: "Parkview Hospital",
    type: FacilityType.HOSPITAL,
    address: "94/103, Katalganj Road, Panchlaish, Chattogram",
    area: "Panchlaish",
    phone: "+8809610818888",
    amenities: ["ICU", "NICU", "Emergency", "CT Scan", "Dialysis"],
    description: "Large private hospital, 24/7 cardiac emergency.",
  },
  {
    name: "Imperial Hospital Limited",
    type: FacilityType.HOSPITAL,
    address: "Zakir Hossain Road, Muradpur, Pahartali, Chattogram",
    area: "Pahartali",
    phone: "+8809612247247",
    amenities: ["MRI", "CT Scan", "ICU", "NICU", "Emergency", "Dialysis", "Pathology Lab"],
    description: "Multispecialty tertiary hospital (Apollo Imperial).",
  },
  {
    name: "CSCR Hospital & Diagnostic",
    type: FacilityType.HOSPITAL,
    address: "O.R. Nizam Road, Chattogram",
    area: "Panchlaish",
    phone: "+88031656565",
    amenities: ["ICU", "Emergency", "CT Scan", "Pathology Lab"],
    description: "Modern hospital with cath lab and ICU.",
  },
  {
    name: "Max Hospital & Diagnostic",
    type: FacilityType.HOSPITAL,
    address: "35/36, Mehedibag Road, Chawkbazar, Chattogram",
    area: "Chawkbazar",
    phone: "+88031622514",
    amenities: ["ICU", "Emergency", "Ultrasonography", "ECG"],
    description: "Private hospital and diagnostics.",
  },
  {
    name: "Islami Bank Hospital",
    type: FacilityType.HOSPITAL,
    address: "Sheikh Mujib Road, Agrabad, Chattogram",
    area: "Agrabad",
    phone: "+8801731253990",
    amenities: ["ICU", "Emergency", "ECG"],
    description: "Private hospital at Agrabad.",
  },
  {
    name: "Chittagong Medical College Hospital",
    type: FacilityType.HOSPITAL,
    address: "Kaptai Road, Panchlaish, Chattogram",
    area: "Panchlaish",
    phone: "+88031616892",
    amenities: ["ICU", "Emergency", "Pathology Lab", "Blood Bank"],
    description: "Largest public tertiary hospital in Chattogram.",
  },
  {
    name: "Memon Maternity Hospital",
    type: FacilityType.HOSPITAL,
    address: "55, Sadarghat Road, Chattogram",
    area: "Sadarghat",
    phone: "+88031617169",
    amenities: ["Ultrasonography", "ECG", "Pathology Lab", "Blood Bank"],
    description: "Maternity and child health hospital.",
  },
  {
    name: "LabAid Diagnostics Center",
    type: FacilityType.DIAGNOSTIC_CENTER,
    address: "3046, O.R. Nizam Road, Nasirabad, Chattogram",
    area: "Nasirabad",
    phone: "+8801766662828",
    amenities: ["Pathology Lab", "Ultrasonography", "ECG", "MRI", "CT Scan"],
    description: "National diagnostic chain branch.",
  },
  {
    name: "Ibn Sina Diagnostic & Consultation Center",
    type: FacilityType.DIAGNOSTIC_CENTER,
    address: "House 12/A, Road 02, Katalganj R/A, Panchlaish, Chattogram",
    area: "Panchlaish",
    phone: "+8809610009622",
    amenities: ["Pathology Lab", "Ultrasonography", "ECG", "CT Scan"],
    description: "Ibn Sina Trust Chattogram branch.",
  },
  {
    name: "Popular Diagnostic Center",
    type: FacilityType.DIAGNOSTIC_CENTER,
    address: "20/B, K.B. Fazlul Kader Road, Panchlaish, Chattogram",
    area: "Panchlaish",
    phone: "+8809666787810",
    amenities: ["Pathology Lab", "Ultrasonography", "ECG", "MRI"],
    description: "Popular Diagnostic Centre Chattogram branch.",
  },
];

const rawDoctors: DoctorSeed[] = [
  // Cardiology
  {
    name: "Dr. Mintu Dhar",
    specialty: "Cardiology",
    degrees: "MBBS, BCS (Health), MCPS (Medicine), MD (Cardiology)",
    currentPosition: "Consultant (Cardiology), Chittagong Medical College Hospital",
    facilityName: "Chattogram Metropolitan Hospital",
  },
  {
    name: "Dr. Md. Mostafizur Rahman",
    specialty: "Cardiology",
    degrees: "MBBS, BCS (Health), MD (Cardiology)",
    currentPosition: "Assistant Professor, Cardiology, Chittagong Medical College & Hospital",
    facilityName: "National Hospital Chattogram",
  },
  {
    name: "Dr. Md. Rezwan Rehan",
    specialty: "Cardiology",
    degrees: "MBBS, D-Card",
    currentPosition: "Consultant, Cardiology, Chittagong Medical College & Hospital",
    facilityName: "Max Hospital & Diagnostic",
  },
  {
    name: "Dr. Ayon Kumar",
    specialty: "Cardiology",
    degrees: "MBBS, MD (Medicine), DNB (Cardiology)",
    currentPosition: "Consultant, Cardiology, Chattogram Metropolitan Hospital",
    facilityName: "Chattogram Metropolitan Hospital",
  },
  {
    name: "Dr. Habibul Islam Chowdhury",
    specialty: "Cardiology",
    degrees: "MBBS, BCS (Health), MD (Cardiology)",
    currentPosition: "Assistant Professor, Cardiology, Chittagong Medical College & Hospital",
    facilityName: "National Hospital Chattogram",
  },
  {
    name: "Dr. Md. Abdul Jalil",
    specialty: "Cardiology",
    degrees: "MBBS, BCS (Health), D-Card (NICVD), CCD (BIRDEM)",
    currentPosition: "Former Associate Professor, Cardiology, Chittagong Medical College & Hospital",
    facilityName: "National Hospital Chattogram",
  },
  {
    name: "Dr. Md. Abdul Mottalib",
    specialty: "Cardiology",
    degrees: "MBBS, MD (Cardiology)",
    currentPosition: "Consultant, Cardiology, Chittagong Medical College & Hospital",
    facilityName: "Chattogram Metropolitan Hospital",
  },
  {
    name: "Dr. Sarwar Kamal",
    specialty: "Cardiology",
    degrees: "MBBS (RMC), MS (CV & TS), NICVD",
    currentPosition: "Chief Cardiac Surgeon, Chittagong Metropolitan Hospital Heart Center",
    facilityName: "Chattogram Metropolitan Hospital",
  },
  {
    name: "Dr. Md. Akhter Hossain",
    specialty: "Cardiology",
    degrees: "MBBS, BCS (Health), D-Card (NICVD)",
    currentPosition: "Consultant, Cardiology, Chattogram Metropolitan Hospital",
    facilityName: "Chattogram Metropolitan Hospital",
  },
  {
    name: "Dr. Zahiruddin Mahmud Illius",
    specialty: "Cardiology",
    degrees: "MBBS, MCPS (Internal Medicine), MD (Cardiology), DEM, MACP (USA)",
    currentPosition: "Senior Consultant, Cardiology, Evercare Hospital Chattogram",
    facilityName: "Evercare Hospital Chattogram",
  },
  {
    name: "Dr. Md. Shafiul Azam",
    specialty: "Cardiology",
    degrees: "MBBS, MCPS (Medicine), D-Card (DU), MD (Cardiology)",
    currentPosition: "Former Assistant Professor, Cardiology, Chittagong Medical College & Hospital",
    facilityName: "Popular Diagnostic Center",
  },

  // Gynecology & Obstetrics
  {
    name: "Dr. Sufia Khanam",
    specialty: "Gynecology & Obstetrics",
    degrees: "MBBS (CMC), FCPS (Obs & Gyne), BCS (Health)",
    currentPosition: "Gynecology & Obstetrics Specialist, Chattogram Medical College",
    facilityName: "-",
  },
  {
    name: "Prof. Dr. Rinku Das",
    specialty: "Gynecology & Obstetrics",
    degrees: "MBBS, DGO, MCPS, FCPS (OBGYN), FRM",
    currentPosition: "Professor & Head (Obs & Gyne), BGC Trust Medical College, Chittagong",
    facilityName: "Max Hospital & Diagnostic",
  },
  {
    name: "Dr. Tazeen Sultana",
    specialty: "Gynecology & Obstetrics",
    degrees: "MBBS, FCPS (OBGYN)",
    currentPosition: "Gynecology Specialist & Surgeon, Chittagong Medical College & Hospital",
    facilityName: "National Hospital Chattogram",
  },
  {
    name: "Dr. Sarwat Ara Riku",
    specialty: "Gynecology & Obstetrics",
    degrees: "MBBS, BCS (Health), MCPS, MS (OBGYN)",
    currentPosition: "Registrar, Gynecology & Obstetrics, Chittagong Medical College & Hospital",
    facilityName: "National Hospital Chattogram",
  },
  {
    name: "Dr. Srabani Barua",
    specialty: "Gynecology & Obstetrics",
    degrees: "MBBS, BCS (Health), FCPS (OBGYN)",
    currentPosition: "Consultant, Gynecology & Obstetrics, Chittagong Medical College & Hospital",
    facilityName: "-",
  },
  {
    name: "Prof. Dr. Serajun Noor Rosy",
    specialty: "Gynecology & Obstetrics",
    degrees: "MBBS, FCPS (OBGYN)",
    currentPosition: "Professor, Gynecology & Obstetrics, Chattogram Maa-O-Shishu Hospital Medical College",
    facilityName: "Chattogram Metropolitan Hospital",
  },
  {
    name: "Dr. Tahera Begum",
    specialty: "Gynecology & Obstetrics",
    degrees: "MBBS, MCPS, DGO, MS (OBGYN)",
    currentPosition: "Assistant Professor, Gynecology & Obstetrics, Southern Medical College & Hospital",
    facilityName: "Popular Diagnostic Center",
  },
  {
    name: "Dr. Jakia Momotaz",
    specialty: "Gynecology & Obstetrics",
    degrees: "MBBS (Dhaka), BCS, MS (Obs & Gyne), DMU",
    currentPosition: "Consultant Gynecologist, Chittagong Medical College Hospital",
    facilityName: "LabAid Diagnostics Center",
  },
  {
    name: "Dr. Syeda Yeasmin Akter",
    specialty: "Gynecology & Obstetrics",
    degrees: "MBBS, BCS (Health), FCPS (Gynecology & Obstetrics)",
    currentPosition: "Assistant Professor (Obs & Gyne), Chittagong Medical College & Hospital",
    facilityName: "-",
  },
  {
    name: "Dr. Marjan Siddika Rupsa",
    specialty: "Gynecology & Obstetrics",
    degrees: "MBBS, BCS (Health), FCPS (Gyne & Obs)",
    currentPosition: "Consultant (Obs & Gyne), Chattogram Medical College & Hospital",
    facilityName: "Ibn Sina Diagnostic & Consultation Center",
  },

  // Medicine
  {
    name: "Dr. Mohammad Rezaul Karim",
    specialty: "Medicine",
    degrees: "MBBS, BCS (Health), MD (Internal Medicine)",
    currentPosition: "Assistant Professor, Medicine, Chittagong Medical College & Hospital",
    facilityName: "National Hospital Chattogram",
  },
  {
    name: "Dr. Syed Mohammad Jabed",
    specialty: "Medicine",
    degrees: "MBBS, FCPS (Medicine)",
    currentPosition: "Associate Professor, Medicine, Bangabandhu Memorial Hospital, USTC, Chittagong",
    facilityName: "Chattogram Metropolitan Hospital",
  },
  {
    name: "Dr. Md. Faruk",
    specialty: "Medicine",
    degrees: "MBBS, BCS (Health), FCPS (Medicine)",
    currentPosition: "Consultant, Medicine, Chittagong Medical College & Hospital",
    facilityName: "Chattogram Metropolitan Hospital",
  },
  {
    name: "Dr. Md. Showkat Ali",
    specialty: "Medicine",
    degrees: "MBBS, BCS (Health), FCPS (Medicine), MD (Nephrology)",
    currentPosition: "Consultant, Nephrology, Chittagong Medical College & Hospital",
    facilityName: "Popular Diagnostic Center",
  },
  {
    name: "Dr. Emrul Kaiser",
    specialty: "Medicine",
    degrees: "MBBS, BCS (Health), FCPS (Medicine)",
    currentPosition: "Consultant, Department of Medicine, Chittagong Medical College & Hospital",
    facilityName: "-",
  },
  {
    name: "Dr. Md. Abdur Rahim",
    specialty: "Medicine",
    degrees: "MBBS (DMC), FMD (Family Medicine), CCD (BIRDEM), PGT (Child Health)",
    currentPosition: "Consultant, Pediatrics, Chittagong Medical College & Hospital",
    facilityName: "-",
  },

  // Dentistry
  {
    name: "Dr. Md. Omar Faruk",
    specialty: "Dentistry",
    degrees: "BDS, MS (Orthodontics)",
    currentPosition: "Assistant Professor, Orthodontics, Chittagong Medical College & Hospital",
    facilityName: "-",
  },
];

async function main() {
  console.log("Starting demo seed...");

  const counts = {
    users: { created: 0, updated: 0, reused: 0 },
    amenities: { created: 0, updated: 0, reused: 0 },
    divisions: { created: 0, updated: 0, reused: 0 },
    districts: { created: 0, updated: 0, reused: 0 },
    thanas: { created: 0, updated: 0, reused: 0 },
    areas: { created: 0, updated: 0, reused: 0 },
    facilities: { created: 0, updated: 0, reused: 0 },
    specialties: { created: 0, updated: 0, reused: 0 },
    doctors: { created: 0, updated: 0, reused: 0 },
    chambers: { created: 0, updated: 0, reused: 0 },
  };

  const now = new Date();

  // 1a. Demo accounts
  console.log("Seeding demo user accounts...");
  const adminPasswordHash = hashSync("Admin@12345", 10);
  const staffPasswordHash = hashSync("Staff@12345", 10);

  const adminAccount = await prisma.user.findUnique({
    where: { email: "admin@healthcapsule.test" },
  });
  let adminUser;
  if (adminAccount) {
    adminUser = await prisma.user.update({
      where: { email: "admin@healthcapsule.test" },
      data: {
        name: "Demo Admin",
        passwordHash: adminPasswordHash,
        role: UserRole.ADMIN,
      },
    });
    counts.users.updated++;
  } else {
    adminUser = await prisma.user.create({
      data: {
        name: "Demo Admin",
        email: "admin@healthcapsule.test",
        passwordHash: adminPasswordHash,
        role: UserRole.ADMIN,
      },
    });
    counts.users.created++;
  }

  const staffAccount = await prisma.user.findUnique({
    where: { email: "staff@healthcapsule.test" },
  });
  let staffUser;
  if (staffAccount) {
    staffUser = await prisma.user.update({
      where: { email: "staff@healthcapsule.test" },
      data: {
        name: "Demo Staff",
        passwordHash: staffPasswordHash,
        role: UserRole.STAFF,
      },
    });
    counts.users.updated++;
  } else {
    staffUser = await prisma.user.create({
      data: {
        name: "Demo Staff",
        email: "staff@healthcapsule.test",
        passwordHash: staffPasswordHash,
        role: UserRole.STAFF,
      },
    });
    counts.users.created++;
  }

  // 1b. Amenities
  console.log("Seeding amenities...");
  const amenitiesList = [
    "MRI",
    "Ultrasonography",
    "CT Scan",
    "ECG",
    "Pathology Lab",
    "Dialysis",
    "Blood Bank",
    "Physiotherapy",
  ];

  for (const name of amenitiesList) {
    const existing = await prisma.amenity.findUnique({ where: { name } });
    if (existing) {
      counts.amenities.reused++;
    } else {
      await prisma.amenity.create({ data: { name } });
      counts.amenities.created++;
    }
  }

  // 1c. Geography
  console.log("Seeding geography...");
  let division = await prisma.division.findFirst({
    where: { name: { equals: "Chattogram", mode: "insensitive" } },
  });
  if (division) {
    counts.divisions.reused++;
  } else {
    division = await prisma.division.create({
      data: { name: "Chattogram" },
    });
    counts.divisions.created++;
  }

  let district = await prisma.district.findFirst({
    where: {
      divisionId: division.id,
      name: { equals: "Chattogram", mode: "insensitive" },
    },
  });
  if (district) {
    counts.districts.reused++;
  } else {
    district = await prisma.district.create({
      data: { divisionId: division.id, name: "Chattogram" },
    });
    counts.districts.created++;
  }

  const thanaNames = ["Kotwali", "Panchlaish", "Pahartali", "Double Mooring", "Chawkbazar"];
  const thanaMap = new Map<string, string>(); // thanaName (lowercase) -> thanaId

  for (const tName of thanaNames) {
    let thana = await prisma.thana.findFirst({
      where: {
        districtId: district.id,
        name: { equals: tName, mode: "insensitive" },
      },
    });
    if (thana) {
      counts.thanas.reused++;
    } else {
      thana = await prisma.thana.create({
        data: {
          districtId: district.id,
          name: tName,
          type: "METROPOLITAN_THANA",
        },
      });
      counts.thanas.created++;
    }
    thanaMap.set(tName.toLowerCase(), thana.id);
  }

  const areaDefs = [
    { name: "Mehedibag", thana: "Kotwali", lat: 22.3415, lng: 91.8345 },
    { name: "Sadarghat", thana: "Kotwali", lat: 22.3302, lng: 91.8381 },
    { name: "Chawkbazar", thana: "Chawkbazar", lat: 22.3382, lng: 91.8290 },
    { name: "Panchlaish", thana: "Panchlaish", lat: 22.3720, lng: 91.8330 },
    { name: "Nasirabad", thana: "Panchlaish", lat: 22.3610, lng: 91.8440 },
    { name: "Agrabad", thana: "Double Mooring", lat: 22.3262, lng: 91.8150 },
    { name: "Pahartali", thana: "Pahartali", lat: 22.3950, lng: 91.8460 },
    { name: "Khulshi", thana: "Panchlaish", lat: 22.3600, lng: 91.8210 },
  ];

  const areaMap = new Map<string, { id: string; lat: number; lng: number }>();

  for (const aDef of areaDefs) {
    const thanaId = thanaMap.get(aDef.thana.toLowerCase())!;
    const thanaSlug = slugify(aDef.thana);
    const areaSlug = `${thanaSlug}-${slugify(aDef.name)}`;

    let area = await prisma.area.findFirst({
      where: {
        OR: [
          { slug: areaSlug },
          { thanaId, name: { equals: aDef.name, mode: "insensitive" } },
        ],
      },
    });

    if (area) {
      areaMap.set(aDef.name.toLowerCase(), { id: area.id, lat: aDef.lat, lng: aDef.lng });
      counts.areas.reused++;
    } else {
      area = await prisma.area.create({
        data: {
          name: aDef.name,
          slug: areaSlug,
          thanaId,
          type: "NEIGHBOURHOOD",
          latitude: aDef.lat,
          longitude: aDef.lng,
        },
      });
      areaMap.set(aDef.name.toLowerCase(), { id: area.id, lat: aDef.lat, lng: aDef.lng });
      counts.areas.created++;
    }
  }

  // 1d. Facilities
  console.log("Seeding facilities...");
  const facilityMap = new Map<string, string>(); // facilityName.toLowerCase() -> facilityId

  for (const fData of rawFacilities) {
    const fSlug = slugify(fData.name);
    const areaInfo = areaMap.get(fData.area.toLowerCase())!;

    let facility = await prisma.facility.findUnique({
      where: { slug: fSlug },
    });

    if (!facility) {
      facility = await prisma.facility.findFirst({
        where: { name: { equals: fData.name, mode: "insensitive" } },
      });
    }

    const facilityData = {
      name: fData.name,
      slug: fSlug,
      type: fData.type,
      areaId: areaInfo.id,
      address: fData.address,
      latitude: areaInfo.lat,
      longitude: areaInfo.lng,
      phone: fData.phone,
      description: fData.description,
      hasIcu: fData.amenities.includes("ICU"),
      hasNicu: fData.amenities.includes("NICU"),
      hasEmergency: fData.amenities.includes("Emergency"),
      verificationStatus: VerificationStatus.VERIFIED,
      isActive: true,
      collectedById: staffUser.id,
      collectedAt: now,
    };

    if (facility) {
      facility = await prisma.facility.update({
        where: { id: facility.id },
        data: facilityData,
      });
      counts.facilities.updated++;
    } else {
      facility = await prisma.facility.create({
        data: facilityData,
      });
      counts.facilities.created++;
    }

    facilityMap.set(fData.name.toLowerCase(), facility.id);

    // Connect amenities via FacilityAmenity
    for (const amenityName of fData.amenities) {
      const dbAmenity = await prisma.amenity.findUnique({ where: { name: amenityName } });
      if (dbAmenity) {
        await prisma.facilityAmenity.upsert({
          where: {
            facilityId_amenityId: {
              facilityId: facility.id,
              amenityId: dbAmenity.id,
            },
          },
          create: {
            facilityId: facility.id,
            amenityId: dbAmenity.id,
          },
          update: {},
        });
      }
    }
  }

  // 1e. Doctors
  console.log("Seeding doctors, specialties, and chambers...");
  for (const dData of rawDoctors) {
    const dSlug = slugify(dData.name);
    const degreesArray = dData.degrees.split(",").map((s) => s.trim()).filter(Boolean);

    let doctor = await prisma.doctor.findUnique({
      where: { slug: dSlug },
    });

    if (!doctor) {
      doctor = await prisma.doctor.findFirst({
        where: { name: { equals: dData.name, mode: "insensitive" } },
      });
    }

    const doctorData = {
      name: dData.name,
      slug: dSlug,
      degrees: degreesArray,
      currentPosition: dData.currentPosition,
      verificationStatus: VerificationStatus.VERIFIED,
      isActive: true,
      collectedById: staffUser.id,
      collectedAt: now,
    };

    if (doctor) {
      doctor = await prisma.doctor.update({
        where: { id: doctor.id },
        data: doctorData,
      });
      counts.doctors.updated++;
    } else {
      doctor = await prisma.doctor.create({
        data: doctorData,
      });
      counts.doctors.created++;
    }

    // Specialty
    const specSlug = slugify(dData.specialty);
    let specialty = await prisma.specialty.findUnique({ where: { slug: specSlug } });
    if (!specialty) {
      specialty = await prisma.specialty.create({
        data: { name: dData.specialty, slug: specSlug },
      });
      counts.specialties.created++;
    } else {
      counts.specialties.reused++;
    }

    await prisma.doctorSpecialty.upsert({
      where: {
        doctorId_specialtyId: {
          doctorId: doctor.id,
          specialtyId: specialty.id,
        },
      },
      create: {
        doctorId: doctor.id,
        specialtyId: specialty.id,
      },
      update: {},
    });

    // Chamber
    if (dData.facilityName && dData.facilityName !== "-") {
      const facId = facilityMap.get(dData.facilityName.toLowerCase());
      if (facId) {
        const existingChamber = await prisma.chamber.findFirst({
          where: { doctorId: doctor.id, facilityId: facId },
        });

        if (!existingChamber) {
          const fac = await prisma.facility.findUnique({ where: { id: facId } });
          await prisma.chamber.create({
            data: {
              doctorId: doctor.id,
              facilityId: facId,
              areaId: fac?.areaId,
              address: fac?.address,
              latitude: fac?.latitude,
              longitude: fac?.longitude,
              isActive: true,
            },
          });
          counts.chambers.created++;
        } else {
          counts.chambers.reused++;
        }
      }
    }
  }

  console.log("\n=== Demo Seed Summary ===");
  console.log(`Users       : ${counts.users.created} created, ${counts.users.updated} updated, ${counts.users.reused} reused`);
  console.log(`Amenities   : ${counts.amenities.created} created, ${counts.amenities.updated} updated, ${counts.amenities.reused} reused`);
  console.log(`Divisions   : ${counts.divisions.created} created, ${counts.divisions.updated} updated, ${counts.divisions.reused} reused`);
  console.log(`Districts   : ${counts.districts.created} created, ${counts.districts.updated} updated, ${counts.districts.reused} reused`);
  console.log(`Thanas      : ${counts.thanas.created} created, ${counts.thanas.updated} updated, ${counts.thanas.reused} reused`);
  console.log(`Areas       : ${counts.areas.created} created, ${counts.areas.updated} updated, ${counts.areas.reused} reused`);
  console.log(`Facilities  : ${counts.facilities.created} created, ${counts.facilities.updated} updated, ${counts.facilities.reused} reused`);
  console.log(`Specialties : ${counts.specialties.created} created, ${counts.specialties.updated} updated, ${counts.specialties.reused} reused`);
  console.log(`Doctors     : ${counts.doctors.created} created, ${counts.doctors.updated} updated, ${counts.doctors.reused} reused`);
  console.log(`Chambers    : ${counts.chambers.created} created, ${counts.chambers.updated} updated, ${counts.chambers.reused} reused`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
