import { createHmac } from "node:crypto";
import bcrypt from "bcrypt";
import { env } from "@config/env";

const SALT_ROUNDS = 12;

// HMAC-pepper the password before bcrypt:
//   1. Even if the DB leaks, an attacker still needs PASSWORD_PEPPER to brute-force.
//   2. Fixes bcrypt's silent 72-byte truncation — the HMAC output is always a fixed
//      64-char hex string, so long passwords aren't quietly cut short.
const applyPepper = (plain: string): string =>
  createHmac("sha256", env.PASSWORD_PEPPER).update(plain).digest("hex");

export const hashPassword = (plain: string): Promise<string> =>
  bcrypt.hash(applyPepper(plain), SALT_ROUNDS);

export const comparePassword = (plain: string, hash: string): Promise<boolean> =>
  bcrypt.compare(applyPepper(plain), hash);
