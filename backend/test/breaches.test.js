import assert from "node:assert/strict";
import test from "node:test";
import {
  normaliseBreaches,
  parseLimit,
} from "../src/routes/breaches.js";

test("breach limit uses a safe range", () => {
  assert.equal(parseLimit(undefined), 6);
  assert.equal(parseLimit("0"), 1);
  assert.equal(parseLimit("4"), 4);
  assert.equal(parseLimit("100"), 12);
});

test("breach records are filtered, sorted and reduced to dashboard fields", () => {
  const result = normaliseBreaches([
    {
      Name: "OlderVerified",
      Title: "Older Verified Breach",
      Domain: "older.example",
      BreachDate: "2025-01-01",
      AddedDate: "2025-02-01T00:00:00Z",
      PwnCount: 100,
      DataClasses: ["Email addresses"],
      IsVerified: true,
      IsSpamList: false,
      IsRetired: false,
    },
    {
      Name: "Unverified",
      Title: "Unverified Breach",
      AddedDate: "2026-03-01T00:00:00Z",
      IsVerified: false,
    },
    {
      Name: "LatestVerified",
      Title: "Latest Verified Breach",
      Domain: "latest.example",
      BreachDate: "2026-01-10",
      AddedDate: "2026-02-10T00:00:00Z",
      PwnCount: 250,
      DataClasses: ["Email addresses", "Passwords"],
      IsVerified: true,
      IsSpamList: false,
      IsRetired: false,
    },
  ]);

  assert.equal(result.length, 2);
  assert.equal(result[0].name, "LatestVerified");
  assert.equal(result[0].affectedAccounts, 250);
  assert.deepEqual(result[0].dataClasses, ["Email addresses", "Passwords"]);
  assert.equal(result[1].name, "OlderVerified");
});
