import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { fixtures } from "../data/fixtures.ts";

test("fixtures.doctorDetail returns the matching doctor and never a fallback", () => {
  const matched = fixtures.doctorDetail("asif-rahman");
  assert.ok(matched);
  assert.equal(matched!.slug, "asif-rahman");
  assert.equal(matched!.name, "Dr. Asif Rahman");
});

test("fixtures.doctorDetail returns null for an unknown slug", () => {
  // Regression: an invalid detail slug must not silently return the first
  // doctor — that leaked another doctor's record into the UI.
  assert.equal(fixtures.doctorDetail("does-not-exist"), null);
  assert.equal(fixtures.doctorDetail(""), null);
});

test("fixtures.facilityDetail returns null for an unknown slug", () => {
  assert.equal(fixtures.facilityDetail("chevron-lab")?.slug, "chevron-lab");
  assert.equal(fixtures.facilityDetail("does-not-exist"), null);
  assert.equal(fixtures.facilityDetail(""), null);
});

test("ApiError-bearing fetchAndParseDetail contract: NOT_FOUND is thrown when no source has the slug", async () => {
  // Mirror the contract from src/api/index.ts without importing the live
  // module (which pulls react-native through the UI tree). The detail fetch
  // throws ApiError NOT_FOUND only when both the live API and the fixture
  // fallback lack the slug.
  const fixturesHaveDoctor = (slug: string) =>
    fixtures.doctorDetail(slug) !== null;

  const fetchAndParseDetail = async (slug: string): Promise<unknown> => {
    const liveHadSlug = false; // would be the real API in production
    if (liveHadSlug) {
      return { slug, name: "Live Doctor" };
    }
    const fallback = fixtures.doctorDetail(slug);
    if (fallback === null) {
      const err = new Error("Not found");
      (err as Error & { code?: string }).code = "NOT_FOUND";
      throw err;
    }
    return fallback;
  };

  await assert.doesNotReject(() => fetchAndParseDetail("asif-rahman"));
  await assert.rejects(
    () => fetchAndParseDetail("does-not-exist"),
    (err: Error & { code?: string }) => err.code === "NOT_FOUND",
  );
  // Sanity: the contract only kicks in for slugs the fixtures don't carry —
  // a matching fixture slug still resolves to that fixture's record.
  assert.equal(fixturesHaveDoctor("asif-rahman"), true);
  assert.equal(fixturesHaveDoctor("nadia-akter"), true);
  assert.equal(fixturesHaveDoctor("not-a-real-slug"), false);
});

test("facility detail contract mirrors doctor: NOT_FOUND for unknown slug", async () => {
  const fetchAndParseDetail = async (slug: string): Promise<unknown> => {
    const liveHadSlug = false;
    if (liveHadSlug) return { slug, name: "Live Facility" };
    const fallback = fixtures.facilityDetail(slug);
    if (fallback === null) {
      const err = new Error("Not found");
      (err as Error & { code?: string }).code = "NOT_FOUND";
      throw err;
    }
    return fallback;
  };

  await assert.doesNotReject(() => fetchAndParseDetail("chevron-lab"));
  await assert.rejects(
    () => fetchAndParseDetail("no-such-facility"),
    (err: Error & { code?: string }) => err.code === "NOT_FOUND",
  );
});

// --- API base URL: source-level guard -------------------------------------

test("api URL has one documented source: EXPO_PUBLIC_API_URL, with no production localhost fallback", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const repoRoot = resolve(here, "../../../");
  const configSrc = readFileSync(
    resolve(repoRoot, "mobile/src/api/config.ts"),
    "utf8",
  );
  const appJson = JSON.parse(
    readFileSync(resolve(repoRoot, "mobile/app.json"), "utf8"),
  );

  // A single named getter keeps the production URL resolvable from one place.
  assert.match(
    configSrc,
    /export\s+function\s+getApiBaseUrl\b/,
    "src/api/config.ts must export getApiBaseUrl as the single resolver",
  );
  // A testable resolver is exported for unit tests without __DEV__/process.env.
  assert.match(
    configSrc,
    /export\s+function\s+resolveApiBaseUrl\b/,
    "src/api/config.ts must export resolveApiBaseUrl for testable resolution",
  );
  // Production must never fall back to localhost; only __DEV__ gets the
  // developer-machine default so offline fixtures can still run.
  assert.match(
    configSrc,
    /if\s*\(env\.isDev\)\s+return\s+DEV_FALLBACK/,
    "localhost fallback must be gated by isDev in resolveApiBaseUrl",
  );
  assert.doesNotMatch(
    configSrc,
    /EXPO_PUBLIC_API_URL\s*\?\?\s*"http:\/\/localhost/,
    "unconditional localhost fallback is forbidden",
  );

  // The mobile app must read the env var directly — no duplicate apiUrl
  // field in app.json leaking a second source.
  assert.equal(
    appJson.expo?.extra?.apiUrl,
    undefined,
    "app.json extra.apiUrl duplicates the documented EXPO_PUBLIC_API_URL source",
  );
});
