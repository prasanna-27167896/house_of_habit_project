import { Resend } from "resend";
import { env } from "@config/env";

export const resendClient = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;
