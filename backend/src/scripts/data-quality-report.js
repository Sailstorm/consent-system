import fs from "node:fs/promises";
import path from "node:path";
import { pool } from "../db.js";

const toInteger = (value) => Number.parseInt(String(value ?? 0), 10);
const checks = [];

function addCheck({ id, dataset, status, observed, expected, note }) {
  checks.push({ id, dataset, status, observed, expected, note });
}

try {
  const sourcesResult = await pool.query(`
    SELECT
      ds.code,
      ds.name,
      ds.agency,
      ds.source_url AS "sourceUrl",
      ds.licence,
      ds.refresh_frequency AS "refreshFrequency",
      ds.last_successful_import AS "lastSuccessfulImport",
      COUNT(ir.id) FILTER (WHERE ir.status = 'failed')::INTEGER AS "failedRuns",
      COUNT(ir.id) FILTER (
        WHERE ir.status = 'running'
          AND ir.started_at < NOW() - INTERVAL '1 hour'
      )::INTEGER AS "staleRunningImports"
    FROM data_sources ds
    LEFT JOIN import_runs ir ON ir.source_id = ds.id
    GROUP BY ds.id
    ORDER BY ds.code
  `);

  const organisationsResult = await pool.query(`
    SELECT
      COUNT(*)::BIGINT AS total,
      COUNT(*) FILTER (WHERE BTRIM(business_name) = '')::BIGINT AS missing_business_name,
      COUNT(*) FILTER (WHERE abn IS NULL)::BIGINT AS null_abn,
      COUNT(*) FILTER (
        WHERE abn IS NOT NULL AND abn !~ '^[0-9]{11}$'
      )::BIGINT AS invalid_abn,
      COUNT(*) FILTER (WHERE registration_date IS NULL)::BIGINT AS null_registration_date,
      COUNT(*) FILTER (WHERE registration_date > CURRENT_DATE)::BIGINT AS future_registration_date,
      COUNT(*) FILTER (WHERE cancellation_date > CURRENT_DATE)::BIGINT AS future_cancellation_date,
      COUNT(*) FILTER (
        WHERE LOWER(registration_status) = 'registered'
          AND cancellation_date IS NOT NULL
      )::BIGINT AS registered_with_cancellation_date,
      COUNT(*) FILTER (
        WHERE LOWER(registration_status) IN ('deregistered', 'cancelled')
          AND cancellation_date IS NULL
      )::BIGINT AS inactive_without_cancellation_date,
      MAX(source_updated_at) AS source_updated_at
    FROM organisations
  `);

  const duplicateResult = await pool.query(`
    SELECT COUNT(*)::BIGINT AS duplicate_groups
    FROM (
      SELECT source_id, business_name, COALESCE(abn, '')
      FROM organisations
      GROUP BY source_id, business_name, COALESCE(abn, '')
      HAVING COUNT(*) > 1
    ) duplicates
  `);

  const statusResult = await pool.query(`
    SELECT registration_status AS status, COUNT(*)::BIGINT AS records
    FROM organisations
    GROUP BY registration_status
    ORDER BY records DESC
  `);

  const ndbResult = await pool.query(`
    SELECT
      p.period_start::TEXT AS "periodStart",
      p.period_end::TEXT AS "periodEnd",
      p.total_notifications AS "totalNotifications",
      COALESCE((
        SELECT SUM(c.notifications) FROM ndb_cause_stats c WHERE c.period_id = p.id
      ), 0)::INTEGER AS "causeSum",
      COALESCE((
        SELECT SUM(a.notifications) FROM ndb_people_affected_stats a WHERE a.period_id = p.id
      ), 0)::INTEGER AS "affectedRangeSum",
      COALESCE((
        SELECT SUM(s.notifications) FROM ndb_sector_stats s WHERE s.period_id = p.id
      ), 0)::INTEGER AS "topFiveSectorSum",
      COALESCE((
        SELECT SUM(i.notifications) FROM ndb_information_type_stats i WHERE i.period_id = p.id
      ), 0)::INTEGER AS "informationTypeSum",
      (SELECT COUNT(*) FROM ndb_sector_stats s WHERE s.period_id = p.id)::INTEGER AS "sectorRows",
      (SELECT COUNT(*) FROM ndb_cause_stats c WHERE c.period_id = p.id)::INTEGER AS "causeRows",
      (SELECT COUNT(*) FROM ndb_information_type_stats i WHERE i.period_id = p.id)::INTEGER AS "informationTypeRows",
      (SELECT COUNT(*) FROM ndb_people_affected_stats a WHERE a.period_id = p.id)::INTEGER AS "affectedRangeRows",
      p.source_updated_at AS "sourceUpdatedAt"
    FROM ndb_periods p
    ORDER BY p.period_start
  `);

  const organisations = organisationsResult.rows[0];
  const organisationTotal = toInteger(organisations.total);
  const missingAbn = toInteger(organisations.null_abn);
  const duplicateGroups = toInteger(duplicateResult.rows[0].duplicate_groups);

  addCheck({
    id: "SOURCE-01",
    dataset: "both",
    status: sourcesResult.rowCount === 2 ? "PASS" : "FAIL",
    observed: `${sourcesResult.rowCount} registered sources`,
    expected: "Exactly ASIC and OAIC are registered",
    note: "No third dataset is introduced by this project stage.",
  });
  addCheck({
    id: "SOURCE-02",
    dataset: "both",
    status: sourcesResult.rows.every((row) => row.failedRuns === 0) ? "PASS" : "WARN",
    observed: sourcesResult.rows.map((row) => `${row.code}: ${row.failedRuns} failed`).join("; "),
    expected: "No failed import runs",
    note: "A historical failure is a warning; investigate before the next refresh.",
  });
  addCheck({
    id: "SOURCE-03",
    dataset: "both",
    status: sourcesResult.rows.every((row) => row.staleRunningImports === 0) ? "PASS" : "FAIL",
    observed: sourcesResult.rows
      .map((row) => `${row.code}: ${row.staleRunningImports} stale running imports`)
      .join("; "),
    expected: "No import remains running for more than one hour",
    note: "A stale running import can indicate an interrupted pipeline.",
  });

  addCheck({
    id: "ASIC-01",
    dataset: "ASIC",
    status: organisationTotal > 0 ? "PASS" : "FAIL",
    observed: organisationTotal,
    expected: "At least one imported organisation",
    note: "The count is a source snapshot, not the number of legal entities in Australia.",
  });
  addCheck({
    id: "ASIC-02",
    dataset: "ASIC",
    status: toInteger(organisations.missing_business_name) === 0 ? "PASS" : "FAIL",
    observed: toInteger(organisations.missing_business_name),
    expected: 0,
    note: "business_name is the required display and search field.",
  });
  addCheck({
    id: "ASIC-03",
    dataset: "ASIC",
    status: toInteger(organisations.invalid_abn) === 0 ? "PASS" : "FAIL",
    observed: toInteger(organisations.invalid_abn),
    expected: "Every populated ABN contains exactly 11 digits",
    note: "A null ABN is permitted by the source and must not be treated as an error.",
  });
  addCheck({
    id: "ASIC-04",
    dataset: "ASIC",
    status: duplicateGroups === 0 ? "PASS" : "FAIL",
    observed: duplicateGroups,
    expected: 0,
    note: "Natural key used by this implementation: source + business name + ABN/null.",
  });
  addCheck({
    id: "ASIC-05",
    dataset: "ASIC",
    status: "WARN",
    observed: `${missingAbn} null ABNs (${organisationTotal ? ((missingAbn / organisationTotal) * 100).toFixed(2) : "0.00"}%)`,
    expected: "Null accepted and disclosed",
    note: "ASIC states ABNs can be unavailable, suppressed or unsuitable for a single-value field. ABN is not a complete join key.",
  });
  addCheck({
    id: "ASIC-06",
    dataset: "ASIC",
    status:
      toInteger(organisations.future_registration_date) === 0 &&
      toInteger(organisations.null_registration_date) === 0
        ? "PASS"
        : "WARN",
    observed: {
      nullRegistrationDates: toInteger(organisations.null_registration_date),
      futureRegistrationDates: toInteger(organisations.future_registration_date),
    },
    expected: "Registration date present and not in the future",
    note: "Date parsing failures become null and must be investigated after import.",
  });
  addCheck({
    id: "ASIC-07",
    dataset: "ASIC",
    status:
      toInteger(organisations.future_cancellation_date) === 0 &&
      toInteger(organisations.registered_with_cancellation_date) === 0 &&
      toInteger(organisations.inactive_without_cancellation_date) === 0
        ? "PASS"
        : "WARN",
    observed: {
      futureCancellationDates: toInteger(organisations.future_cancellation_date),
      registeredWithCancellationDate: toInteger(
        organisations.registered_with_cancellation_date,
      ),
      inactiveWithoutCancellationDate: toInteger(
        organisations.inactive_without_cancellation_date,
      ),
    },
    expected: "Status and cancellation date are logically consistent",
    note: "Warnings are retained as source observations; the pipeline does not silently rewrite official values.",
  });
  addCheck({
    id: "ASIC-08",
    dataset: "ASIC",
    status: "WARN",
    observed: statusResult.rows,
    expected: "Monitor the source domain on every import",
    note: "The current source contains Registered and Deregistered, while the July 2025 help file describes Registered and Cancelled. Treat this as documented source-schema drift.",
  });

  addCheck({
    id: "OAIC-01",
    dataset: "OAIC",
    status: ndbResult.rowCount > 0 ? "PASS" : "FAIL",
    observed: `${ndbResult.rowCount} reporting periods`,
    expected: "At least one reporting period",
    note: "One period supports a current snapshot but not a meaningful time trend.",
  });
  for (const period of ndbResult.rows) {
    addCheck({
      id: `OAIC-CAUSE-${period.periodStart}`,
      dataset: "OAIC",
      status: period.causeSum === period.totalNotifications ? "PASS" : "FAIL",
      observed: period.causeSum,
      expected: period.totalNotifications,
      note: "Top-level cause categories are mutually exclusive and should reconcile to the period total.",
    });
    addCheck({
      id: `OAIC-AFFECTED-${period.periodStart}`,
      dataset: "OAIC",
      status: period.affectedRangeSum === period.totalNotifications ? "PASS" : "FAIL",
      observed: period.affectedRangeSum,
      expected: period.totalNotifications,
      note: "The imported first table counts worldwide individuals-affected ranges and should reconcile to the period total.",
    });
    addCheck({
      id: `OAIC-SECTOR-${period.periodStart}`,
      dataset: "OAIC",
      status: "WARN",
      observed: `${period.topFiveSectorSum} across ${period.sectorRows} rows`,
      expected: "Partial coverage: OAIC top five sectors only",
      note: "Sector counts are not expected to reconcile to the period total and must not be labelled as all sectors.",
    });
    addCheck({
      id: `OAIC-INFO-${period.periodStart}`,
      dataset: "OAIC",
      status: "WARN",
      observed: `${period.informationTypeSum} across ${period.informationTypeRows} rows`,
      expected: "Non-exclusive categories",
      note: "One notification can involve multiple information types, so the sum can exceed the period total.",
    });
  }
  addCheck({
    id: "OAIC-02",
    dataset: "OAIC",
    status: ndbResult.rowCount >= 2 ? "PASS" : "WARN",
    observed: `${ndbResult.rowCount} reporting periods`,
    expected: "At least two periods for a trend chart",
    note: "Do not claim a trend until historical or future official periods have been imported.",
  });

  const summary = checks.reduce(
    (totals, check) => {
      totals[check.status.toLowerCase()] += 1;
      return totals;
    },
    { pass: 0, warn: 0, fail: 0 },
  );

  const report = {
    generatedAt: new Date().toISOString(),
    scope: "Consent Assistant local PostgreSQL data-quality report",
    sources: sourcesResult.rows,
    statusDomain: statusResult.rows,
    organisationSourceUpdatedAt: organisations.source_updated_at,
    ndbPeriods: ndbResult.rows,
    summary,
    checks,
  };
  const reportJson = JSON.stringify(report, null, 2);
  const outputFlagIndex = process.argv.indexOf("--output");

  if (outputFlagIndex >= 0) {
    const outputArgument = process.argv[outputFlagIndex + 1];
    if (!outputArgument) throw new Error("--output requires a file path");
    const outputPath = path.resolve(outputArgument);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, `${reportJson}\n`, "utf8");
    console.log(`Data-quality evidence written to ${outputPath}`);
  } else {
    console.log(reportJson);
  }

  if (summary.fail > 0) process.exitCode = 1;
} finally {
  await pool.end();
}
