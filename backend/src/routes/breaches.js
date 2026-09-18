import { Router } from "express";

export const breachesRouter = Router();

const HIBP_URL = "https://haveibeenpwned.com/api/v3/breaches";
const HIBP_SOURCE_URL = "https://haveibeenpwned.com/PwnedWebsites";
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000;
const MAX_CACHED_BREACHES = 12;

let cache = {
  expiresAt: 0,
  fetchedAt: null,
  breaches: [],
};

export function parseLimit(value) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed)) {
    return 6;
  }

  return Math.min(Math.max(parsed, 1), MAX_CACHED_BREACHES);
}

export function normaliseBreaches(rows) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows
    .filter(
      (breach) =>
        breach?.IsVerified === true &&
        breach?.IsSpamList !== true &&
        breach?.IsRetired !== true,
    )
    .sort(
      (first, second) =>
        Date.parse(second.AddedDate || 0) - Date.parse(first.AddedDate || 0),
    )
    .slice(0, MAX_CACHED_BREACHES)
    .map((breach) => ({
      name: breach.Name,
      title: breach.Title,
      domain: breach.Domain || null,
      breachDate: breach.BreachDate || null,
      addedDate: breach.AddedDate || null,
      affectedAccounts: Number(breach.PwnCount) || 0,
      dataClasses: Array.isArray(breach.DataClasses)
        ? breach.DataClasses
        : [],
      verified: true,
    }));
}

function responseBody({ breaches, fetchedAt, limit, cached, stale = false }) {
  return {
    source: {
      name: "Have I Been Pwned",
      url: HIBP_SOURCE_URL,
      licence: "CC BY 4.0",
    },
    fetchedAt,
    cached,
    stale,
    breaches: breaches.slice(0, limit),
    note:
      "The date added to HIBP may be later than the date on which the breach occurred.",
  };
}

breachesRouter.get("/", async (request, response) => {
  const limit = parseLimit(request.query.limit);

  if (cache.expiresAt > Date.now() && cache.breaches.length > 0) {
    return response.json(
      responseBody({
        breaches: cache.breaches,
        fetchedAt: cache.fetchedAt,
        limit,
        cached: true,
      }),
    );
  }

  try {
    const upstream = await fetch(HIBP_URL, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Consent-Assistant/1.0",
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!upstream.ok) {
      throw new Error(`HIBP returned HTTP ${upstream.status}`);
    }

    const breaches = normaliseBreaches(await upstream.json());

    if (breaches.length === 0) {
      throw new Error("HIBP returned no verified breach records");
    }

    cache = {
      expiresAt: Date.now() + CACHE_DURATION_MS,
      fetchedAt: new Date().toISOString(),
      breaches,
    };

    return response.json(
      responseBody({
        breaches,
        fetchedAt: cache.fetchedAt,
        limit,
        cached: false,
      }),
    );
  } catch (error) {
    console.error("Unable to load HIBP breach metadata", error);

    if (cache.breaches.length > 0) {
      return response.json(
        responseBody({
          breaches: cache.breaches,
          fetchedAt: cache.fetchedAt,
          limit,
          cached: true,
          stale: true,
        }),
      );
    }

    return response.status(502).json({
      error: "Latest breach information is temporarily unavailable.",
    });
  }
});
