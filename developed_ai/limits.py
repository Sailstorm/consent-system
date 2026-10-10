"""
Abuse limits for the analyse routes (security plan A-01, A-06, A-07).

Every analysis costs five NVIDIA calls and, for /analyze-url and
/analyze-pdf, a server-side fetch or parse, so the routes are limited per
client and globally:

- per client IP: ANALYSES_PER_MINUTE and ANALYSES_PER_HOUR
- whole service: MAX_CONCURRENT_ANALYSES running at once (others get 503)
- request bodies over MAX_BODY_BYTES are refused before they're read

Client IP: only Caddy can reach this service (no published port), and it
overwrites X-Forwarded-For with the address it saw, so the last entry is
trustworthy. This runs in one process, so in-memory state is enough.
"""

import threading
import time
from collections import defaultdict, deque

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

ANALYSES_PER_MINUTE = 5
ANALYSES_PER_HOUR = 30
MAX_CONCURRENT_ANALYSES = 4
# 10 MiB PDF plus multipart overhead. Caddy enforces the same limit first.
MAX_BODY_BYTES = 11 * 1024 * 1024

LIMITED_PREFIX = "/analyze"


def client_ip(request):
    forwarded = [
        part.strip()
        for part in request.headers.get("x-forwarded-for", "").split(",")
        if part.strip()
    ]
    if forwarded:
        return forwarded[-1]
    return request.client.host if request.client else "unknown"


class AnalysisLimiter:
    def __init__(self, per_minute, per_hour, max_concurrent, clock=time.monotonic):
        self.per_minute = per_minute
        self.per_hour = per_hour
        self.clock = clock
        self.lock = threading.Lock()
        self.history = defaultdict(deque)
        self.slots = threading.BoundedSemaphore(max_concurrent)

    def retry_after(self, key):
        """Record an attempt; return seconds to wait if over the limit, else 0."""

        now = self.clock()

        with self.lock:
            attempts = self.history[key]
            while attempts and attempts[0] <= now - 3600:
                attempts.popleft()

            last_minute = sum(1 for at in attempts if at > now - 60)

            if last_minute >= self.per_minute:
                oldest = next(at for at in attempts if at > now - 60)
                return max(1, int(oldest + 60 - now) + 1)

            if len(attempts) >= self.per_hour:
                return max(1, int(attempts[0] + 3600 - now) + 1)

            attempts.append(now)

            # Forget idle clients so the table can't grow without bound.
            if len(self.history) > 10_000:
                for stale in [k for k, v in self.history.items() if not v]:
                    del self.history[stale]

            return 0


class AnalysisLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, limiter):
        super().__init__(app)
        self.limiter = limiter

    async def dispatch(self, request, call_next):
        if request.method != "POST" or not request.url.path.startswith(LIMITED_PREFIX):
            return await call_next(request)

        length = request.headers.get("content-length")
        if length and length.isdigit() and int(length) > MAX_BODY_BYTES:
            return JSONResponse(
                {"detail": "The request is too large."},
                status_code=413,
            )

        wait = self.limiter.retry_after(client_ip(request))
        if wait:
            return JSONResponse(
                {"detail": "Too many analyses from this connection. Please try again shortly."},
                status_code=429,
                headers={"Retry-After": str(wait)},
            )

        if not self.limiter.slots.acquire(blocking=False):
            return JSONResponse(
                {"detail": "The service is busy. Please try again in a minute."},
                status_code=503,
                headers={"Retry-After": "30"},
            )

        try:
            return await call_next(request)
        finally:
            self.limiter.slots.release()
