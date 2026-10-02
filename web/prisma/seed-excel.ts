/*
 * Seed script to import facilities and doctors data from CSV files into HealthCapsule DB.
 *
 * Source CSV files:
 * - prisma/seed-data/excel/facilities.csv (200 rows)
 * - prisma/seed-data/excel/doctors.csv (1000 rows)
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const facilitiesPath = path.join(__dirname, "seed-data", "excel", "facilities.csv");
const doctorsPath = path.join(__dirname, "seed-data", "excel", "doctors.csv");
import {
  FacilityType,
  VerificationStatus,
  ListingTier,
  ThanaType,
  AreaType,
} from "@prisma/client";
import { prisma } from "../src/lib/prisma";
import { slugify } from "../src/lib/slug";

// Standard RFC-4180 inline CSV parser
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          currentField += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        currentField += char;
        i++;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
      } else if (char === ",") {
        currentRow.push(currentField);
        currentField = "";
        i++;
      } else if (char === "\r") {
        if (i + 1 < text.length && text[i + 1] === "\n") {
          i++;
        }
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = "";
        i++;
      } else if (char === "\n") {
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = "";
        i++;
      } else {
        currentField += char;
        i++;
      }
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows.filter(
    (row) => row.length > 1 || (row.length === 1 && row[0].trim() !== "")
  );
}

function csvToObjects(text: string): Record<string, string>[] {
  const rows = parseCsv(text);
  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = row[idx] ? row[idx].trim() : "";
    });
    return obj;
  });
}

function toInt(val: string | undefined): number | null {
  if (!val) return null;
  const parsed = parseInt(val.trim(), 10);
  return isNaN(parsed) ? null : parsed;
}

function toFloat(val: string | undefined): number | null {
  if (!val) return null;
  const parsed = parseFloat(val.trim());
  return isNaN(parsed) ? null : parsed;
}

function splitList(val: string | undefined, sep = ";"): string[] {
  if (!val) return [];
  return val
    .split(sep)
    .map((s) => s.trim())
    .filter(Boolean);
}

function to24h(t: string): string | null {
  if (!t) return null;
  const clean = t.trim();
  const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  let h = parseInt(match[1], 10);
  const m = match[2];
  const period = match[3].toUpperCase();

  if (period === "PM" && h < 12) h += 12;
  if (period === "AM" && h === 12) h = 0;

  return `${h.toString().padStart(2, "0")}:${m}`;
}

function dayNameToNum(dayStr: string): number | null {
  const clean = dayStr.trim().toLowerCase();
  switch (clean) {
    case "sun":
    case "sunday":
      return 0;
    case "mon":
    case "monday":
      return 1;
    case "tue":
    case "tuesday":
      return 2;
    case "wed":
    case "wednesday":
      return 3;
    case "thu":
    case "thursday":
      return 4;
    case "fri":
    case "friday":
      return 5;
    case "sat":
    case "saturday":
      return 6;
    default:
      return null;
  }
}

function uniqueSlug(baseStr: string, usedSet: Set<string>): string {
  const base = slugify(baseStr) || "unknown";
  let slug = base;
  let counter = 2;
  while (usedSet.has(slug)) {
    slug = `${base}-${counter++}`;
  }
  usedSet.add(slug);
  return slug;
}

async function main() {
  console.log("=== Starting Excel/CSV Seed ===");

  // Phase 0 — Preflight
  console.log("Phase 0 — Preflight: Reading CSV files...");
  if (!fs.existsSync(facilitiesPath)) {
    throw new Error(`Facilities CSV file not found at ${facilitiesPath}`);
  }
  if (!fs.existsSync(doctorsPath)) {
    throw new Error(`Doctors CSV file not found at ${doctorsPath}`);
  }

  const facilitiesContent = fs.readFileSync(facilitiesPath, "utf-8");
  const doctorsContent = fs.readFileSync(doctorsPath, "utf-8");

  const facilityRows = csvToObjects(facilitiesContent);
  const doctorRows = csvToObjects(doctorsContent);

  if (facilityRows.length === 0) {
    throw new Error("Facilities CSV is empty or headers are missing");
  }
  if (doctorRows.length === 0) {
    throw new Error("Doctors CSV is empty or headers are missing");
  }

  const requiredFacilityHeaders = ["Facility ID", "Name", "Type", "City", "Division", "Area"];
  for (const h of requiredFacilityHeaders) {
    if (!(h in facilityRows[0])) {
      throw new Error(`Facilities CSV missing required header: ${h}`);
    }
  }

  const requiredDoctorHeaders = ["Doctor ID", "Full Name", "Specialty", "Facility ID"];
  for (const h of requiredDoctorHeaders) {
    if (!(h in doctorRows[0])) {
      throw new Error(`Doctors CSV missing required header: ${h}`);
    }
  }

  console.log(`Preflight complete: ${facilityRows.length} facility rows, ${doctorRows.length} doctor rows found.`);

  // Phase 1 — Wipe
  console.log("Phase 1 — Wipe: Cleaning up existing doctor and facility records...");
  const [
    delApp,
    delSch,
    delCha,
    delDocSpec,
    delDoc,
    delFacAmenity,
    delFacServ,
    delFacDept,
    delFacImg,
    delFac,
  ] = await prisma.$transaction([
    prisma.appointment.deleteMany({}),
    prisma.schedule.deleteMany({}),
    prisma.chamber.deleteMany({}),
    prisma.doctorSpecialty.deleteMany({}),
    prisma.doctor.deleteMany({}),
    prisma.facilityAmenity.deleteMany({}),
    prisma.facilityService.deleteMany({}),
    prisma.facilityDepartment.deleteMany({}),
    prisma.facilityImage.deleteMany({}),
    prisma.facility.deleteMany({}),
  ]);

  console.log("Wipe summary:");
  console.log(`  Appointments deleted       : ${delApp.count}`);
  console.log(`  Schedules deleted          : ${delSch.count}`);
  console.log(`  Chambers deleted           : ${delCha.count}`);
  console.log(`  DoctorSpecialties deleted   : ${delDocSpec.count}`);
  console.log(`  Doctors deleted            : ${delDoc.count}`);
  console.log(`  FacilityAmenities deleted  : ${delFacAmenity.count}`);
  console.log(`  FacilityServices deleted   : ${delFacServ.count}`);
  console.log(`  FacilityDepartments deleted : ${delFacDept.count}`);
  console.log(`  FacilityImages deleted     : ${delFacImg.count}`);
  console.log(`  Facilities deleted         : ${delFac.count}`);

  // Phase 2 — Geography upsert
  console.log("Phase 2 — Geography upsert...");
  const areaIdMap = new Map<string, string>(); // "City|Area" -> areaId
  const usedAreaSlugs = new Set<string>();

  // Fetch existing area slugs to avoid DB unique constraint collisions
  const existingAreas = await prisma.area.findMany({ select: { id: true, slug: true, name: true, thanaId: true } });
  for (const ea of existingAreas) {
    usedAreaSlugs.add(ea.slug);
  }

  // Extract unique (Division, City, Area) tuples from facilities CSV
  const geoTuplesMap = new Map<string, { division: string; city: string; area: string }>();
  for (const fRow of facilityRows) {
    const divName = fRow["Division"]?.trim();
    const cityName = fRow["City"]?.trim();
    const areaName = fRow["Area"]?.trim();

    if (divName && cityName && areaName) {
      const key = `${cityName}|${areaName}`;
      if (!geoTuplesMap.has(key)) {
        geoTuplesMap.set(key, { division: divName, city: cityName, area: areaName });
      }
    }
  }

  let areasCreatedCount = 0;
  let areasReusedCount = 0;

  for (const { division: divName, city: cityName, area: areaName } of geoTuplesMap.values()) {
    const key = `${cityName}|${areaName}`;

    // 1. Division
    let division = await prisma.division.findUnique({ where: { name: divName } });
    if (!division) {
      division = await prisma.division.create({ data: { name: divName } });
    }

    // 2. District by (divisionId, name=cityName)
    let district = await prisma.district.findUnique({
      where: { divisionId_name: { divisionId: division.id, name: cityName } },
    });
    if (!district) {
      district = await prisma.district.create({
        data: { divisionId: division.id, name: cityName },
      });
    }

    // 3. Thana by (districtId, name=cityName)
    let thana = await prisma.thana.findUnique({
      where: { districtId_name: { districtId: district.id, name: cityName } },
    });
    if (!thana) {
      thana = await prisma.thana.create({
        data: {
          districtId: district.id,
          name: cityName,
          type: ThanaType.METROPOLITAN_THANA,
        },
      });
    }

    // 4. Area
    const baseAreaSlug = slugify(areaName);
    let area = await prisma.area.findUnique({ where: { slug: baseAreaSlug } });

    if (area) {
      areasReusedCount++;
      areaIdMap.set(key, area.id);
    } else {
      let existingByThana = await prisma.area.findUnique({
        where: { thanaId_name: { thanaId: thana.id, name: areaName } },
      });

      if (existingByThana) {
        areasReusedCount++;
        areaIdMap.set(key, existingByThana.id);
      } else {
        const areaSlug = uniqueSlug(areaName, usedAreaSlugs);
        area = await prisma.area.create({
          data: {
            thanaId: thana.id,
            name: areaName,
            slug: areaSlug,
            type: AreaType.NEIGHBOURHOOD,
          },
        });
        areasCreatedCount++;
        areaIdMap.set(key, area.id);
      }
    }
  }

  console.log(`Geography setup complete: ${areasCreatedCount} areas created, ${areasReusedCount} areas reused.`);

  // Phase 3 — Import facilities
  console.log("Phase 3 — Import facilities...");
  const usedFacilitySlugs = new Set<string>();
  const facilityMap = new Map<string, { id: string; address: string | null; areaId: string }>();

  let facilityCount = 0;
  for (const fRow of facilityRows) {
    facilityCount++;
    const name = fRow["Name"]?.trim();
    if (!name) continue;

    const fSlug = uniqueSlug(name, usedFacilitySlugs);
    const typeStr = fRow["Type"]?.trim().toLowerCase();
    let type: FacilityType = FacilityType.CLINIC;
    if (typeStr === "hospital") type = FacilityType.HOSPITAL;
    if (typeStr === "diagnostic center") type = FacilityType.DIAGNOSTIC_CENTER;

    const cityName = fRow["City"]?.trim() || "";
    const areaName = fRow["Area"]?.trim() || "";
    const geoKey = `${cityName}|${areaName}`;
    const areaId = areaIdMap.get(geoKey);

    if (!areaId) {
      throw new Error(`Facility ${fRow["Facility ID"]} (${name}) has unmapped Area/City: ${geoKey}`);
    }

    const icuBeds = toInt(fRow["ICU Beds"]);
    const nicuBeds = toInt(fRow["NICU Beds"]);

    const deptsList = splitList(fRow["Departments / Specialties"], ";");
    const insuranceList = splitList(fRow["Insurance / Panels Accepted"], ";").filter(
      (v) => v.toLowerCase() !== "none"
    );

    const facility = await prisma.facility.create({
      data: {
        name,
        slug: fSlug,
        type,
        ownership: fRow["Ownership"] || null,
        address: fRow["Full Address"] || null,
        establishedYear: toInt(fRow["Established (Year)"]),
        beds: toInt(fRow["Total Beds"]),
        icuBeds,
        nicuBeds,
        operationTheaters: toInt(fRow["Operation Theaters"]),
        hasIcu: (icuBeds ?? 0) > 0,
        hasNicu: (nicuBeds ?? 0) > 0,
        hasEmergency: (fRow["Emergency Service"] || "").trim().toLowerCase().startsWith("yes"),
        hasAmbulance: (fRow["Ambulance"] || "").trim().toLowerCase() === "yes",
        hasBloodBank: (fRow["Blood Bank"] || "").trim().toLowerCase() === "yes",
        hasPharmacy: (fRow["Pharmacy"] || "").trim().toLowerCase() === "yes",
        hasPathologyLab: (fRow["In-house Pathology Lab"] || "").trim().toLowerCase() === "yes",
        hasHomeSampleCollection: (fRow["Home Sample Collection"] || "").trim().toLowerCase() === "yes",
        hasOnlineReport: (fRow["Online Report Access"] || "").trim().toLowerCase() === "yes",
        hasParkingAvailable: (fRow["Parking Available"] || "").trim().toLowerCase() === "yes",
        diagnosticTests: splitList(fRow["Diagnostic Tests Offered"], ";"),
        imagingServices: splitList(fRow["Imaging / Procedures Offered"], ";"),
        accreditation: fRow["Accreditation"] || null,
        insurancePanels: insuranceList,
        openingHours: fRow["Opening Hours"] || null,
        phone: fRow["Phone (Dummy)"] || null,
        emergencyPhone: fRow["Emergency Phone (Dummy)"] || null,
        mobile: fRow["Mobile (Dummy)"] || null,
        email: fRow["Email (Dummy)"] || null,
        website: fRow["Website (Dummy)"] || null,
        dghsLicenceNo: fRow["DGHS Licence No. (Dummy)"] || null,
        rating: toFloat(fRow["Rating (out of 5)"]),
        totalReviews: toInt(fRow["Reviews"]),
        doctorsOnPanel: toInt(fRow["Doctors on Panel"]),
        latitude: toFloat(fRow["Latitude (approx.)"]),
        longitude: toFloat(fRow["Longitude (approx.)"]),
        description: fRow["Short Description"] || null,
        verificationStatus: VerificationStatus.VERIFIED,
        listingTier: ListingTier.VERIFIED,
        areaId,
        departments: {
          create: deptsList.map((deptName) => ({ name: deptName })),
        },
      },
    });

    const facilityCsvId = fRow["Facility ID"]?.trim();
    if (facilityCsvId) {
      facilityMap.set(facilityCsvId, {
        id: facility.id,
        address: facility.address,
        areaId: facility.areaId,
      });
    }

    if (facilityCount % 50 === 0) {
      console.log(`Imported ${facilityCount} / ${facilityRows.length} facilities...`);
    }
  }
  console.log(`Facilities import complete: ${facilityCount} facilities created.`);

  // Phase 4 — Import doctors
  console.log("Phase 4 — Import doctors...");
  const usedDoctorSlugs = new Set<string>();
  const usedBmdcRegNos = new Set<string>();
  const specialtyMap = new Map<string, string>(); // slug -> specialtyId

  let doctorCount = 0;
  let chamberCount = 0;
  let scheduleCount = 0;
  let specialtiesCreatedCount = 0;

  for (const dRow of doctorRows) {
    doctorCount++;
    const name = dRow["Full Name"]?.trim();
    if (!name) continue;

    // Specialty handling
    const specName = dRow["Specialty"]?.trim() || "General";
    const specSlug = slugify(specName) || "general";
    let specialtyId = specialtyMap.get(specSlug);

    if (!specialtyId) {
      const existingSpec = await prisma.specialty.findUnique({ where: { slug: specSlug } });
      if (existingSpec) {
        specialtyId = existingSpec.id;
      } else {
        const createdSpec = await prisma.specialty.create({
          data: { name: specName, slug: specSlug },
        });
        specialtyId = createdSpec.id;
        specialtiesCreatedCount++;
      }
      specialtyMap.set(specSlug, specialtyId);
    }

    // BMDC Reg No deduplication
    let bmdcNo: string | null = dRow["BMDC Reg. No. (Dummy)"]?.trim() || null;
    if (bmdcNo) {
      if (usedBmdcRegNos.has(bmdcNo)) {
        bmdcNo = `${bmdcNo}-${doctorCount}`;
      }
      usedBmdcRegNos.add(bmdcNo);
    }

    const docSlug = uniqueSlug(name, usedDoctorSlugs);
    const consultationFee = toFloat(dRow["Consultation Fee (BDT)"]);

    // Chamber & Schedules setup
    const facCsvId = dRow["Facility ID"]?.trim();
    const facilityInfo = facCsvId ? facilityMap.get(facCsvId) : null;

    let chambersData: any = undefined;

    if (facilityInfo) {
      const daysRaw = splitList(dRow["Available Days"], ",");
      const validDayNums = daysRaw
        .map(dayNameToNum)
        .filter((n): n is number => n !== null);

      const hoursRaw = dRow["Visiting Hours"]?.trim() || "";
      const [startStr, endStr] = hoursRaw.split("-").map((s) => s.trim());
      const startTime = startStr ? to24h(startStr) : null;
      const endTime = endStr ? to24h(endStr) : null;

      const scheduleCreates: { dayOfWeek: number; startTime: string; endTime: string }[] = [];
      if (startTime && endTime && validDayNums.length > 0) {
        for (const dayNum of validDayNums) {
          scheduleCreates.push({
            dayOfWeek: dayNum,
            startTime,
            endTime,
          });
        }
      }

      chambersData = {
        create: [
          {
            facilityId: facilityInfo.id,
            areaId: facilityInfo.areaId,
            address: facilityInfo.address,
            consultationFee,
            isActive: true,
            schedules:
              scheduleCreates.length > 0
                ? {
                    create: scheduleCreates.map((s) => ({
                      dayOfWeek: s.dayOfWeek,
                      startTime: s.startTime,
                      endTime: s.endTime,
                      slotDurationMinutes: 15,
                      maxPatients: 20,
                      isActive: true,
                    })),
                  }
                : undefined,
          },
        ],
      };

      chamberCount++;
      scheduleCount += scheduleCreates.length;
    }

    try {
      await prisma.doctor.create({
        data: {
          name,
          slug: docSlug,
          gender: dRow["Gender"]?.trim() || null,
          expertise: dRow["Expertise / Sub-specialty"] || null,
          degrees: splitList(dRow["Qualifications"], ","),
          medicalCollege: dRow["Medical College (MBBS)"] || null,
          pgInstitution: dRow["Postgraduate Institution"] || null,
          yearsExperience: toInt(dRow["Experience (Years)"]),
          currentPosition: dRow["Designation"] || null,
          bmdcRegNo: bmdcNo,
          languages: splitList(dRow["Languages"], ","),
          consultationFee,
          phone: dRow["Phone (Dummy)"] || null,
          email: dRow["Email (Dummy)"] || null,
          rating: toFloat(dRow["Rating (out of 5)"]),
          totalReviews: toInt(dRow["Reviews"]),
          patientsTreated: toInt(dRow["Patients Treated"]),
          hasOnlineConsultation: (dRow["Online Consultation"] || "").trim().toLowerCase() === "yes",
          bio: dRow["Short Bio"] || null,
          verificationStatus: VerificationStatus.VERIFIED,
          listingTier: ListingTier.VERIFIED,
          specialties: {
            create: [{ specialtyId }],
          },
          chambers: chambersData,
        },
      });
    } catch (err) {
      console.error(`Error importing doctor row #${doctorCount} (ID: ${dRow["Doctor ID"]}, Name: ${name}):`, err);
      throw err;
    }

    if (doctorCount % 100 === 0) {
      console.log(`Imported ${doctorCount} / ${doctorRows.length} doctors...`);
    }
  }

  console.log("\n=== Seed Summary ===");
  console.log(`Facilities Created   : ${facilityCount}`);
  console.log(`Doctors Created      : ${doctorCount}`);
  console.log(`Chambers Created     : ${chamberCount}`);
  console.log(`Schedules Created    : ${scheduleCount}`);
  console.log(`Specialties Created  : ${specialtiesCreatedCount}`);
  console.log(`Areas Created/Reused : ${areasCreatedCount} created, ${areasReusedCount} reused`);
}

main()
  .then(async () => {
    console.log("Excel seed completed successfully.");
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error("Excel seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
