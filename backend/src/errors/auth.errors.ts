import { AppError } from "@utils/AppError";

export const AuthErrors = {
  EMAIL_ALREADY_REGISTERED: () =>
    new AppError("Email is already registered.", 409, "EMAIL_ALREADY_REGISTERED"),
  OTP_NOT_FOUND: () =>
    new AppError("No OTP found for this email.", 404, "OTP_NOT_FOUND"),
  EMAIL_ALREADY_VERIFIED: () =>
    new AppError("Email is already verified.", 400, "EMAIL_ALREADY_VERIFIED"),
  OTP_INVALID: () =>
    new AppError("Invalid OTP.", 400, "OTP_INVALID"),
  OTP_EXPIRED: () =>
    new AppError("OTP has expired.", 400, "OTP_EXPIRED"),
  OTP_MAX_ATTEMPTS: () =>
    new AppError("Too many incorrect attempts. Please request a new OTP.", 429, "OTP_MAX_ATTEMPTS"),
  EMAIL_NOT_VERIFIED: () =>
    new AppError("Please verify your email before registering.", 400, "EMAIL_NOT_VERIFIED"),
  EMAIL_VERIFICATION_EXPIRED: () =>
    new AppError("Your email verification has expired. Please verify again.", 400, "EMAIL_VERIFICATION_EXPIRED"),
  OTP_RESEND_COOLDOWN: () =>
    new AppError("Please wait a moment before requesting another code.", 429, "OTP_RESEND_COOLDOWN"),
  INVALID_CREDENTIALS: () =>
    new AppError("Invalid email or password.", 401, "INVALID_CREDENTIALS"),
  ACCOUNT_LOCKED: () =>
    new AppError("Account is locked. Please contact support.", 403, "ACCOUNT_LOCKED"),
  LOGIN_COOLDOWN: (minutes: number) =>
    new AppError(
      `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}, or reset your password via email.`,
      429,
      "LOGIN_COOLDOWN",
    ),
  INVALID_REFRESH_TOKEN: () =>
    new AppError("Invalid refresh token.", 401, "INVALID_REFRESH_TOKEN"),
  SESSION_EXPIRED: () =>
    new AppError("Session expired. Please log in again.", 401, "SESSION_EXPIRED"),
  ACCOUNT_NOT_FOUND: () =>
    new AppError("No account found with this email.", 404, "ACCOUNT_NOT_FOUND"),
  OTP_NOT_REQUESTED: () =>
    new AppError("No OTP requested for this account.", 404, "OTP_NOT_REQUESTED"),
};
