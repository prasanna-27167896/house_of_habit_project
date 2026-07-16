import { createHash } from "node:crypto";
import { prisma } from "@lib/prisma";
import * as authRepo from "@repos/auth.repo";
import { Errors } from "@errors/index";
import { generateOtp, otpExpiresAt } from "@utils/otp";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@utils/jwt";
import { sendOtpEmail, sendForgotPasswordOtp } from "@utils/email";
import type { SafeUser, AuthResult, RefreshResult } from "@interfaces/auth.types";
import type { UserWithRoles } from "@interfaces/user.types";
import type { RegisterInput } from "@validators/auth.schema";

const MAX_FAILED_ATTEMPTS = 5;
const LOGIN_COOLDOWN_MS = 15 * 60 * 1000; // temporary lockout after MAX_FAILED_ATTEMPTS wrong passwords
const MAX_OTP_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // min gap between OTP emails to the same address
const VERIFIED_STATE_TTL_MS = 30 * 60 * 1000; // how long a verified-but-unregistered email stays claimable

// True if an OTP was emailed to this record within the resend cooldown window.
const withinResendCooldown = (lastOtpSentAt: Date | null | undefined): boolean =>
  lastOtpSentAt != null && Date.now() - lastOtpSentAt.getTime() < OTP_RESEND_COOLDOWN_MS;

// Wrong-OTP handler: bump the per-record counter and, once the limit is hit,
// invalidate the OTP so it can't be brute-forced. Always throws.
const rejectOtp = async (
  incrementAttempts: () => Promise<{ attempts: number }>,
  invalidate: () => Promise<unknown>,
): Promise<never> => {
  const { attempts } = await incrementAttempts();
  if (attempts >= MAX_OTP_ATTEMPTS) {
    await invalidate();
    throw Errors.OTP_MAX_ATTEMPTS();
  }
  throw Errors.OTP_INVALID();
};

const safeUser = (user: SafeUser): SafeUser => ({
  userId: user.userId,
  fullName: user.fullName,
  email: user.email,
  mobile: user.mobile,
  dateOfBirth: user.dateOfBirth,
  imageUrl: user.imageUrl,
  locked: user.locked,
  createdAt: user.createdAt,
});

const roleOf = (user: UserWithRoles): string => user.roles[0]?.role.roleName ?? "ROLE_USER";

// SHA-256 of the refresh token — only ever the hash is stored in the DB.
const hashToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");

// ─── Session issuance ────────────────────────────────────────────────────────
// Multi-device: a new login creates its own session and never touches the others.
const issueSession = async (
  userId: string,
  role: string,
  ipAddress: string | null,
  userAgent: string | null,
): Promise<{ accessToken: string; refreshToken: string }> =>
  prisma.$transaction(async (tx) => {
    const session = await authRepo.createSession(tx, userId, ipAddress, userAgent);
    const accessToken = signAccessToken(userId, session.id, role);
    const refreshToken = signRefreshToken(userId, session.id);
    await authRepo.updateSessionHash(tx, session.id, hashToken(refreshToken));
    return { accessToken, refreshToken };
  });

// ─── Email verification (OTP) ────────────────────────────────────────────────

export const sendVerificationOtp = async (email: string): Promise<void> => {
  // Throttle resends to the same address (email-bombing / Resend quota protection).
  const record = await authRepo.findEmailVerification(email);
  if (withinResendCooldown(record?.lastOtpSentAt)) throw Errors.OTP_RESEND_COOLDOWN();

  const otp = generateOtp();
  await authRepo.upsertEmailVerification(email, otp, otpExpiresAt());
  await sendOtpEmail(email, otp);
};

export const verifyRegistrationOtp = async (
  email: string,
  otp: number,
  ipAddress: string | null = null,
  userAgent: string | null = null,
): Promise<{ user?: SafeUser; accessToken?: string; refreshToken?: string; isVerified?: boolean }> => {
  const record = await authRepo.findEmailVerification(email);
  if (!record) throw Errors.OTP_NOT_FOUND();
  if (record.isVerified) throw Errors.EMAIL_ALREADY_VERIFIED();
  if (record.expiresAt < new Date()) throw Errors.OTP_EXPIRED();
  if (record.otp !== otp) {
    await rejectOtp(
      () => authRepo.incrementEmailVerificationAttempts(email),
      () => authRepo.deleteEmailVerification(email),
    );
  }

  const existingUser = await authRepo.findUserByEmail(email);
  if (existingUser) {
    await authRepo.deleteEmailVerification(email);
    const { accessToken, refreshToken } = await issueSession(
      existingUser.userId,
      roleOf(existingUser),
      ipAddress,
      userAgent,
    );
    return { user: safeUser(existingUser), accessToken, refreshToken };
  }

  // Verified state is only good for a limited window — register must complete before it.
  await authRepo.markEmailVerified(email, new Date(Date.now() + VERIFIED_STATE_TTL_MS));
  return { isVerified: true };
};

