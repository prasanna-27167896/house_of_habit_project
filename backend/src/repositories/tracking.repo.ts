import { prisma } from "@lib/prisma";
import type { Prisma } from "@generated/prisma/client";
import type { OrderTrackingLog, CreateTrackingLogData } from "@interfaces/tracking.types";

type PrismaTx = Prisma.TransactionClient;

// Called from order.repo.ts inside the same transaction as an orderStatus write,
// so the timeline entry and the status change commit or roll back together.
export const txCreateLogEntry = (tx: PrismaTx, data: CreateTrackingLogData): Promise<OrderTrackingLog> =>
  tx.orderTrackingLog.create({
    data: {
      orderId: data.orderId,
      status: data.status,
      description: data.description ?? null,
    },
  });

export const findLogsByOrderId = (orderId: string): Promise<OrderTrackingLog[]> =>
  prisma.orderTrackingLog.findMany({
    where: { orderId },
    orderBy: { createdAt: "asc" },
  });
