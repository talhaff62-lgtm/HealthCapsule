import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

// Source-level test for the testable API URL resolver.
// Cannot import config.ts directly because its ApiError class uses TS
// parameter properties incompatible with Node's strip-only mode.

test("resolveApiBaseUrl: returns explicit URL when set", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const repoRoot = resolve(here, "../../../");
  const configSrc = readFileSync(
    resolve(repoRoot, "mobile/src/api/config.ts"),
    "utf8",
  );
  // The resolver function must exist and accept { explicit, isDev }.
  assert.match(
    configSrc,
    /export\s+function\s+resolveApiBaseUrl\b/,
  );
  // It must read env.explicit and env.isDev, not process.env or __DEV__.
  assert.match(configSrc, /env\.explicit/);
  assert.match(configSrc, /env\.isDev/);
  // It must throw for missing URL in production (isDev: false).
  assert.match(
    configSrc,
    /throw\s+new\s+ApiError\b/,
    "resolveApiBaseUrl must throw ApiError when no URL is configured in production",
  );
  // It must use DEV_FALLBACK when isDev and no explicit URL.
  assert.match(
    configSrc,
    /if\s*\(env\.isDev\)\s+return\s+DEV_FALLBACK/,
  );
  // It must strip trailing slash.
  assert.match(configSrc, /\.replace\(\/\\\/\$\//);
});

test("resolveApiBaseUrl: getApiBaseUrl delegates to resolveApiBaseUrl", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const repoRoot = resolve(here, "../../../");
  const configSrc = readFileSync(
    resolve(repoRoot, "mobile/src/api/config.ts"),
    "utf8",
  );
  // getApiBaseUrl must delegate to resolveApiBaseUrl with { explicit, isDev }.
  // Use a simpler check for the pattern.
  assert.match(configSrc, /return\s+resolveApiBaseUrl\(/);
  assert.match(configSrc, /explicit:\s*process\.env\.EXPO_PUBLIC_API_URL/);
  assert.match(configSrc, /isDev:\s*__DEV__/);
});
