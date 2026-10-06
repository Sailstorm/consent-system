import { Router } from "express";

export const breachesRouter = Router();

const HIBP_URL = "https://haveibeenpwned.com/api/v3/breaches";
const HIBP_SOURCE_URL = "https://haveibeenpwned.com/PwnedWebsites";
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000;
const DEFAULT_PAGE_SIZE = 6;
// Limit each response, not the number of records in the cache.
const MAX_PAGE_SIZE = 12;

let cache = { expiresAt: 0, fetchedAt: null, breaches: [] };

// Retain the old export and ?limit=6 contract for existing callers/tests.
export function parseLimit(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed)) return DEFAULT_PAGE_SIZE;
  return Math.min(Math.max(parsed, 1), MAX_PAGE_SIZE);
}

export function parsePage(value) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
}

export function normaliseBreaches(rows) {
  if (!Array.isArray(rows)) return [];

  return rows
    .filter(
      (breach) =>
        breach?.IsVerified === true &&
        breach?.IsSpamList !== true &&
        breach?.IsRetired !== true,
    )
    .sort(
      (first, second) =>
        (Date.parse(second.AddedDate) || 0) -
        (Date.parse(first.AddedDate) || 0),
    )
    // No slice here: keep all eligible records for searching and pagination.
    .map((breach) => ({
      name: breach.Name,
      title: breach.Title,
      domain: breach.Domain || null,
      breachDate: breach.BreachDate || null,
      addedDate: breach.AddedDate || null,
      affectedAccounts: Number(breach.PwnCount) || 0,
      dataClasses: Array.isArray(breach.DataClasses) ? breach.DataClasses : [],
      verified: true,
    }));
}

export function paginateBreaches(breaches, { page = 1, pageSize = 6, search = "" } = {}) {
  const size = parseLimit(pageSize);
  const searchText = String(search).trim();
  const query = searchText.toLowerCase();
  // Search the whole cached catalogue BEFORE selecting a page.
  const matches = query
    ? breaches.filter((breach) =>
        [breach.name, breach.title, breach.domain].some((value) =>
          String(value ?? "").toLowerCase().includes(query),
        ),
      )
    : breaches;

  const total = matches.length;
  const totalPages = Math.ceil(total / size);
  // No matches: page=1, totalPages=0, breaches=[], both buttons disabled.
  const currentPage = Math.min(parsePage(page), Math.max(1, totalPages));
  const start = (currentPage - 1) * size;

  return {
    search: searchText,
    page: currentPage,
    pageSize: size,
    total,
    totalAvailable: breaches.length,
    totalPages,
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
    breaches: matches.slice(start, start + size),
  };
}

function responseBody({ breaches, fetchedAt, page, pageSize, search, cached, stale = false }) {
  return {
    source: { name: "Have I Been Pwned", url: HIBP_SOURCE_URL, licence: "CC BY 4.0" },
    fetchedAt,
    cached,
    stale,
    ...paginateBreaches(breaches, { page, pageSize, search }),
    note: "The date added to HIBP may be later than the date on which the breach occurred.",
  };
}

breachesRouter.get("/", async (request, response) => {
  const search = String(request.query.search ?? "").trim();
  if (search.length > 200) {
    return response.status(400).json({ error: "Search must be 200 characters or fewer." });
  }

  const pagination = {
    page: parsePage(request.query.page),
    pageSize: parseLimit(request.query.pageSize ?? request.query.limit),
    search,
  };

  if (cache.expiresAt > Date.now() && cache.breaches.length > 0) {
    return response.json(responseBody({ ...cache, ...pagination, cached: true }));
  }

  try {
    const upstream = await fetch(HIBP_URL, {
      headers: { Accept: "application/json", "User-Agent": "Consent-Assistant/1.0" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!upstream.ok) throw new Error(`HIBP returned HTTP ${upstream.status}`);

    const breaches = normaliseBreaches(await upstream.json());
    if (breaches.length === 0) throw new Error("HIBP returned no verified breach records");

    cache = {
      expiresAt: Date.now() + CACHE_DURATION_MS,
      fetchedAt: new Date().toISOString(),
      breaches,
    };
    return response.json(responseBody({ ...cache, ...pagination, cached: false }));
  } catch (error) {
    console.error("Unable to load HIBP breach metadata", error);
    if (cache.breaches.length > 0) {
      return response.json(responseBody({ ...cache, ...pagination, cached: true, stale: true }));
    }
    return response.status(502).json({ error: "Latest breach information is temporarily unavailable." });
  }
});
