import type { Payment, PaymentStatus } from "@generated/prisma/client";

export type { Payment, PaymentStatus };

export type PaymentCreateData = {
  orderId: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  amount: number;
  currency: string;
  method: string | null;
  status: PaymentStatus;
  source: string | null;
};
