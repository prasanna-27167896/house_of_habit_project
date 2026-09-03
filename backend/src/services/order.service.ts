import * as orderRepo from "@repos/order.repo";
import { Errors } from "@errors/index";
import type {
  OrderWithRelations,
  OrderListResult,
  OrderStats,
  MonthlyCount,
  OrderStatus,
  PaymentStatus,
} from "@interfaces/order.types";
import type {
  CancelOrderInput,
  UpdateOrderStatusInput,
  UpdatePaymentStatusInput,
  OrderListQuery,
  MyOrderListQuery,
  MonthlyCountsQuery,
} from "@validators/order.schema";

// ─── Statuses that allow cancellation ────────────────────────────────────────

const CANCELLABLE_STATUSES: OrderStatus[] = [
  "PENDING",
  "ORDER_PLACED",
  "CONFIRMED",
  "PROCESSING",
];

// Allowed admin status transitions (a simple forward-only state machine).
const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["ORDER_PLACED", "CONFIRMED", "CANCELLED"],
  ORDER_PLACED: ["CONFIRMED", "PROCESSING", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["IN_TRANSIT", "DELIVERED"],
  IN_TRANSIT: ["DELIVERED"],
  DELIVERED: ["RETURN_REQUESTED"],
  RETURN_REQUESTED: ["RETURNED", "RETURN_REJECTED"],
  RETURNED: [],
  RETURN_REJECTED: [],
  CANCELLED: [],
};

// Allowed MANUAL payment-status overrides by an admin. The only safe, side-effect-free
// change is recording COD cash collected (COD_PENDING → COMPLETED). Everything else
// (marking paid/failed/cancelled) has stock or refund side effects and must go through the
// order-status / cancel / refund flows, so those transitions are intentionally empty.
const PAYMENT_STATUS_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  PENDING: [],
  PROCESSING: [],
  COD_PENDING: ["COMPLETED"],
  COMPLETED: [],
  FAILED: [],
  CANCELLED: [],
};

// ─── Customer — queries / cancel ──────────────────────────────────────────────

export const getUserOrders = async (
  userId: string,
  query: MyOrderListQuery,
): Promise<OrderListResult> => {
  const skip = (query.page - 1) * query.limit;
  const filters = {
    status: query.status,
    startDate: query.startDate,
    endDate: query.endDate,
    search: query.search,
  };
  const [orders, total] = await Promise.all([
    orderRepo.findOrdersByUser(userId, skip, query.limit, filters),
    orderRepo.countOrdersByUser(userId, filters),
  ]);
  return { orders, total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) };
};

export const getOrderDetail = async (
  userId: string,
  orderId: string,
): Promise<OrderWithRelations> => {
  const order = await orderRepo.findOrderByIdForUser(orderId, userId);
  if (!order) throw Errors.ORDER_NOT_FOUND();
  return order;
};

export const cancelOrder = async (
  userId: string,
  orderId: string,
  input: CancelOrderInput,
): Promise<OrderWithRelations> => {
  const order = await orderRepo.findOrderByIdForUser(orderId, userId);
  if (!order) throw Errors.ORDER_NOT_FOUND();

  if (!CANCELLABLE_STATUSES.includes(order.orderStatus)) {
    throw Errors.ORDER_CANNOT_CANCEL();
  }

  // Restores stock, releases the coupon, and flags a refund if the order was paid.
  return orderRepo.cancelOrderTransaction(orderId, "CUSTOMER", input);
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminGetAllOrders = async (query: OrderListQuery): Promise<OrderListResult> => {
  const skip = (query.page - 1) * query.limit;
  const [orders, total] = await Promise.all([
    orderRepo.findAllOrders(skip, query.limit),
    orderRepo.countAllOrders(),
  ]);
  return { orders, total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) };
};

export const adminGetAllOrdersNoPagination = (): Promise<OrderWithRelations[]> =>
  orderRepo.findAllOrdersNoPagination();

export const adminGetOrderById = async (orderId: string): Promise<OrderWithRelations> => {
  const order = await orderRepo.findOrderById(orderId);
  if (!order) throw Errors.ORDER_NOT_FOUND();
  return order;
};

