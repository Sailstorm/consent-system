import assert from "node:assert/strict";
import test from "node:test";
import {
  normaliseHeader,
  parseDate,
  toOrganisation,
} from "../src/lib/asic-transform.js";

test("ASIC headers are normalised consistently", () => {
  assert.equal(normaliseHeader("\uFEFFBN Name"), "BNNAME");
  assert.equal(normaliseHeader("BN_REG_DT"), "BNREGDT");
});

test("ASIC dates support ISO and Australian day/month/year formats", () => {
  assert.equal(parseDate("2025-8-3"), "2025-08-03");
  assert.equal(parseDate("3/8/2025"), "2025-08-03");
  assert.equal(parseDate("not-a-date"), null);
});

test("ASIC rows are cleaned without inventing missing values", () => {
  assert.deepEqual(
    toOrganisation({
      BNNAME: " Example Business ",
      BNABN: "12 345 678 901",
      BNSTATUS: "Registered",
      BNREGDT: "03/08/2025",
      BNCANCELDT: "",
    }),
    {
      businessName: "Example Business",
      abn: "12345678901",
      registrationStatus: "Registered",
      registrationDate: "2025-08-03",
      cancellationDate: null,
    },
  );
  assert.equal(toOrganisation({ BNABN: "12345678901" }), null);
});
