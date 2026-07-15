import { AppError } from "@utils/AppError";

export const OrderErrors = {
  ORDER_NOT_FOUND: () =>
    new AppError("Order not found.", 404, "ORDER_NOT_FOUND"),
  CART_EMPTY: () =>
    new AppError("Your cart is empty.", 400, "CART_EMPTY"),
  ORDER_CANNOT_CANCEL: () =>
    new AppError("Order cannot be cancelled at this stage.", 400, "ORDER_CANNOT_CANCEL"),
  COUPON_MIN_ORDER_NOT_MET: (minValue: number) =>
    new AppError(
      `Minimum order value of ₹${minValue} required for this coupon.`,
      400,
      "COUPON_MIN_ORDER_NOT_MET",
    ),
  PRODUCT_UNAVAILABLE: () =>
    new AppError("One or more items in your cart are no longer available.", 400, "PRODUCT_UNAVAILABLE"),
  OUT_OF_STOCK: (title: string, available: number) =>
    new AppError(
      `"${title}" has only ${available} unit(s) in stock.`,
      400,
      "OUT_OF_STOCK",
    ),
  INVALID_STATUS_TRANSITION: (from: string, to: string) =>
    new AppError(`Cannot change order status from ${from} to ${to}.`, 400, "INVALID_STATUS_TRANSITION"),
  INVALID_PAYMENT_STATUS_TRANSITION: (from: string, to: string) =>
    new AppError(
      `Cannot change payment status from ${from} to ${to}. Use the cancel/refund flow for changes with side effects.`,
      400,
      "INVALID_PAYMENT_STATUS_TRANSITION",
    ),
  CANNOT_DELETE_PAID_ORDER: () =>
    new AppError("A paid order cannot be deleted. Cancel it instead.", 409, "CANNOT_DELETE_PAID_ORDER"),
  CANNOT_DELETE_ACTIVE_ORDER: () =>
    new AppError(
      "This order has stock committed to it and cannot be deleted. Cancel it first (which restores stock).",
      409,
      "CANNOT_DELETE_ACTIVE_ORDER",
    ),
  NO_REFUND_PENDING: () =>
    new AppError("This order has no pending refund.", 400, "NO_REFUND_PENDING"),
};