export const adminGetOrdersByStatus = (status: OrderStatus): Promise<OrderWithRelations[]> =>
  orderRepo.findOrdersByStatus(status);

export const adminGetOrdersByUser = (userId: string): Promise<OrderWithRelations[]> =>
  orderRepo.findOrdersByUserId(userId);

export const adminUpdateOrderStatus = async (
  orderId: string,
  input: UpdateOrderStatusInput,
): Promise<OrderWithRelations> => {
  const order = await orderRepo.findOrderById(orderId);
  if (!order) throw Errors.ORDER_NOT_FOUND();

  const target = input.orderStatus;
  if (target === order.orderStatus) return order; // no-op

  const allowed = STATUS_TRANSITIONS[order.orderStatus] ?? [];
  if (!allowed.includes(target)) {
    throw Errors.INVALID_STATUS_TRANSITION(order.orderStatus, target);
  }

  // Cancellation must restore stock + handle the refund → route through the cancel
  // transaction (recorded as an ADMIN action).
  if (target === "CANCELLED") {
    return orderRepo.cancelOrderTransaction(orderId, "ADMIN");
  }

  if (target === "DELIVERED") {
    // Delivery is when COD cash is collected → the COD payment becomes COMPLETED here.
    const extra: { deliveredAt: Date; paymentStatus?: PaymentStatus } = { deliveredAt: new Date() };
    if (order.paymentStatus === "COD_PENDING") extra.paymentStatus = "COMPLETED";
    return orderRepo.updateOrderStatus(orderId, target, extra);
  }

  return orderRepo.updateOrderStatus(orderId, target);
};

export const adminUpdatePaymentStatus = async (
  orderId: string,
  input: UpdatePaymentStatusInput,
): Promise<OrderWithRelations> => {
  const order = await orderRepo.findOrderById(orderId);
  if (!order) throw Errors.ORDER_NOT_FOUND();

  const target = input.paymentStatus;
  if (target === order.paymentStatus) return order; // no-op

  // Guard against free-form overrides that would desync stock/refunds (e.g. marking an
  // unpaid online order COMPLETED, or erasing a paid order's money trail).
  const allowed = PAYMENT_STATUS_TRANSITIONS[order.paymentStatus] ?? [];
  if (!allowed.includes(target)) {
    throw Errors.INVALID_PAYMENT_STATUS_TRANSITION(order.paymentStatus, target);
  }

  return orderRepo.updatePaymentStatus(orderId, target);
};

export const adminDeleteOrder = async (orderId: string): Promise<void> => {
  const order = await orderRepo.findOrderById(orderId);
  if (!order) throw Errors.ORDER_NOT_FOUND();

  // Never destroy the financial record of a paid order (its Payment audit trail
  // would cascade away). Cancel it instead if needed.
  if (order.paymentStatus === "COMPLETED") throw Errors.CANNOT_DELETE_PAID_ORDER();

  // A COD_PENDING order has stock committed to it — deleting would leak that inventory
  // (delete doesn't restore stock). Require a cancel first, which restores it.
  if (order.paymentStatus === "COD_PENDING") throw Errors.CANNOT_DELETE_ACTIVE_ORDER();

  await orderRepo.deleteOrder(orderId);
};

// Mark a pending refund as completed (after the admin refunds via Razorpay).
export const adminMarkRefunded = async (orderId: string): Promise<OrderWithRelations> => {
  const order = await orderRepo.findOrderById(orderId);
  if (!order) throw Errors.ORDER_NOT_FOUND();
  if (order.refundStatus !== "REFUND_PENDING") throw Errors.NO_REFUND_PENDING();

  return orderRepo.markRefunded(orderId);
};

export const adminGetOrderStats = (): Promise<OrderStats> => orderRepo.getOrderStats();

export const adminGetMonthlyOrderCounts = (query: MonthlyCountsQuery): Promise<MonthlyCount[]> =>
  orderRepo.getMonthlyOrderCounts(query.year);
