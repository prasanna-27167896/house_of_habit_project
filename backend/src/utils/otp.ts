import { randomInt } from "node:crypto";

// Cryptographically secure 4-digit OTP. randomInt draws from the OS CSPRNG and
// the upper bound is exclusive, so this yields 1000–9999 inclusive.
export const generateOtp = (): number => randomInt(1000, 10000);

export const otpExpiresAt = (minutesFromNow = 10): Date => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + minutesFromNow);
  return d;
};
