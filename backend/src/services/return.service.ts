import * as orderRepo from "@repos/order.repo";
import * as returnRepo from "@repos/return.repo";
import { Errors } from "@errors/index";
import type { ReturnRequestWithItem, ReturnStatus } from "@interfaces/return.types";
import type { CreateReturnInput, UpdateReturnStatusInput, ReturnListQuery } from "@validators/return.schema";

// Customer can request a return within this many days of delivery.
export const RETURN_WINDOW_DAYS = 7;

const RETURN_STATUS_TRANSITIONS: Record<ReturnStatus, ReturnStatus[]> = {
  PENDING: ["APPROVED", "REJECTED"],
  APPROVED: ["COMPLETED"],
  REJECTED: [],
  COMPLETED: [],
};

// ─── Customer ─────────────────────────────────────────────────────────────────

export const createReturnRequest = async (
  userId: string,
  orderId: string,
  input: CreateReturnInput,
): Promise<ReturnRequestWithItem> => {
  const order = await orderRepo.findOrderByIdForUser(orderId, userId);
  if (!order) throw Errors.ORDER_NOT_FOUND();

  if (order.orderStatus !== "DELIVERED" || !order.deliveredAt) {
    throw Errors.ORDER_NOT_DELIVERED();
  }

  const windowEnd = new Date(order.deliveredAt);
  windowEnd.setDate(windowEnd.getDate() + RETURN_WINDOW_DAYS);
  if (new Date() > windowEnd) throw Errors.RETURN_WINDOW_EXPIRED(RETURN_WINDOW_DAYS);

  const item = order.orderItems.find((i) => i.orderItemId === input.orderItemId);
  if (!item) throw Errors.ORDER_ITEM_NOT_FOUND();

  const existing = await returnRepo.findReturnByOrderItemId(input.orderItemId);
  if (existing) throw Errors.ITEM_ALREADY_HAS_RETURN();

  return returnRepo.createReturnRequest({
    orderId,
    orderItemId: input.orderItemId,
    reasonCategory: input.reasonCategory,
    reasonDetail: input.reasonDetail,
    comment: input.comment ?? null,
  });
};

export const getReturnsForOrder = async (
  userId: string,
  orderId: string,
): Promise<ReturnRequestWithItem[]> => {
  const order = await orderRepo.findOrderByIdForUser(orderId, userId);
  if (!order) throw Errors.ORDER_NOT_FOUND();
  return returnRepo.findReturnsByOrderId(orderId);
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminGetAllReturns = async (
  query: ReturnListQuery,
): Promise<{ returns: ReturnRequestWithItem[]; total: number; page: number; limit: number; totalPages: number }> => {
  const skip = (query.page - 1) * query.limit;
  const [returns, total] = await Promise.all([
    returnRepo.findAllReturns(skip, query.limit, query.status),
    returnRepo.countAllReturns(query.status),
  ]);
  return { returns, total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) };
};

export const adminUpdateReturnStatus = async (
  returnId: string,
  input: UpdateReturnStatusInput,
): Promise<ReturnRequestWithItem> => {
  const returnRequest = await returnRepo.findReturnById(returnId);
  if (!returnRequest) throw Errors.RETURN_REQUEST_NOT_FOUND();

  const target = input.status;
  if (target === returnRequest.status) return returnRequest; // no-op

  const allowed = RETURN_STATUS_TRANSITIONS[returnRequest.status] ?? [];
  if (!allowed.includes(target)) {
    throw Errors.INVALID_RETURN_STATUS_TRANSITION(returnRequest.status, target);
  }

  return returnRepo.updateReturnStatus(returnId, target);
};
