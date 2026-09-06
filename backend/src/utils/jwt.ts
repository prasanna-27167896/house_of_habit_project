import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import type { CookieOptions } from "express";
import { env } from "@config/env";

export const REFRESH_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
export const ACCESS_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface JwtPayload {
  userId: string;
  sessionId: string;
  role: string;
  iat?: number;
  exp?: number;
}

// ─── Refresh-token cookie ─────────────────────────────────────────────────────
// httpOnly     → never readable by JS, immune to XSS token theft
// secure       → HTTPS-only in production
// sameSite     → lax in dev / strict in prod
// path         → scoped to the refresh route only; the browser never sends it elsewhere
export const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
  path: "/api/v1/auth/refresh",
};

export const refreshCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  maxAge: REFRESH_EXPIRY_MS,
};

// ─── Sign / verify ────────────────────────────────────────────────────────────
// role is carried in the access token so route guards don't need a DB read; it is
// refreshed from the DB on every token rotation, so a role change propagates within
// one access-token lifetime.
export const signAccessToken = (userId: string, sessionId: string, role: string): string =>
  jwt.sign({ userId, sessionId, role }, env.JWT_SECRET, { expiresIn: ACCESS_EXPIRY_MS / 1000 });

// jti makes every refresh token unique even when two are signed in the same second,
// so rotation always yields a distinct token and reuse detection stays reliable.
export const signRefreshToken = (userId: string, sessionId: string): string =>
  jwt.sign({ userId, sessionId, jti: randomUUID() }, env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRY_MS / 1000,
  });

// algorithms pinned to HS256 — blocks algorithm-confusion attacks (e.g. alg:none)
export const verifyAccessToken = (token: string): JwtPayload =>
  jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] }) as JwtPayload;

export const verifyRefreshToken = (token: string): JwtPayload =>
  jwt.verify(token, env.JWT_REFRESH_SECRET, { algorithms: ["HS256"] }) as JwtPayload;
