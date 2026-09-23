import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeBangladeshMobile, whatsappUriFor, telUriFor } from "./phone.ts";

test("normalizes 11-digit BD mobile to +880XXXXXXXXXX", () => {
  assert.equal(normalizeBangladeshMobile("01711223344"), "+8801711223344");
});

test("accepts +88 and 88 prefixes", () => {
  assert.equal(normalizeBangladeshMobile("+8801711223344"), "+8801711223344");
  assert.equal(normalizeBangladeshMobile("8801711223344"), "+8801711223344");
});

test("strips spaces, dashes, and parentheses", () => {
  assert.equal(normalizeBangladeshMobile("01711 223 344"), "+8801711223344");
  assert.equal(normalizeBangladeshMobile("(0171)-122-3344"), "+8801711223344");
});

test("rejects invalid lengths and prefixes", () => {
  assert.equal(normalizeBangladeshMobile("01234567890"), null);
  assert.equal(normalizeBangladeshMobile("02011223344"), null);
  assert.equal(normalizeBangladeshMobile(""), null);
  assert.equal(normalizeBangladeshMobile(null), null);
});

test("whatsappUriFor requires normalized BD mobile", () => {
  assert.equal(whatsappUriFor("01711223344"), "https://wa.me/8801711223344");
  assert.equal(whatsappUriFor("02011223344"), null);
});

test("telUriFor returns tel: URI for any phone string", () => {
  assert.equal(telUriFor("+880 31 711 2233"), "tel:+880317112233");
  assert.equal(telUriFor(null), null);
});
