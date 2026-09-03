import * as orderRepo from "@repos/order.repo";
import * as deliveryFeedbackRepo from "@repos/deliveryFeedback.repo";
import { Errors } from "@errors/index";
import type { DeliveryFeedback, DeliveryFeedbackWithOrder } from "@interfaces/deliveryFeedback.types";
import type {
  CreateDeliveryFeedbackInput,
  DeliveryFeedbackListQuery,
} from "@validators/deliveryFeedback.schema";

// ─── Customer ─────────────────────────────────────────────────────────────────

export const createDeliveryFeedback = async (
  userId: string,
  orderId: string,
  input: CreateDeliveryFeedbackInput,
): Promise<DeliveryFeedback> => {
  const order = await orderRepo.findOrderByIdForUser(orderId, userId);
  if (!order) throw Errors.ORDER_NOT_FOUND();
  if (order.orderStatus !== "DELIVERED") throw Errors.ORDER_NOT_DELIVERED();

  const existing = await deliveryFeedbackRepo.findDeliveryFeedbackByOrderId(orderId);
  if (existing) throw Errors.DELIVERY_FEEDBACK_ALREADY_SUBMITTED();

  return deliveryFeedbackRepo.createDeliveryFeedback({
    orderId,
    rating: input.rating,
    comment: input.comment ?? null,
  });
};

export const getDeliveryFeedbackForOrder = async (
  userId: string,
  orderId: string,
): Promise<DeliveryFeedback | null> => {
  const order = await orderRepo.findOrderByIdForUser(orderId, userId);
  if (!order) throw Errors.ORDER_NOT_FOUND();
  return deliveryFeedbackRepo.findDeliveryFeedbackByOrderId(orderId);
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminGetAllDeliveryFeedback = async (
  query: DeliveryFeedbackListQuery,
): Promise<{
  feedback: DeliveryFeedbackWithOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  const skip = (query.page - 1) * query.limit;
  const [feedback, total] = await Promise.all([
    deliveryFeedbackRepo.findAllDeliveryFeedback(skip, query.limit),
    deliveryFeedbackRepo.countAllDeliveryFeedback(),
  ]);
  return { feedback, total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) };
};
