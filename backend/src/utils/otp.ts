import { randomInt } from "node:crypto";

// Cryptographically secure 6-digit OTP. randomInt draws from the OS CSPRNG and
// the upper bound is exclusive, so this yields 100000–999999 inclusive.
export const generateOtp = (): number => randomInt(100000, 1000000);

export const otpExpiresAt = (minutesFromNow = 10): Date => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + minutesFromNow);
  return d;
};