// ─── Register / Refresh / Logout ─────────────────────────────────────

export const register = async (
  data: RegisterInput,
  ipAddress: string | null,
  userAgent: string | null,
): Promise<AuthResult> => {
  const verification = await authRepo.findEmailVerification(data.email);
  if (!verification?.isVerified) throw Errors.EMAIL_NOT_VERIFIED();
  // Verified state expires — forces a re-verify so a stale verified email can't be claimed.
  if (verification.expiresAt < new Date()) throw Errors.EMAIL_VERIFICATION_EXPIRED();

  const user = await authRepo.createUser(data.email, data.fullName, data.mobile);

  await authRepo.deleteEmailVerification(data.email);

  const { accessToken, refreshToken } = await issueSession(
    user.userId,
    roleOf(user),
    ipAddress,
    userAgent,
  );

  return { user: safeUser(user), accessToken, refreshToken };
};

export const refresh = async (token: string): Promise<RefreshResult> => {
  const payload = verifyRefreshToken(token); // throws on tampered/expired JWT

  const session = await authRepo.findSessionById(payload.sessionId);
  if (!session) throw Errors.INVALID_REFRESH_TOKEN();
  if (session.userId !== payload.userId) throw Errors.INVALID_REFRESH_TOKEN();
  if (session.revoked) throw Errors.SESSION_EXPIRED();
  if (session.expiresAt < new Date()) throw Errors.SESSION_EXPIRED();

  // Reuse detection: the presented token must hash to the stored value. A mismatch
  // means an old, already-rotated token is being replayed → revoke this session.
  if (hashToken(token) !== session.refreshHash) {
    await authRepo.revokeSession(session.id);
    throw Errors.INVALID_REFRESH_TOKEN();
  }

  const user = await authRepo.findUserWithRolesById(session.userId);
  if (!user) throw Errors.ACCOUNT_NOT_FOUND();
  if (user.locked) throw Errors.ACCOUNT_LOCKED();

  const role = roleOf(user);
  const newAccessToken = signAccessToken(user.userId, session.id, role);
  const newRefreshToken = signRefreshToken(user.userId, session.id);

  // Atomic compare-and-swap: only the request holding the current hash wins.
  // If two refreshes race past the check above, the loser gets count 0 → revoke.
  const updated = await authRepo.updateSessionHashIfMatch(
    session.id,
    session.refreshHash,
    hashToken(newRefreshToken),
  );
  if (updated.count === 0) {
    await authRepo.revokeSession(session.id);
    throw Errors.INVALID_REFRESH_TOKEN();
  }

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logout = async (sessionId: string, userId: string): Promise<void> => {
  await authRepo.deleteSessionById(sessionId, userId);
};

// ─── Forgot password (OTP) ───────────────────────────────────────────────────

export const sendForgotPasswordOtpService = async (email: string): Promise<void> => {
  const user = await authRepo.findUserByEmail(email);
  // Return silently for unknown emails — the controller responds the same either
  // way, so this endpoint can't be used to enumerate registered accounts.
  if (!user) return;

  // Throttle resends. Return silently (not an error) so the generic response is
  // identical whether or not a cooldown is active — preserves anti-enumeration.
  const record = await authRepo.findForgotPassword(user.userId);
  if (withinResendCooldown(record?.lastOtpSentAt)) return;

  const otp = generateOtp();
  await authRepo.upsertForgotPassword(user.userId, otp, otpExpiresAt());
  await sendForgotPasswordOtp(email, otp);
};

export const verifyForgotPasswordOtp = async (email: string, otp: number): Promise<void> => {
  const user = await authRepo.findUserByEmail(email);
  if (!user) throw Errors.ACCOUNT_NOT_FOUND();

  const record = await authRepo.findForgotPassword(user.userId);
  if (!record) throw Errors.OTP_NOT_REQUESTED();
  if (record.expiresAt < new Date()) throw Errors.OTP_EXPIRED();
  if (record.otp !== otp) {
    await rejectOtp(
      () => authRepo.incrementForgotPasswordAttempts(user.userId),
      () => authRepo.deleteForgotPassword(user.userId),
    );
  }
};


