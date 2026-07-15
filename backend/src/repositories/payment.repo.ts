import { prisma } from "@lib/prisma";
import type { Prisma } from "@generated/prisma/client";
import type { Payment, PaymentCreateData } from "@interfaces/payment.types";

// Prisma interactive transaction client type
type PrismaTx = Prisma.TransactionClient;

// ─── Transaction-aware (called from within another repo's $transaction) ────────

export const txCreatePayment = (tx: PrismaTx, data: PaymentCreateData): Promise<Payment> =>
  tx.payment.create({ data });

// ─── Standalone queries ───────────────────────────────────────────────────────

// Standalone audit write — used by webhook to log its own confirmation record
export const createPaymentAuditRecord = (data: PaymentCreateData): Promise<Payment> =>
  prisma.payment.create({ data });

export const findPaymentsByOrderId = (orderId: string): Promise<Payment[]> =>
  prisma.payment.findMany({
    where: { orderId },
    orderBy: { createdAt: "desc" },
  });

export const findPaymentById = (paymentId: string): Promise<Payment | null> =>
  prisma.payment.findUnique({ where: { paymentId } });
