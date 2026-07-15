import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  PASSWORD_PEPPER: z.string().min(32),

  CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
  CLOUDFLARE_PUBLIC_ACCESS_KEY_ID: z.string().min(1),
  CLOUDFLARE_PUBLIC_SECRET_ACCESS_KEY: z.string().min(1),
  CLOUDFLARE_PUBLIC_BUCKET_NAME: z.string().min(1),
  CLOUDFLARE_PUBLIC_URL: z
    .string()
    .url("CLOUDFLARE_PUBLIC_URL must be a full URL with https://"),
  CLOUDFLARE_PRIVATE_ACCESS_KEY_ID: z.string().min(1),
  CLOUDFLARE_PRIVATE_SECRET_ACCESS_KEY: z.string().min(1),
  CLOUDFLARE_PRIVATE_BUCKET_NAME: z.string().min(1),

  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM: z.string().optional(),

  RAZORPAY_API_KEY: z.string().min(1),
  RAZORPAY_SECRET_KEY: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),

  PORT: z.string().default("3006"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
});

const result = schema.safeParse(process.env);

if (!result.success) {
  console.error("❌ Missing or invalid environment variables:");
  console.error(JSON.stringify(result.error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

export const env = result.data;
export type Env = typeof env;
