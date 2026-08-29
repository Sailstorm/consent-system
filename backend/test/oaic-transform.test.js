import assert from "node:assert/strict";
import test from "node:test";
import {
  number,
  parseInformationTypes,
  parseMonthly,
  parsePeopleAffected,
  parsePeriod,
  parseSectors,
  sheetByName,
} from "../src/lib/oaic-transform.js";

test("OAIC reporting periods are converted to exact date ranges", () => {
  assert.deepEqual(parsePeriod([["January - June 2025"]]), {
    periodStart: "2025-01-01",
    periodEnd: "2025-06-30",
    label: "January-June 2025",
  });
  assert.deepEqual(parsePeriod([["July - December 2025"]]), {
    periodStart: "2025-07-01",
    periodEnd: "2025-12-31",
    label: "July-December 2025",
  });
});

test("OAIC monthly causes reconcile to the published grand total", () => {
  const result = parseMonthly([
    ["Human error", 20],
    ["Malicious or criminal attack", 70],
    ["System fault", 10],
    ["Grand Total", 100],
  ]);
  assert.equal(result.totalNotifications, 100);
  assert.equal(
    result.causes.reduce((sum, row) => sum + row.notifications, 0),
    100,
  );
});

test("OAIC sector, information-type and affected-range tables are parsed", () => {
  assert.deepEqual(
    parseSectors(
      [
        ["Top sectors by source of breaches"],
        ["Health service providers", 25],
        ["Human error", 10],
        ["Finance", 15],
      ],
      100,
    ),
    [
      { sector: "Health service providers", notifications: 25, percentage: 25 },
      { sector: "Finance", notifications: 15, percentage: 15 },
    ],
  );

  assert.deepEqual(
    parseInformationTypes([
      ["Kind of personal information", "Notifications"],
      ["Contact information", 80],
      ["Identity information", 40],
    ]),
    [
      { informationType: "Contact information", notifications: 80 },
      { informationType: "Identity information", notifications: 40 },
    ],
  );

  assert.deepEqual(
    parsePeopleAffected([
      ["Range", "Notifications"],
      ["1-10", 8],
      ["11-100", 2],
      ["Grand Total", 10],
    ]),
    [
      { affectedRange: "1-10", notifications: 8, sortOrder: 1 },
      { affectedRange: "11-100", notifications: 2, sortOrder: 2 },
    ],
  );
});

test("OAIC parser rejects missing sheets and negative counts", () => {
  assert.throws(() => sheetByName([], "NDB by month"), /worksheet is missing/);
  assert.throws(() => number(-1, "test"), /Invalid numeric value/);
});
