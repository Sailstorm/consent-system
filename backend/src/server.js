import "dotenv/config";
import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./db.js";

const app = express();
const port = Number(process.env.PORT || 3000);

app.disable("x-powered-by");
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  }),
);
app.use(express.json({ limit: "1mb" }));

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parsePeriodQuery(query) {
  const from = query.from ? String(query.from) : null;
  const to = query.to ? String(query.to) : null;

  if (from && !isIsoDate(from)) {
    const error = new Error("from must use YYYY-MM-DD format");
    error.status = 400;
    throw error;
  }

  if (to && !isIsoDate(to)) {
    const error = new Error("to must use YYYY-MM-DD format");
    error.status = 400;
    throw error;
  }

  return { from, to };
}

function escapeLike(value) {
  return value.replace(/[\\%_]/g, "\\$&");
}

app.get("/api/health", async (request, response, next) => {
  try {
    const result = await pool.query("SELECT NOW() AS database_time");
    response.json({
      status: "ok",
      database: "connected",
      databaseTime: result.rows[0].database_time,
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/data-sources", async (request, response, next) => {
  try {
    const result = await pool.query(`
      SELECT
        code,
        name,
        agency,
        source_url AS "sourceUrl",
        licence,
        refresh_frequency AS "refreshFrequency",
        last_successful_import AS "lastSuccessfulImport"
      FROM data_sources
      ORDER BY name
    `);
    response.json({ sources: result.rows });
  } catch (error) {
    next(error);
  }
});

app.get("/api/organisations/search", async (request, response, next) => {
  try {
    const name = String(request.query.name || "").trim();

    if (name.length < 2) {
      return response.status(400).json({
        error: "Enter at least two characters of an organisation name",
      });
    }

    const searchPattern = `%${escapeLike(name)}%`;
    const result = await pool.query(
      `
        SELECT
          o.id,
          o.business_name AS "businessName",
          o.abn,
          o.registration_status AS "registrationStatus",
          o.registration_date AS "registrationDate",
          o.cancellation_date AS "cancellationDate",
          o.source_updated_at AS "sourceUpdatedAt"
        FROM organisations o
        WHERE o.business_name ILIKE $1 ESCAPE '\\'
        ORDER BY similarity(o.business_name, $2) DESC, o.business_name
        LIMIT 20
      `,
      [searchPattern, name],
    );

    response.json({
      query: name,
      matches: result.rows,
      disclaimer:
        "A registry match confirms registration details only. It does not prove that an organisation is safe, trustworthy or privacy-compliant.",
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/organisations/abn/:abn", async (request, response, next) => {
  try {
    const abn = request.params.abn.replace(/\D/g, "");
    if (abn.length !== 11) {
      return response.status(400).json({ error: "ABN must contain 11 digits" });
    }

    const result = await pool.query(
      `
        SELECT
          o.id,
          o.business_name AS "businessName",
          o.abn,
          o.registration_status AS "registrationStatus",
          o.registration_date AS "registrationDate",
          o.cancellation_date AS "cancellationDate",
          o.source_updated_at AS "sourceUpdatedAt"
        FROM organisations o
        WHERE o.abn = $1
        ORDER BY o.business_name
      `,
      [abn],
    );

    response.json({
      abn,
      matches: result.rows,
      disclaimer:
        "A registry match confirms registration details only. It does not prove that an organisation is safe, trustworthy or privacy-compliant.",
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/ndb/overview", async (request, response, next) => {
  try {
    const { from, to } = parsePeriodQuery(request.query);
    const result = await pool.query(
      `
        SELECT
          COALESCE(SUM(total_notifications), 0)::INTEGER AS "reportedNotifications",
          MIN(period_start) AS "periodStart",
          MAX(period_end) AS "periodEnd",
          MAX(source_updated_at) AS "sourceUpdatedAt"
        FROM ndb_periods
        WHERE ($1::DATE IS NULL OR period_end >= $1::DATE)
          AND ($2::DATE IS NULL OR period_start <= $2::DATE)
      `,
      [from, to],
    );

    response.json({
      ...result.rows[0],
      note: "These are eligible breach notifications reported to the OAIC, not every breach occurring in Australia.",
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/ndb/trends", async (request, response, next) => {
  try {
    const { from, to } = parsePeriodQuery(request.query);
    const result = await pool.query(
      `
        SELECT
          period_start AS "periodStart",
          period_end AS "periodEnd",
          total_notifications AS "reportedNotifications"
        FROM ndb_periods
        WHERE ($1::DATE IS NULL OR period_end >= $1::DATE)
          AND ($2::DATE IS NULL OR period_start <= $2::DATE)
        ORDER BY period_start
      `,
      [from, to],
    );
    const trendAvailable = result.rows.length >= 2;
    response.json({
      periods: result.rows,
      trendAvailable,
      note: trendAvailable
        ? "The chart compares official OAIC reporting periods."
        : "Only one official reporting period is currently available in the open dataset, so this is a snapshot and must not be presented as a trend.",
    });
  } catch (error) {
    next(error);
  }
});

async function groupedNdbStats({ table, labelColumn, labelAlias, query }) {
  const { from, to } = parsePeriodQuery(query);
  const result = await pool.query(
    `
      SELECT
        stats.${labelColumn} AS "${labelAlias}",
        SUM(stats.notifications)::INTEGER AS notifications
      FROM ${table} stats
      JOIN ndb_periods periods ON periods.id = stats.period_id
      WHERE ($1::DATE IS NULL OR periods.period_end >= $1::DATE)
        AND ($2::DATE IS NULL OR periods.period_start <= $2::DATE)
      GROUP BY stats.${labelColumn}
      ORDER BY notifications DESC, stats.${labelColumn}
    `,
    [from, to],
  );
  return result.rows;
}

app.get("/api/ndb/sectors", async (request, response, next) => {
  try {
    const sectors = await groupedNdbStats({
      table: "ndb_sector_stats",
      labelColumn: "sector",
      labelAlias: "sector",
      query: request.query,
    });
    response.json({
      sectors,
      note: "OAIC publishes the top five sectors for the selected reporting period; this is not a list of all affected sectors.",
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/ndb/causes", async (request, response, next) => {
  try {
    const causes = await groupedNdbStats({
      table: "ndb_cause_stats",
      labelColumn: "cause",
      labelAlias: "cause",
      query: request.query,
    });
    response.json({ causes });
  } catch (error) {
    next(error);
  }
});

app.get("/api/ndb/information-types", async (request, response, next) => {
  try {
    const informationTypes = await groupedNdbStats({
      table: "ndb_information_type_stats",
      labelColumn: "information_type",
      labelAlias: "informationType",
      query: request.query,
    });
    response.json({
      informationTypes,
      note: "Categories can overlap because one notification may involve multiple kinds of personal information.",
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/ndb/people-affected", async (request, response, next) => {
  try {
    const { from, to } = parsePeriodQuery(request.query);
    const result = await pool.query(
      `
        SELECT
          stats.affected_range AS "affectedRange",
          SUM(stats.notifications)::INTEGER AS notifications,
          MIN(stats.sort_order)::INTEGER AS "sortOrder"
        FROM ndb_people_affected_stats stats
        JOIN ndb_periods periods ON periods.id = stats.period_id
        WHERE ($1::DATE IS NULL OR periods.period_end >= $1::DATE)
          AND ($2::DATE IS NULL OR periods.period_start <= $2::DATE)
        GROUP BY stats.affected_range
        ORDER BY "sortOrder", stats.affected_range
      `,
      [from, to],
    );
    response.json({
      ranges: result.rows,
      note: "These ranges describe the number of individuals worldwide affected by eligible breaches reported to the OAIC.",
    });
  } catch (error) {
    next(error);
  }
});

app.use((request, response) => {
  response.status(404).json({ error: "API route not found" });
});

app.use((error, request, response, next) => {
  if (!error.status || error.status >= 500) console.error(error);
  response.status(error.status || 500).json({
    error: error.status ? error.message : "Internal server error",
  });
});

export function startServer(listenPort = port) {
  return app.listen(listenPort, () => {
    console.log(`Consent Assistant API listening on port ${listenPort}`);
  });
}

let server;

async function shutdown() {
  if (!server) return;
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

const isMain =
  process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMain) {
  server = startServer();
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

export { app, escapeLike, isIsoDate, parsePeriodQuery };
