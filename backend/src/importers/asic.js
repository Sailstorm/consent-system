import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { parse } from "csv-parse";
import { pool } from "../db.js";
import { normaliseHeader, toOrganisation } from "../lib/asic-transform.js";

const PACKAGE_API =
  "https://data.gov.au/data/api/3/action/package_show?id=asic-business-names";
const argumentsList = process.argv.slice(2);
const limitFlagIndex = process.argv.indexOf("--limit");
const limit =
  limitFlagIndex >= 0 ? Number(process.argv[limitFlagIndex + 1]) : Number.POSITIVE_INFINITY;
let filePath = null;

for (let index = 0; index < argumentsList.length; index += 1) {
  const argument = argumentsList[index];
  if (argument === "--limit") {
    index += 1;
  } else if (argument !== "--latest" && !argument.startsWith("--")) {
    filePath = argument;
    break;
  }
}

if (!Number.isFinite(limit) && limit !== Number.POSITIVE_INFINITY) {
  console.error("--limit must be a positive number");
  process.exit(1);
}
if (limit <= 0) {
  console.error("--limit must be a positive number");
  process.exit(1);
}
if (filePath && !fs.existsSync(filePath)) {
  console.error(`ASIC file not found: ${filePath}`);
  process.exit(1);
}

async function insertBatch(client, sourceId, sourceUpdatedAt, rows) {
  if (rows.length === 0) return 0;

  const parameters = [];
  const values = rows.map((row, index) => {
    const offset = index * 7;
    parameters.push(
      row.businessName,
      row.abn,
      row.registrationStatus,
      row.registrationDate,
      row.cancellationDate,
      sourceId,
      sourceUpdatedAt,
    );
    return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7})`;
  });

  const result = await client.query(
    `
      INSERT INTO organisations (
        business_name,
        abn,
        registration_status,
        registration_date,
        cancellation_date,
        source_id,
        source_updated_at
      )
      VALUES ${values.join(",")}
      ON CONFLICT DO NOTHING
    `,
    parameters,
  );

  return result.rowCount;
}

async function resolveInput() {
  if (filePath) {
    const resolvedPath = path.resolve(filePath);
    const stats = await fs.promises.stat(resolvedPath);
    return {
      stream: fs.createReadStream(resolvedPath),
      name: path.basename(resolvedPath),
      url: null,
      sourceUpdatedAt: stats.mtime.toISOString(),
    };
  }

  const metadataResponse = await fetch(PACKAGE_API);
  if (!metadataResponse.ok) {
    throw new Error(`data.gov.au metadata request failed (${metadataResponse.status})`);
  }
  const payload = await metadataResponse.json();
  if (!payload.success) throw new Error("data.gov.au returned an unsuccessful response");

  const resource = payload.result.resources
    .filter((candidate) => String(candidate.format || "").toUpperCase() === "CSV")
    .sort(
      (left, right) =>
        new Date(right.last_modified || right.created || 0) -
        new Date(left.last_modified || left.created || 0),
    )[0];
  if (!resource) throw new Error("No current ASIC CSV resource was found");

  const dataResponse = await fetch(resource.url);
  if (!dataResponse.ok || !dataResponse.body) {
    throw new Error(`ASIC CSV download failed (${dataResponse.status})`);
  }

  return {
    stream: Readable.fromWeb(dataResponse.body),
    name: resource.name,
    url: resource.url,
    sourceUpdatedAt: resource.last_modified || resource.created || new Date().toISOString(),
  };
}

const sourceResult = await pool.query(
  "SELECT id FROM data_sources WHERE code = 'asic_business_names'",
);
const sourceId = sourceResult.rows[0].id;
const runResult = await pool.query(
  "INSERT INTO import_runs (source_id, status) VALUES ($1, 'running') RETURNING id",
  [sourceId],
);
const runId = runResult.rows[0].id;
const client = await pool.connect();

let parsedRecords = 0;
let importedRecords = 0;
let input;

try {
  input = await resolveInput();
  await client.query("BEGIN");
  await client.query("DELETE FROM organisations WHERE source_id = $1", [sourceId]);

  const parser = input.stream.pipe(
    parse({
      bom: true,
      columns: (headers) => headers.map(normaliseHeader),
      delimiter: "\t",
      skip_empty_lines: true,
      relax_column_count: true,
      relax_quotes: true,
      trim: true,
    }),
  );

  let batch = [];
  for await (const record of parser) {
    const organisation = toOrganisation(record);
    if (!organisation) continue;

    batch.push(organisation);
    parsedRecords += 1;

    if (batch.length >= 500) {
      importedRecords += await insertBatch(
        client,
        sourceId,
        input.sourceUpdatedAt,
        batch,
      );
      batch = [];
    }

    if (parsedRecords % 100000 === 0) {
      console.log(`Processed ${parsedRecords.toLocaleString("en-AU")} ASIC records...`);
    }

    if (parsedRecords >= limit) break;
  }

  importedRecords += await insertBatch(
    client,
    sourceId,
    input.sourceUpdatedAt,
    batch,
  );

  if (parsedRecords === 0) {
    throw new Error(
      "No ASIC records were recognised. Check that this is the tab-delimited Business Names file and inspect its headers.",
    );
  }

  await client.query("COMMIT");
  await pool.query(
    "UPDATE data_sources SET last_successful_import = NOW() WHERE id = $1",
    [sourceId],
  );
  await pool.query(
    `
      UPDATE import_runs
      SET completed_at = NOW(), status = 'completed', imported_records = $1
      WHERE id = $2
    `,
    [importedRecords, runId],
  );

  console.log({
    resource: input.name,
    resourceUrl: input.url,
    parsedRecords,
    importedRecords,
  });
} catch (error) {
  await client.query("ROLLBACK");
  await pool.query(
    `
      UPDATE import_runs
      SET completed_at = NOW(), status = 'failed', error_message = $1
      WHERE id = $2
    `,
    [String(error.message || error), runId],
  );
  throw error;
} finally {
  client.release();
  await pool.end();
}
