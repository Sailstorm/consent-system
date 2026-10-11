// Small in-memory fixed-window rate limiter. The backend is a single
// process on a single host, so a shared store (Redis etc.) isn't needed.
//
// Client IP: Caddy is the only thing that can reach this service (no
// published port), and it overwrites X-Forwarded-For with the real client
// address rather than appending to a client-supplied one. The last entry
// is therefore the address Caddy saw. Express's own `trust proxy` is left
// off on purpose (see proxy-addr advisory GHSA-jqcg-44mw-7w3h).
export function clientIp(request) {
  const forwarded = String(request.headers["x-forwarded-for"] || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return forwarded.at(-1) || request.socket?.remoteAddress || "unknown";
}

export function rateLimit({ windowMs, max, message }) {
  const hits = new Map();

  // Drop expired windows so the map can't grow without bound.
  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  }, windowMs);
  sweep.unref();

  return function rateLimitMiddleware(request, response, next) {
    const key = clientIp(request);
    const now = Date.now();
    let entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }

    entry.count += 1;

    if (entry.count > max) {
      response.set("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
      return response.status(429).json({ error: message });
    }

    return next();
  };
}
