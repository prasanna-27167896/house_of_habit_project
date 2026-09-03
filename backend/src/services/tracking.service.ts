import { prisma } from "@lib/prisma";
import * as orderRepo from "@repos/order.repo";
import * as trackingRepo from "@repos/tracking.repo";
import { Errors } from "@errors/index";
import type { OrderTrackingResult, OrderTrackingLog } from "@interfaces/tracking.types";
import type { AddTrackingNoteInput } from "@validators/tracking.schema";

// ─── Customer ─────────────────────────────────────────────────────────────────

export const getOrderTracking = async (userId: string, orderId: string): Promise<OrderTrackingResult> => {
  const order = await orderRepo.findOrderByIdForUser(orderId, userId);
  if (!order) throw Errors.ORDER_NOT_FOUND();

  const timeline = await trackingRepo.findLogsByOrderId(orderId);

  return {
    orderId: order.orderId,
    orderStatus: order.orderStatus,
    estimatedDelivery: order.estimatedDelivery,
    deliveredAt: order.deliveredAt,
    timeline,
  };
};

// ─── Admin ────────────────────────────────────────────────────────────────────

// Append a free-form note (e.g. carrier/AWB update) without changing orderStatus.
// Defaults the note's status to the order's current status so it slots into the
// timeline in the right place.
export const adminAddTrackingNote = async (
  orderId: string,
  input: AddTrackingNoteInput,
): Promise<OrderTrackingLog> => {
  const order = await orderRepo.findOrderById(orderId);
  if (!order) throw Errors.ORDER_NOT_FOUND();

  return prisma.$transaction((tx) =>
    trackingRepo.txCreateLogEntry(tx, {
      orderId,
      status: input.status ?? order.orderStatus,
      description: input.description,
    }),
  );
};
