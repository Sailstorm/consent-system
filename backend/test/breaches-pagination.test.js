import assert from "node:assert/strict";
import test from "node:test";
import express from "express";
import { breachesRouter, normaliseBreaches, paginateBreaches, parseLimit, parsePage } from "../src/routes/breaches.js";

const raw = Array.from({ length: 25 }, (_, i) => ({
  Name: `Service${i + 1}`,
  Title: `Service ${i + 1}`,
  Domain: i === 0 ? "special.example" : `service${i + 1}.example`,
  AddedDate: new Date(Date.UTC(2026, 0, i + 1)).toISOString(),
  BreachDate: "2025-01-01",
  PwnCount: 100 + i,
  DataClasses: ["Email addresses"],
  IsVerified: true,
}));

test("legacy limit and invalid pages have safe defaults", () => {
  assert.equal(parseLimit(undefined), 6);
  assert.equal(parseLimit("0"), 1);
  assert.equal(parseLimit("100"), 12);
  for (const value of [undefined, "abc", "-2", "0", "2.5", "Infinity"]) {
    assert.equal(parsePage(value), 1);
  }
  assert.equal(parsePage("3"), 3);
});

test("normalisation retains more than twelve eligible records", () => {
  const result = normaliseBreaches(raw);
  assert.equal(result.length, 25);
  assert.equal(result[0].name, "Service25");
  assert.equal(result[24].name, "Service1");
  assert.deepEqual(result[0].dataClasses, ["Email addresses"]);
  assert.equal(result[0].affectedAccounts, 124);
});

test("unverified, spam-list and retired records are excluded", () => {
  assert.equal(normaliseBreaches([
    ...raw,
    { ...raw[0], IsVerified: false },
    { ...raw[0], IsSpamList: true },
    { ...raw[0], IsRetired: true },
    null,
  ]).length, 25);
  assert.deepEqual(normaliseBreaches(null), []);
});

test("six-per-page pagination can access all records without duplicates", () => {
  const rows = normaliseBreaches(raw);
  const pages = Array.from({ length: 5 }, (_, i) => paginateBreaches(rows, { page: i + 1 }));
  assert.deepEqual(pages.map((p) => p.breaches.length), [6, 6, 6, 6, 1]);
  assert.equal(pages[0].totalPages, 5);
  assert.equal(pages[0].hasPreviousPage, false);
  assert.equal(pages[0].hasNextPage, true);
  assert.equal(pages[4].hasNextPage, false);
  assert.equal(new Set(pages.flatMap((p) => p.breaches.map((b) => b.name))).size, 25);
});

test("search is case-insensitive, trimmed, and covers records beyond page one", () => {
  const rows = normaliseBreaches(raw);
  for (const search of [" SERVICE 1 ", "Service1", "SPECIAL.EXAMPLE"]) {
    const firstPage = paginateBreaches(rows, { search });
    const result = paginateBreaches(rows, { search, page: firstPage.totalPages });
    assert.ok(result.breaches.some((b) => b.name === "Service1"));
    assert.equal(result.totalAvailable, 25);
  }
});

test("no results and out-of-range pages are handled consistently", () => {
  const rows = normaliseBreaches(raw);
  const none = paginateBreaches(rows, { search: "does-not-exist", page: 99 });
  assert.equal(none.total, 0);
  assert.equal(none.totalPages, 0);
  assert.equal(none.page, 1);
  assert.equal(none.hasNextPage, false);
  assert.equal(none.hasPreviousPage, false);
  assert.deepEqual(none.breaches, []);
  assert.equal(paginateBreaches(rows, { page: 99 }).page, 5);
});

test("HTTP route supports legacy limit, search, pagination, cache and stale fallback", async () => {
  const app = express();
  app.use("/api/breaches/latest", breachesRouter);
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const url = `http://127.0.0.1:${server.address().port}/api/breaches/latest`;
  const realFetch = globalThis.fetch;
  const realNow = Date.now;
  const realError = console.error;
  let calls = 0;
  let fail = false;
  let now = realNow();
  Date.now = () => now;
  globalThis.fetch = async (input, options) => {
    if (String(input).startsWith("https://haveibeenpwned.com/")) {
      calls++;
      if (fail) throw new Error("Simulated timeout");
      assert.equal(options.headers["User-Agent"], "Consent-Assistant/1.0");
      return new Response(JSON.stringify(raw), { status: 200 });
    }
    return realFetch(input, options);
  };
  try {
    // No cache and failed upstream must be a 502, not an empty success.
    fail = true;
    console.error = () => {};
    assert.equal((await realFetch(url)).status, 502);
    fail = false;
    const first = await (await realFetch(`${url}?limit=6`)).json();
    assert.equal(first.breaches.length, 6);
    assert.equal(first.total, 25);
    assert.equal(first.cached, false);
    const second = await (await realFetch(`${url}?page=2&pageSize=6`)).json();
    assert.equal(second.page, 2);
    assert.equal(second.breaches[0].name, "Service19");
    assert.equal(second.cached, true);
    const search = await (await realFetch(`${url}?search=SPECIAL.EXAMPLE`)).json();
    assert.equal(search.total, 1);
    assert.equal(search.breaches[0].name, "Service1");
    assert.equal(calls, 2);
    assert.equal((await realFetch(`${url}?search=${"a".repeat(201)}`)).status, 400);
    now += 6 * 60 * 60 * 1000 + 1;
    fail = true;
    const stale = await (await realFetch(`${url}?page=5`)).json();
    assert.equal(stale.stale, true);
    assert.equal(stale.breaches.length, 1);
    assert.equal(stale.fetchedAt, first.fetchedAt);
  } finally {
    globalThis.fetch = realFetch;
    Date.now = realNow;
    console.error = realError;
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});
