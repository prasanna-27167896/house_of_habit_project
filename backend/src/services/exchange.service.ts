import * as orderRepo from "@repos/order.repo";
import * as exchangeRepo from "@repos/exchange.repo";
import { Errors } from "@errors/index";
import type { ExchangeRequestWithItem, ExchangeStatus } from "@interfaces/exchange.types";
import type { CreateExchangeInput, UpdateExchangeStatusInput, ExchangeListQuery } from "@validators/exchange.schema";

// Customer can request an exchange within this many days of delivery.
export const EXCHANGE_WINDOW_DAYS = 7;

const EXCHANGE_STATUS_TRANSITIONS: Record<ExchangeStatus, ExchangeStatus[]> = {
  PENDING: ["APPROVED", "REJECTED"],
  APPROVED: ["COMPLETED"],
  REJECTED: [],
  COMPLETED: [],
};

// ─── Customer ─────────────────────────────────────────────────────────────────

export const createExchangeRequest = async (
  userId: string,
  orderId: string,
  input: CreateExchangeInput,
): Promise<ExchangeRequestWithItem> => {
  const order = await orderRepo.findOrderByIdForUser(orderId, userId);
  if (!order) throw Errors.ORDER_NOT_FOUND();

  if (order.orderStatus !== "DELIVERED" || !order.deliveredAt) {
    throw Errors.ORDER_NOT_DELIVERED();
  }

  const windowEnd = new Date(order.deliveredAt);
  windowEnd.setDate(windowEnd.getDate() + EXCHANGE_WINDOW_DAYS);
  if (new Date() > windowEnd) throw Errors.RETURN_WINDOW_EXPIRED(EXCHANGE_WINDOW_DAYS);

  const item = order.orderItems.find((i) => i.orderItemId === input.orderItemId);
  if (!item) throw Errors.ORDER_ITEM_NOT_FOUND();

  const existing = await exchangeRepo.findExchangeByOrderItemId(input.orderItemId);
  if (existing) throw Errors.ITEM_ALREADY_HAS_EXCHANGE();

  return exchangeRepo.createExchangeRequest({
    orderId,
    orderItemId: input.orderItemId,
    originalSize: item.size,
    requestedSize: input.requestedSize,
    reasonCategory: input.reasonCategory,
    reasonDetail: input.reasonDetail,
  });
};

export const getExchangesForOrder = async (
  userId: string,
  orderId: string,
): Promise<ExchangeRequestWithItem[]> => {
  const order = await orderRepo.findOrderByIdForUser(orderId, userId);
  if (!order) throw Errors.ORDER_NOT_FOUND();
  return exchangeRepo.findExchangesByOrderId(orderId);
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminGetAllExchanges = async (
  query: ExchangeListQuery,
): Promise<{
  exchanges: ExchangeRequestWithItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  const skip = (query.page - 1) * query.limit;
  const [exchanges, total] = await Promise.all([
    exchangeRepo.findAllExchanges(skip, query.limit, query.status),
    exchangeRepo.countAllExchanges(query.status),
  ]);
  return { exchanges, total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) };
};

export const adminUpdateExchangeStatus = async (
  exchangeId: string,
  input: UpdateExchangeStatusInput,
): Promise<ExchangeRequestWithItem> => {
  const exchangeRequest = await exchangeRepo.findExchangeById(exchangeId);
  if (!exchangeRequest) throw Errors.EXCHANGE_REQUEST_NOT_FOUND();

  const target = input.status;
  if (target === exchangeRequest.status) return exchangeRequest; // no-op

  const allowed = EXCHANGE_STATUS_TRANSITIONS[exchangeRequest.status] ?? [];
  if (!allowed.includes(target)) {
    throw Errors.INVALID_EXCHANGE_STATUS_TRANSITION(exchangeRequest.status, target);
  }

  return exchangeRepo.updateExchangeStatus(exchangeId, target);
};
