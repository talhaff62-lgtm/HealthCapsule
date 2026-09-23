import { test } from "node:test";
import assert from "node:assert/strict";
import { createStaleGuard } from "./stale-guard.ts";

test("older tokens become stale after next()", () => {
  const guard = createStaleGuard();
  const first = guard.next();
  assert.equal(guard.isCurrent(first), true);
  const second = guard.next();
  assert.equal(guard.isCurrent(first), false);
  assert.equal(guard.isCurrent(second), true);
});

test("out-of-order resolution keeps the latest", async () => {
  const guard = createStaleGuard();
  const first = guard.next();
  const second = guard.next();
  // Simulate the older request resolving second.
  const olderResolvesLast = new Promise((resolve) => {
    setImmediate(() => {
      if (guard.isCurrent(first)) resolve("OLD");
    });
  });
  const newerResolvesFirst = new Promise((resolve) => {
    queueMicrotask(() => {
      if (guard.isCurrent(second)) resolve("NEW");
    });
  });
  const winner = await Promise.race([olderResolvesLast, newerResolvesFirst]);
  assert.equal(winner, "NEW");
});
