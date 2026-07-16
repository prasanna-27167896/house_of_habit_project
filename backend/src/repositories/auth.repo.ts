import { prisma } from "@lib/prisma";
import type { PrismaClient, Prisma } from "@generated/prisma/client";
import type { UserWithRoles } from "@interfaces/user.types";
import { REFRESH_EXPIRY_MS } from "@utils/jwt";

type DBClient = PrismaClient | Prisma.TransactionClient;

export const findUserByEmail = (email: string): Promise<UserWithRoles | null> =>
  prisma.user.findUnique({
    where: { email },
    include: { roles: { include: { role: true } } },
  });

export const findUserWithRolesById = (userId: string): Promise<UserWithRoles | null> =>
  prisma.user.findUnique({
    where: { userId },
    include: { roles: { include: { role: true } } },
  });

export const findEmailVerification = (email: string) =>
  prisma.emailVerification.findUnique({ where: { email } });

export const upsertEmailVerification = (email: string, otp: number, expiresAt: Date) =>
  prisma.emailVerification.upsert({
    where: { email },
    create: { email, otp, expiresAt, lastOtpSentAt: new Date() },
    // A fresh OTP resets the wrong-guess counter and stamps the send time.
    update: { otp, expiresAt, isVerified: false, attempts: 0, lastOtpSentAt: new Date() },
  });

// Count a wrong guess and return the new total (used to enforce the attempt limit).
export const incrementEmailVerificationAttempts = (email: string): Promise<{ attempts: number }> =>
  prisma.emailVerification.update({
    where: { email },
    data: { attempts: { increment: 1 } },
    select: { attempts: true },
  });

// Mark verified and (re)purpose expiresAt as the deadline by which register must run,
// so a verified-but-unclaimed email can't be registered against forever.
export const markEmailVerified = (email: string, verifiedUntil: Date) =>
  prisma.emailVerification.update({
    where: { email },
    data: { isVerified: true, expiresAt: verifiedUntil },
  });

export const deleteEmailVerification = (email: string) =>
  prisma.emailVerification.delete({ where: { email } });

export const createUser = (
  email: string,
  fullName?: string,
  mobile?: string,
): Promise<UserWithRoles> =>
  prisma.user.create({
    data: {
      email,
      ...(fullName !== undefined && { fullName }),
      ...(mobile !== undefined && { mobile }),
      roles: { create: { role: { connect: { roleName: "ROLE_USER" } } } },
    },
    include: { roles: { include: { role: true } } },
  });

// Record a wrong-password attempt. `lockedUntil` is set to a future time once the
// attempt limit is hit (temporary cooldown), or null while still under the limit.
// Never touches `locked` — that flag is reserved for admin bans.
export const recordLoginFailure = (userId: string, attempts: number, lockedUntil: Date | null) =>
  prisma.user.update({
    where: { userId },
    data: { failedLoginAttempts: attempts, lockedUntil },
  });

// Clear the counter and any cooldown after a successful login.
export const resetFailedAttempts = (userId: string) =>
  prisma.user.update({ where: { userId }, data: { failedLoginAttempts: 0, lockedUntil: null } });

// ─── Sessions (multi-device, session-backed auth) ────────────────────────────

// Created with an empty refreshHash; the hash is set immediately after the
// refresh token is signed (it needs the session id, which only exists post-create).
export const createSession = (
  db: DBClient,
  userId: string,
  ipAddress: string | null,
  userAgent: string | null,
) =>
  db.session.create({
    data: {
      userId,
      refreshHash: "",
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + REFRESH_EXPIRY_MS),
    },
    select: { id: true },
  });

export const updateSessionHash = (db: DBClient, sessionId: string, refreshHash: string) =>
  db.session.update({
    where: { id: sessionId },
    data: { refreshHash },
    select: { id: true },
  });

// Compare-and-swap — only replaces the hash if it still matches currentHash.
// Returns { count }; 0 means a concurrent refresh already rotated the token (race lost).
export const updateSessionHashIfMatch = (
  sessionId: string,
  currentHash: string,
  newHash: string,
) =>
  prisma.session.updateMany({
    where: { id: sessionId, refreshHash: currentHash },
    data: { refreshHash: newHash },
  });

export const findSessionById = (sessionId: string) =>
  prisma.session.findUnique({
    where: { id: sessionId },
    select: { id: true, userId: true, refreshHash: true, revoked: true, expiresAt: true },
  });

// Single JOIN — validates session + user (with role) in one DB round trip,
// used by the authenticate middleware on every protected request.
export const findSessionWithUser = (sessionId: string) =>
  prisma.session.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      userId: true,
      revoked: true,
      expiresAt: true,
      user: {
        select: {
          userId: true,
          locked: true,
          roles: { select: { role: { select: { roleName: true } } } },
        },
      },
    },
  });

export const revokeSession = (sessionId: string) =>
  prisma.session.update({ where: { id: sessionId }, data: { revoked: true }, select: { id: true } });

export const revokeAllUserSessions = (db: DBClient, userId: string) =>
  db.session.updateMany({ where: { userId, revoked: false }, data: { revoked: true } });

// Revoke every active session for a user except one (the caller's current session) —
// used when a logged-in user changes their password to boot all other devices.
export const revokeOtherUserSessions = (userId: string, exceptSessionId: string) =>
  prisma.session.updateMany({
    where: { userId, revoked: false, id: { not: exceptSessionId } },
    data: { revoked: true },
  });

export const deleteSessionById = (sessionId: string, userId: string) =>
  prisma.session.deleteMany({ where: { id: sessionId, userId } });

// Purge expired/revoked sessions — run on a cron so the table stays bounded.
export const deleteStaleSessions = () =>
  prisma.session.deleteMany({
    where: { OR: [{ expiresAt: { lt: new Date() } }, { revoked: true }] },
  });

export const findForgotPassword = (userId: string) =>
  prisma.forgotPassword.findUnique({ where: { userId } });

export const upsertForgotPassword = (userId: string, otp: number, expiresAt: Date) =>
  prisma.forgotPassword.upsert({
    where: { userId },
    create: { userId, otp, expiresAt, lastOtpSentAt: new Date() },
    // A fresh OTP resets the wrong-guess counter and stamps the send time.
    update: { otp, expiresAt, attempts: 0, lastOtpSentAt: new Date() },
  });

export const incrementForgotPasswordAttempts = (userId: string): Promise<{ attempts: number }> =>
  prisma.forgotPassword.update({
    where: { userId },
    data: { attempts: { increment: 1 } },
    select: { attempts: true },
  });

export const deleteForgotPassword = (userId: string) =>
  prisma.forgotPassword.delete({ where: { userId } });

// Set a new password (forgot-password flow) and clear any login cooldown — this is the
// self-service escape hatch from an auto-cooldown. Admin bans (`locked`) are untouched.
export const updateUserPassword = (userId: string, password: string) =>
  prisma.user.update({
    where: { userId },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });
