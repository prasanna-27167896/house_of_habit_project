import * as React from "react";
import { resendClient } from "@lib/resend";
import { env } from "@config/env";
import { logger } from "@utils/logger";
import { OtpEmail } from "@emails/OtpEmail";
import { ForgotPasswordEmail } from "@emails/ForgotPasswordEmail";
import { ContactReplyEmail } from "@emails/ContactReplyEmail";
import { ReviewReplyEmail } from "@emails/ReviewReplyEmail";

const FROM = env.RESEND_FROM ?? "HoH <noreply@hoh.com>";

const send = async (
  to: string,
  subject: string,
  react: React.ReactElement,
): Promise<void> => {
  if (!resendClient) {
    logger.info({ to, subject }, "[DEV] Email not sent — Resend not configured");
    return;
  }
  const { error } = await resendClient.emails.send({ from: FROM, to: [to], subject, react });
  if (error) throw new Error(error.message);
};

export const sendOtpEmail = (to: string, otp: number): Promise<void> =>
  send(to, "Your HoH Verification Code", <OtpEmail otp={otp} />);

export const sendLoginOtpEmail = (to: string, otp: number): Promise<void> =>
  send(to, "Your HoH Login Code", <OtpEmail otp={otp} />);

export const sendForgotPasswordOtp = (to: string, otp: number): Promise<void> =>
  send(to, "Reset Your HoH Password", <ForgotPasswordEmail otp={otp} />);

export const sendContactReplyEmail = (
  to: string,
  name: string,
  subject: string,
  replyMessage: string,
): Promise<void> =>
  send(to, `Re: ${subject}`, <ContactReplyEmail name={name} subject={subject} replyMessage={replyMessage} />);

export const sendReviewReplyEmail = (
  to: string,
  userName: string,
  productTitle: string,
  replyText: string,
): Promise<void> =>
  send(to, `A reply to your review on "${productTitle}"`, <ReviewReplyEmail userName={userName} productTitle={productTitle} replyText={replyText} />);
