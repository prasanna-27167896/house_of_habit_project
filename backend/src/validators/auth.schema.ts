import { z } from "zod";

export const sendOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const verifyOtpSchema = z.object({
  otp: z.number({ error: "OTP must be a number" }).int().min(1000).max(9999),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number")
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const sendLoginOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const forgotPasswordMailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const forgotPasswordOtpSchema = z.object({
  otp: z.number({ error: "OTP must be a number" }).int().min(1000).max(9999),
});

export const changePasswordSchema = z.object({
  otp: z.number({ error: "OTP must be a number" }).int().min(1000).max(9999),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
