import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import readExcelFile from "read-excel-file/node";
import { pool } from "../db.js";
import {
  parseInformationTypes,
  parseMonthly,
  parsePeopleAffected,
  parsePeriod,
  parseSectors,
  sheetByName,
  text,
} from "../lib/oaic-transform.js";

const PACKAGE_ID = "5781dc17-2ad0-4dd1-bced-01c544943ce3";
const CKAN_API = `https://data.gov.au/data/api/3/action/package_show?id=${PACKAGE_ID}`;
async function downloadLatestWorkbook() {
  const metadataResponse = await fetch(CKAN_API);
  if (!metadataResponse.ok) {
    throw new Error(`data.gov.au metadata request failed (${metadataResponse.status})`);
  }

  const payload = await metadataResponse.json();
  if (!payload.success) throw new Error("data.gov.au returned an unsuccessful response");

  const resources = payload.result.resources
    .filter((resource) => text(resource.format).toUpperCase() === "XLSX")
    .sort(
      (left, right) =>
        new Date(right.last_modified || right.created || 0) -
        new Date(left.last_modified || left.created || 0),
    );
  const resource = resources[0];
  if (!resource) throw new Error("No XLSX resource was found in the OAIC dataset");

  const workbookResponse = await fetch(resource.url);
  if (!workbookResponse.ok) {
    throw new Error(`OAIC workbook download failed (${workbookResponse.status})`);
  }

  const tempPath = path.join(os.tmpdir(), `consent-assistant-oaic-${process.pid}.xlsx`);
  await fs.writeFile(tempPath, Buffer.from(await workbookResponse.arrayBuffer()));

  return {
    filePath: tempPath,
    temporary: true,
    sourceUpdatedAt: resource.last_modified || resource.created || new Date().toISOString(),
    resourceName: resource.name,
    resourceUrl: resource.url,
  };
}

async function resolveWorkbook() {
  const localArgument = process.argv.slice(2).find((argument) => !argument.startsWith("--"));
  if (!localArgument) return downloadLatestWorkbook();

  const filePath = path.resolve(localArgument);
  const stats = await fs.stat(filePath);
  return {
    filePath,
    temporary: false,
    sourceUpdatedAt: stats.mtime.toISOString(),
    resourceName: path.basename(filePath),
    resourceUrl: null,
  };
}

async function insertStats(client, table, periodId, labelColumn, rows, includePercentage) {
  for (const row of rows) {
    const label = row[labelColumn];
    const columns = includePercentage
      ? `(period_id, ${labelColumn.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)}, notifications, percentage)`
      : `(period_id, ${labelColumn.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)}, notifications)`;
    const values = includePercentage ? [periodId, label, row.notifications, row.percentage] : [periodId, label, row.notifications];
    const placeholders = includePercentage ? "$1, $2, $3, $4" : "$1, $2, $3";
    await client.query(`INSERT INTO ${table} ${columns} VALUES (${placeholders})`, values);
  }
}

let workbookInfo;
let runId;
let sourceId;
const client = await pool.connect();

try {
  workbookInfo = await resolveWorkbook();
  const workbook = await readExcelFile(workbookInfo.filePath);
  const monthlyRows = sheetByName(workbook, "NDB by month");
  const period = parsePeriod(monthlyRows);
  const monthly = parseMonthly(monthlyRows);
  const sectors = parseSectors(
    sheetByName(workbook, "Top 5 sectors by source"),
    monthly.totalNotifications,
  );
  const informationTypes = parseInformationTypes(
    sheetByName(workbook, "Personal information"),
  );
  const peopleAffected = parsePeopleAffected(
    sheetByName(workbook, "Individuals affected"),
  );

  const sourceResult = await pool.query(
    "SELECT id FROM data_sources WHERE code = 'oaic_ndb'",
  );
  if (sourceResult.rowCount === 0) {
    throw new Error("OAIC data source is missing. Run database/init.sql first.");
  }
  sourceId = sourceResult.rows[0].id;

  const runResult = await pool.query(
    "INSERT INTO import_runs (source_id, status) VALUES ($1, 'running') RETURNING id",
    [sourceId],
  );
  runId = runResult.rows[0].id;

  await client.query("BEGIN");
  const periodResult = await client.query(
    `
      INSERT INTO ndb_periods (
        period_start, period_end, total_notifications, source_id, source_updated_at
      )
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (source_id, period_start, period_end) DO UPDATE SET
        total_notifications = EXCLUDED.total_notifications,
        source_updated_at = EXCLUDED.source_updated_at
      RETURNING id
    `,
    [
      period.periodStart,
      period.periodEnd,
      monthly.totalNotifications,
      sourceId,
      workbookInfo.sourceUpdatedAt,
    ],
  );
  const periodId = periodResult.rows[0].id;

  for (const table of [
    "ndb_sector_stats",
    "ndb_cause_stats",
    "ndb_information_type_stats",
    "ndb_people_affected_stats",
  ]) {
    await client.query(`DELETE FROM ${table} WHERE period_id = $1`, [periodId]);
  }

  await insertStats(client, "ndb_sector_stats", periodId, "sector", sectors, true);
  await insertStats(client, "ndb_cause_stats", periodId, "cause", monthly.causes, true);
  await insertStats(
    client,
    "ndb_information_type_stats",
    periodId,
    "informationType",
    informationTypes,
    false,
  );
  for (const row of peopleAffected) {
    await client.query(
      `
        INSERT INTO ndb_people_affected_stats (
          period_id, affected_range, notifications, sort_order
        ) VALUES ($1, $2, $3, $4)
      `,
      [periodId, row.affectedRange, row.notifications, row.sortOrder],
    );
  }

  const importedRecords =
    1 + sectors.length + monthly.causes.length + informationTypes.length + peopleAffected.length;
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

  console.log(
    JSON.stringify(
      {
        resource: workbookInfo.resourceName,
        resourceUrl: workbookInfo.resourceUrl,
        period: period.label,
        totalNotifications: monthly.totalNotifications,
        sectors: sectors.length,
        causes: monthly.causes.length,
        informationTypes: informationTypes.length,
        affectedRanges: peopleAffected.length,
      },
      null,
      2,
    ),
  );
} catch (error) {
  try {
    await client.query("ROLLBACK");
  } catch {
    // No open transaction or connection already closed.
  }
  if (runId) {
    await pool.query(
      `
        UPDATE import_runs
        SET completed_at = NOW(), status = 'failed', error_message = $1
        WHERE id = $2
      `,
      [String(error.message || error), runId],
    );
  }
  throw error;
} finally {
  client.release();
  if (workbookInfo?.temporary) {
    await fs.unlink(workbookInfo.filePath).catch(() => {});
  }
  await pool.end();
}
