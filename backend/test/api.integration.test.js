import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { pool } from "../src/db.js";
import { app } from "../src/server.js";

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  await pool.end();
});

async function getJson(route) {
  const response = await fetch(`${baseUrl}${route}`);
  return { response, body: await response.json() };
}

test("API health and source metadata are available", async () => {
  const health = await getJson("/api/health");
  assert.equal(health.response.status, 200);
  assert.equal(health.body.database, "connected");

  const sources = await getJson("/api/data-sources");
  assert.equal(sources.response.status, 200);
  assert.deepEqual(
    sources.body.sources.map((source) => source.code).sort(),
    ["asic_business_names", "oaic_ndb"],
  );
});

test("API rejects unsafe or incomplete search input", async () => {
  const shortName = await getJson("/api/organisations/search?name=a");
  assert.equal(shortName.response.status, 400);
  const invalidAbn = await getJson("/api/organisations/abn/123");
  assert.equal(invalidAbn.response.status, 400);
});

test("ASIC search returns registry-only disclaimer", async () => {
  const result = await getJson("/api/organisations/search?name=Monash");
  assert.equal(result.response.status, 200);
  assert.ok(Array.isArray(result.body.matches));
  assert.match(result.body.disclaimer, /does not prove/i);
});

test("OAIC endpoints return a defensible current snapshot", async () => {
  const overview = await getJson("/api/ndb/overview");
  assert.equal(overview.response.status, 200);
  assert.ok(overview.body.reportedNotifications > 0);
  assert.match(overview.body.note, /reported to the OAIC/i);

  const trends = await getJson("/api/ndb/trends");
  assert.equal(trends.response.status, 200);
  assert.ok(Array.isArray(trends.body.periods));
  assert.equal(trends.body.trendAvailable, trends.body.periods.length >= 2);
  if (!trends.body.trendAvailable) assert.match(trends.body.note, /snapshot/i);

  const sectors = await getJson("/api/ndb/sectors");
  assert.equal(sectors.response.status, 200);
  assert.ok(sectors.body.sectors.length > 0);
  assert.match(sectors.body.note, /top five/i);

  const informationTypes = await getJson("/api/ndb/information-types");
  assert.match(informationTypes.body.note, /overlap/i);

  const peopleAffected = await getJson("/api/ndb/people-affected");
  assert.match(peopleAffected.body.note, /worldwide/i);
});

test("database schema enforces the project natural-key uniqueness rule", async () => {
  const result = await pool.query(`
    SELECT indexdef
    FROM pg_indexes
    WHERE indexname = 'organisations_source_name_abn_unique'
  `);
  assert.equal(result.rowCount, 1);
  assert.match(result.rows[0].indexdef, /UNIQUE INDEX/i);
});
