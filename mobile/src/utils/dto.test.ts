import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseDoctor,
  parseDoctorDetail,
  parseDoctorsListResponse,
  parseFacility,
  parseFacilitiesListResponse,
  parseFacilityDetail,
  parseFilters,
  parseHomePayload,
} from "./dto.ts";

// --- v1 public shapes --------------------------------------------------------

test("parseDoctor handles nested v1 specialties and chamber refs", () => {
  const parsed = parseDoctor({
    id: "1",
    slug: "x",
    name: "Dr. X",
    degrees: ["MBBS"],
    currentPosition: "Consultant",
    specialties: [{ specialty: { name: "Medicine", slug: "medicine" } }],
    chambers: [
      {
        facility: { name: "Chevron Lab" },
        area: { name: "Khulshi" },
        consultationFee: "500",
      },
    ],
  });
  assert.ok(parsed);
  assert.equal(parsed!.name, "Dr. X");
  assert.equal(parsed!.specialties[0].slug, "medicine");
  assert.equal(parsed!.chambers[0].area?.name, "Khulshi");
  assert.equal(parsed!.chambers[0].consultationFee, "500");
});

test("parseDoctor drops items missing id/slug/name", () => {
  assert.equal(parseDoctor({ id: "1", slug: "x" }), null);
  assert.equal(parseDoctor(null), null);
});

test("parseDoctor tolerates flat legacy specialty entries", () => {
  const parsed = parseDoctor({
    id: "1",
    slug: "x",
    name: "Dr. X",
    specialties: [{ name: "A", slug: "a" }],
  });
  assert.ok(parsed);
  assert.deepEqual(parsed!.specialties, [{ name: "A", slug: "a" }]);
});

test("parseFacility keeps top-level phone and emergency flag", () => {
  const parsed = parseFacility({
    id: "1",
    slug: "x",
    name: "Lab",
    type: "DIAGNOSTIC_CENTER",
    area: { name: "Khulshi" },
    address: null,
    phone: "+880317112233",
    hasEmergency: true,
  });
  assert.ok(parsed);
  assert.equal(parsed!.type, "DIAGNOSTIC_CENTER");
  assert.equal(parsed!.phone, "+880317112233");
  assert.equal(parsed!.contact.phone, "+880317112233");
});

test("parseDoctorDetail carries through achievements and schedules", () => {
  const parsed = parseDoctorDetail({
    id: "1",
    slug: "x",
    name: "Dr. X",
    degrees: [],
    currentPosition: null,
    specialties: [],
    chambers: [
      {
        address: null,
        area: null,
        facility: null,
        consultationFee: "500",
        schedules: [{ dayOfWeek: "MONDAY", startTime: "09:00", endTime: "13:00" }],
      },
    ],
    achievements: "Gold medal",
  });
  assert.ok(parsed);
  assert.equal(parsed!.chambers[0].consultationFee, "500");
  assert.equal(parsed!.chambers[0].schedules[0].dayOfWeek, 1);
  assert.equal(parsed!.chambers[0].schedules[0].startTime, "09:00");
  assert.equal(parsed!.achievements, "Gold medal");
});

test("parseFacilityDetail carries amenities and services", () => {
  const parsed = parseFacilityDetail({
    id: "1",
    slug: "x",
    name: "Lab",
    type: "DIAGNOSTIC_CENTER",
    area: { name: "Khulshi" },
    amenities: [{ amenity: { name: "Parking", icon: null } }],
    services: [{ name: "Blood Test", price: 800 }],
  });
  assert.ok(parsed);
  assert.equal(parsed!.amenities[0].name, "Parking");
  assert.equal(parsed!.services[0].price, "800");
});

// --- Envelope parsers -----------------------------------------------------

test("parseDoctorsListResponse accepts a bare v1 array", () => {
  const parsed = parseDoctorsListResponse([
    { id: "1", slug: "a", name: "A" },
  ]);
  assert.equal(parsed.total, 1);
  assert.equal(parsed.results.length, 1);
});

test("parseDoctorsListResponse accepts legacy {results,total} envelope", () => {
  const parsed = parseDoctorsListResponse({
    results: [
      { id: "1", slug: "a", name: "A" },
    ],
  });
  assert.equal(parsed.total, 1);
  assert.equal(parsed.results.length, 1);
});

test("parseDoctorsListResponse returns safe empty values for malformed input", () => {
  assert.deepEqual(parseDoctorsListResponse(null), { results: [], total: 0 });
  assert.deepEqual(parseDoctorsListResponse("nope"), { results: [], total: 0 });
  assert.deepEqual(parseDoctorsListResponse({}), { results: [], total: 0 });
  const bad = parseDoctorsListResponse({ results: "oops", total: 4 });
  assert.deepEqual(bad, { results: [], total: 4 });
});

test("parseFacilitiesListResponse drops invalid entries but keeps count", () => {
  const parsed = parseFacilitiesListResponse({
    results: [
      { id: "1", slug: "a", name: "A", type: "DIAGNOSTIC_CENTER" },
      { id: "2", slug: "b" }, // missing name -> dropped
    ],
    total: 7,
  });
  assert.equal(parsed.results.length, 1);
  assert.equal(parsed.total, 7);
});

test("parseFacilitiesListResponse accepts a bare v1 array", () => {
  const parsed = parseFacilitiesListResponse([
    { id: "1", slug: "a", name: "A", type: "DIAGNOSTIC_CENTER" },
  ]);
  assert.equal(parsed.total, 1);
});

test("parseFilters accepts v1 {id,name,slug} entries", () => {
  const parsed = parseFilters({
    specialties: [{ id: "s1", name: "Medicine", slug: "medicine" }],
    areas: [{ id: "a1", name: "Khulshi" }],
  });
  assert.deepEqual(parsed.specialties, [{ value: "medicine", label: "Medicine" }]);
  assert.deepEqual(parsed.areas, [{ value: "a1", label: "Khulshi" }]);
});

test("parseFilters drops invalid options and tolerates missing fields", () => {
  const parsed = parseFilters({
    specialties: [
      { value: "x", label: "X" },
      { value: "" },
      null,
    ],
    areas: [{ value: "khulshi", label: "Khulshi" }],
  });
  assert.deepEqual(parsed.specialties, [{ value: "x", label: "X" }]);
  assert.deepEqual(parsed.areas, [{ value: "khulshi", label: "Khulshi" }]);
  assert.deepEqual(parseFilters(null), { specialties: [], areas: [] });
});

test("parseHomePayload defaults the city and drops bad records", () => {
  const parsed = parseHomePayload({
    context: { city: "Chattogram", note: "" },
    suggestedDoctors: [{ id: "1", slug: "a", name: "A" }],
    newlyAvailableDoctors: "oops",
    recentlyVerifiedDoctors: [],
    suggestedFacilities: [
      { id: "f1", slug: "lab", name: "Lab", type: "DIAGNOSTIC_CENTER" },
    ],
    nearbyFacilities: [],
  });
  assert.equal(parsed.context.city, "Chattogram");
  assert.equal(parsed.context.country, "Bangladesh");
  assert.equal(parsed.suggestedDoctors.length, 1);
  assert.deepEqual(parsed.newlyAvailableDoctors, []);
  assert.equal(parsed.suggestedFacilities.length, 1);
  assert.deepEqual(parsed.nearbyFacilities, []);
});
