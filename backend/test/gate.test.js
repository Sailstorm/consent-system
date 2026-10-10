import assert from "node:assert/strict";
import test from "node:test";
import express from "express";
import { COOKIE_NAME, createSessionToken, gateRouter, isValidSessionToken } from "../src/routes/gate.js";
import { clientIp, rateLimit } from "../src/lib/rate-limit.js";

const SECRET = "test-secret";

function startApp() {
  process.env.GATE_PASSWORD = "correct horse";
  process.env.GATE_SECRET = SECRET;
  const app = express();
  app.use(express.json());
  app.use("/api/gate", gateRouter);
  const server = app.listen(0);
  return { server, base: `http://127.0.0.1:${server.address().port}/api/gate` };
}

test("session tokens verify, expire and reject tampering", () => {
  const now = Date.now();
  const token = createSessionToken(SECRET, now);
  assert.equal(isValidSessionToken(token, SECRET, now), true);
  assert.equal(isValidSessionToken(token, "other-secret", now), false);
  assert.equal(isValidSessionToken(token, SECRET, now + 8 * 24 * 3600 * 1000), false);

  const [expiresAt, signature] = token.split(".");
  assert.equal(isValidSessionToken(`${Number(expiresAt) + 999}.${signature}`, SECRET, now), false);
  for (const bad of [null, "", "abc", "1.2.3", ".sig", "123."]) {
    assert.equal(isValidSessionToken(bad, SECRET, now), false);
  }
});

test("check returns the login page without a valid cookie and 204 with one", async () => {
  const { server, base } = startApp();
  try {
    const denied = await fetch(`${base}/check`);
    assert.equal(denied.status, 401);
    assert.match(denied.headers.get("content-type"), /text\/html/);
    assert.match(await denied.text(), /gate-form/);

    const allowed = await fetch(`${base}/check`, {
      headers: { Cookie: `other=1; ${COOKIE_NAME}=${createSessionToken(SECRET)}` },
    });
    assert.equal(allowed.status, 204);
  } finally {
    server.close();
  }
});

test("login sets a secure HttpOnly cookie only for the right password", async () => {
  const { server, base } = startApp();
  try {
    const login = (password) =>
      fetch(`${base}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

    const wrong = await login("TP13");
    assert.equal(wrong.status, 401);
    assert.equal(wrong.headers.get("set-cookie"), null);

    const right = await login("correct horse");
    assert.equal(right.status, 204);
    const cookie = right.headers.get("set-cookie");
    assert.match(cookie, new RegExp(`^${COOKIE_NAME}=`));
    assert.match(cookie, /HttpOnly/);
    assert.match(cookie, /Secure/);
    assert.match(cookie, /SameSite=Lax/);
  } finally {
    server.close();
  }
});

test("gate fails closed when it is not configured", async () => {
  const { server, base } = startApp();
  delete process.env.GATE_SECRET;
  try {
    const response = await fetch(`${base}/check`, {
      headers: { Cookie: `${COOKIE_NAME}=${createSessionToken(SECRET)}` },
    });
    assert.equal(response.status, 401);
  } finally {
    server.close();
  }
});

test("rate limiter keys on the address Caddy appended and returns 429", async () => {
  assert.equal(clientIp({ headers: { "x-forwarded-for": "6.6.6.6, 1.2.3.4" } }), "1.2.3.4");

  const app = express();
  app.use(rateLimit({ windowMs: 60_000, max: 2, message: "slow down" }));
  app.get("/", (request, response) => response.send("ok"));
  const server = app.listen(0);
  const url = `http://127.0.0.1:${server.address().port}/`;
  try {
    const hit = (ip) => fetch(url, { headers: { "X-Forwarded-For": ip } });
    assert.equal((await hit("1.1.1.1")).status, 200);
    assert.equal((await hit("1.1.1.1")).status, 200);
    const limited = await hit("1.1.1.1");
    assert.equal(limited.status, 429);
    assert.ok(Number(limited.headers.get("retry-after")) > 0);
    assert.equal((await hit("2.2.2.2")).status, 200);
  } finally {
    server.close();
  }
});
