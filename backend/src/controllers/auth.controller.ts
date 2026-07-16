import type { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { sendSuccess } from "@utils/response";
import { baseCookieOptions, refreshCookieOptions } from "@utils/jwt";
import { Errors } from "@errors/index";
import * as authService from "@services/auth.service";
import {
  sendOtpSchema,
  verifyOtpSchema,
  registerSchema,
  loginSchema,
  forgotPasswordMailSchema,
  forgotPasswordOtpSchema,
  changePasswordSchema,
} from "@validators/auth.schema";

// Client metadata recorded on each session for auditability / anomaly review.
// req.ip is trustworthy because app.ts sets `trust proxy`.
const getClientMeta = (req: Request): { ipAddress: string | null; userAgent: string | null } => ({
  ipAddress: req.ip ?? null,
  userAgent: typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"] : null,
});

// ─── Registration & Login OTP ────────────────────────────────────────────────

export const sendVerificationOtp = asyncHandler(async (req: Request, res: Response) => {
  const rawEmail = req.query["email"] ?? req.body?.email;
  const { email } = sendOtpSchema.parse({ email: rawEmail });
  await authService.sendVerificationOtp(email);
  sendSuccess(res, { message: "OTP sent to your email." });
});

export const verifyRegistrationOtp = asyncHandler(async (req: Request, res: Response) => {
  const emailParam = (req.params as { email?: string }).email;
  const rawEmail = emailParam ?? req.body?.email;
  const { otp } = verifyOtpSchema.parse(req.body);
  const { ipAddress, userAgent } = getClientMeta(req);

  const result = await authService.verifyRegistrationOtp(rawEmail, otp, ipAddress, userAgent);

  if (result.refreshToken) {
    res.cookie("refresh_token", result.refreshToken, refreshCookieOptions);
    sendSuccess(res, { message: "Login successful.", user: result.user, accessToken: result.accessToken });
  } else {
    sendSuccess(res, { message: "Email verified successfully." });
  }
});

// ─── Register / Login ─────────────────────────────────────────────────────────

export const register = asyncHandler(async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);
  const { ipAddress, userAgent } = getClientMeta(req);
  const { user, accessToken, refreshToken } = await authService.register(data, ipAddress, userAgent);

  res.cookie("refresh_token", refreshToken, refreshCookieOptions);
  sendSuccess(res, { user, accessToken }, 201);
});



// ─── Refresh (reads httpOnly cookie, rotates it) ──────────────────────────────

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.["refresh_token"] as string | undefined;
  if (!token) throw Errors.INVALID_REFRESH_TOKEN();

  const { accessToken, refreshToken } = await authService.refresh(token);

  res.cookie("refresh_token", refreshToken, refreshCookieOptions);
  sendSuccess(res, { accessToken });
});

// ─── Logout (authenticated — deletes this session, clears cookie) ─────────────

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await authService.logout(req.user!.sessionId, req.user!.userId);
  res.clearCookie("refresh_token", baseCookieOptions);
  sendSuccess(res, { message: "Logged out successfully." });
});

// ─── Forgot password ──────────────────────────────────────────────────────────

export const sendForgotPasswordOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email } = forgotPasswordMailSchema.parse(req.body);
  await authService.sendForgotPasswordOtpService(email);
  // Generic response regardless of whether the email exists (anti-enumeration).
  sendSuccess(res, { message: "If an account with that email exists, a password reset OTP has been sent." });
});

export const verifyForgotPasswordOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.params as { email: string };
  const { otp } = forgotPasswordOtpSchema.parse(req.body);
  await authService.verifyForgotPasswordOtp(email, otp);
  sendSuccess(res, { message: "OTP verified. You may now reset your password." });
});


