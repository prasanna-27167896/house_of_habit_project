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

  // ─── Returns & Exchanges ────────────────────────────────────────────────────
  ORDER_ITEM_NOT_FOUND: () =>
    new AppError("Order item not found on this order.", 404, "ORDER_ITEM_NOT_FOUND"),
  ORDER_NOT_DELIVERED: () =>
    new AppError("This action is only available once the order has been delivered.", 400, "ORDER_NOT_DELIVERED"),
  RETURN_WINDOW_EXPIRED: (days: number) =>
    new AppError(
      `The return/exchange window (${days} days from delivery) has expired for this order.`,
      400,
      "RETURN_WINDOW_EXPIRED",
    ),
  ITEM_ALREADY_HAS_RETURN: () =>
    new AppError("A return request already exists for this item.", 409, "ITEM_ALREADY_HAS_RETURN"),
  ITEM_ALREADY_HAS_EXCHANGE: () =>
    new AppError("An exchange request already exists for this item.", 409, "ITEM_ALREADY_HAS_EXCHANGE"),
  RETURN_REQUEST_NOT_FOUND: () =>
    new AppError("Return request not found.", 404, "RETURN_REQUEST_NOT_FOUND"),
  EXCHANGE_REQUEST_NOT_FOUND: () =>
    new AppError("Exchange request not found.", 404, "EXCHANGE_REQUEST_NOT_FOUND"),
  INVALID_RETURN_STATUS_TRANSITION: (from: string, to: string) =>
    new AppError(`Cannot change return status from ${from} to ${to}.`, 400, "INVALID_RETURN_STATUS_TRANSITION"),
  INVALID_EXCHANGE_STATUS_TRANSITION: (from: string, to: string) =>
    new AppError(`Cannot change exchange status from ${from} to ${to}.`, 400, "INVALID_EXCHANGE_STATUS_TRANSITION"),

  // ─── Invoice ────────────────────────────────────────────────────────────────
  INVOICE_NOT_AVAILABLE: () =>
    new AppError("Invoice is not available until the order is placed.", 400, "INVOICE_NOT_AVAILABLE"),

  // ─── Delivery Feedback ──────────────────────────────────────────────────────
  DELIVERY_FEEDBACK_ALREADY_SUBMITTED: () =>
    new AppError("Delivery feedback has already been submitted for this order.", 409, "DELIVERY_FEEDBACK_ALREADY_SUBMITTED"),
};
