import { test } from "node:test";
import assert from "node:assert/strict";
import { parseHomePayload } from "./dto.ts";

test("suggestedFacilities only contains facilities with suggested=true; nearbyFacilities is separate", () => {
  const raw = {
    context: { city: "Chattogram", country: "Bangladesh", note: "" },
    suggestedFacilities: [
      { id: "f1", slug: "popular", name: "Popular", type: "DIAGNOSTIC_CENTER", flags: { verified: true, suggested: true, new: false } },
    ],
    nearbyFacilities: [
      { id: "f1", slug: "popular", name: "Popular", type: "DIAGNOSTIC_CENTER", flags: { verified: true, suggested: true, new: false } },
      { id: "f2", slug: "chevron", name: "Chevron", type: "DIAGNOSTIC_CENTER", flags: { verified: true, suggested: false, new: false } },
    ],
    suggestedDoctors: [],
    newlyAvailableDoctors: [],
    recentlyVerifiedDoctors: [],
  };
  const parsed = parseHomePayload(raw);
  assert.equal(parsed.suggestedFacilities.length, 1);
  assert.equal(parsed.suggestedFacilities[0].flags.suggested, true);
  assert.equal(parsed.nearbyFacilities.length, 2);
});

test("empty suggestedFacilities yields section title Nearby Diagnostic Centres", () => {
  const raw = {
    context: { city: "Chattogram", country: "Bangladesh", note: "" },
    suggestedFacilities: [],
    nearbyFacilities: [
      { id: "f2", slug: "chevron", name: "Chevron", type: "DIAGNOSTIC_CENTER", flags: { verified: true, suggested: false, new: false } },
    ],
    suggestedDoctors: [],
    newlyAvailableDoctors: [],
    recentlyVerifiedDoctors: [],
  };
  const parsed = parseHomePayload(raw);
  // Client decides heading based on suggestedFacilities.length === 0.
  assert.equal(parsed.suggestedFacilities.length, 0);
  assert.equal(parsed.nearbyFacilities.length, 1);
  // Simulate client heading logic:
  const title = parsed.suggestedFacilities.length > 0
    ? "Suggested Diagnostic Centres"
    : "Nearby Diagnostic Centres";
  assert.equal(title, "Nearby Diagnostic Centres");
});

test("non-empty suggestedFacilities yields section title Suggested Diagnostic Centres", () => {
  const raw = {
    context: { city: "Chattogram", country: "Bangladesh", note: "" },
    suggestedFacilities: [
      { id: "f1", slug: "popular", name: "Popular", type: "DIAGNOSTIC_CENTER", flags: { verified: true, suggested: true, new: false } },
    ],
    nearbyFacilities: [],
    suggestedDoctors: [],
    newlyAvailableDoctors: [],
    recentlyVerifiedDoctors: [],
  };
  const parsed = parseHomePayload(raw);
  const title = parsed.suggestedFacilities.length > 0
    ? "Suggested Diagnostic Centres"
    : "Nearby Diagnostic Centres";
  assert.equal(title, "Suggested Diagnostic Centres");
});
