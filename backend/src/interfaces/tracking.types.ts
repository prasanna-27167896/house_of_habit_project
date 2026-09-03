import type { OrderTrackingLog, OrderStatus } from "@generated/prisma/client";

export type { OrderTrackingLog };

export type CreateTrackingLogData = {
  orderId: string;
  status: OrderStatus;
  description?: string | null;
};

export type OrderTrackingResult = {
  orderId: string;
  orderStatus: OrderStatus;
  estimatedDelivery: Date | null;
  deliveredAt: Date | null;
  timeline: OrderTrackingLog[];
};
