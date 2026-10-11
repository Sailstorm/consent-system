import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express, { Router } from "express";
import { rateLimit } from "../lib/rate-limit.js";

// Server-side site gate (security plan F-06). Replaces the old client-side
// PasswordGate, whose password shipped in the public JS bundle.
//
// Caddy calls GET /api/gate/check (forward_auth) before serving anything,
// for every site version and API. A valid signed cookie returns 204; anything
// else returns 401 with the login page as the body, which Caddy passes
// straight to the browser. The login page posts to /api/gate/login, which
// sets the cookie and the page reloads.

export const gateRouter = Router();

export const COOKIE_NAME = "ca_gate";
const SESSION_SECONDS = 7 * 24 * 60 * 60;
const assetsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "gate");
const loginPage = fs.readFileSync(path.join(assetsDir, "login.html"), "utf8");

function gateConfig() {
  return {
    password: process.env.GATE_PASSWORD || "",
    secret: process.env.GATE_SECRET || "",
  };
}

function sign(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(left, right) {
  // Hash first so lengths always match and timing doesn't leak length.
  const a = crypto.createHash("sha256").update(String(left)).digest();
  const b = crypto.createHash("sha256").update(String(right)).digest();
  return crypto.timingSafeEqual(a, b);
}

export function createSessionToken(secret, now = Date.now()) {
  const expiresAt = String(Math.floor(now / 1000) + SESSION_SECONDS);
  return `${expiresAt}.${sign(expiresAt, secret)}`;
}

export function isValidSessionToken(token, secret, now = Date.now()) {
  if (!token || !secret) return false;
  const [expiresAt, signature] = String(token).split(".");
  if (!expiresAt || !signature || !/^\d+$/.test(expiresAt)) return false;
  if (Number(expiresAt) * 1000 <= now) return false;
  return safeEqual(signature, sign(expiresAt, secret));
}

function readCookie(request, name) {
  for (const part of String(request.headers.cookie || "").split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return null;
}

function sendLoginPage(response) {
  response
    .status(401)
    .set("Content-Type", "text/html; charset=utf-8")
    .set("Cache-Control", "no-store")
    .send(loginPage);
}

gateRouter.get("/check", (request, response) => {
  const { password, secret } = gateConfig();

  // Fail closed: a deployment missing its gate secrets serves nothing.
  if (!password || !secret) {
    console.error("Site gate is not configured (GATE_PASSWORD/GATE_SECRET missing).");
    return sendLoginPage(response);
  }

  if (isValidSessionToken(readCookie(request, COOKIE_NAME), secret)) {
    return response.status(204).end();
  }

  return sendLoginPage(response);
});

gateRouter.post(
  "/login",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many attempts. Please wait 15 minutes and try again.",
  }),
  express.json({ limit: "2kb" }),
  (request, response) => {
    const { password, secret } = gateConfig();
    const submitted = request.body?.password;

    if (!password || !secret || typeof submitted !== "string" || !safeEqual(submitted, password)) {
      return response.status(401).json({ error: "Incorrect password. Please try again." });
    }

    response.cookie(COOKIE_NAME, createSessionToken(secret), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_SECONDS * 1000,
    });
    return response.status(204).end();
  },
);

gateRouter.post("/logout", (request, response) => {
  response.clearCookie(COOKIE_NAME, { httpOnly: true, secure: true, sameSite: "lax", path: "/" });
  response.status(204).end();
});

// Login page assets. Served from here (not inline) so the site-wide CSP can
// keep script-src 'self' with no 'unsafe-inline'.
gateRouter.get("/gate.js", (request, response) => {
  response.type("application/javascript").sendFile(path.join(assetsDir, "gate.js"));
});
gateRouter.get("/gate.css", (request, response) => {
  response.type("text/css").sendFile(path.join(assetsDir, "gate.css"));
});
