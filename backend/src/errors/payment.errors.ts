import { AppError } from "@utils/AppError";

export const PaymentErrors = {
  ORDER_NOT_FOUND_FOR_PAYMENT: () =>
    new AppError("Order not found or does not belong to you.", 404, "ORDER_NOT_FOUND"),
  PAYMENT_ALREADY_COMPLETED: () =>
    new AppError("Payment for this order is already completed.", 400, "PAYMENT_ALREADY_COMPLETED"),
  PAYMENT_ORDER_ALREADY_CANCELLED: () =>
    new AppError("This order has been cancelled and cannot be paid.", 400, "ORDER_CANCELLED"),
  PAYMENT_SIGNATURE_INVALID: () =>
    new AppError("Payment verification failed. Invalid signature.", 400, "PAYMENT_SIGNATURE_INVALID"),
  RAZORPAY_ORDER_CREATE_FAILED: () =>
    new AppError("Failed to create payment order. Please try again.", 502, "RAZORPAY_ORDER_CREATE_FAILED"),
  PAYMENT_ORDER_NOT_PENDING: () =>
    new AppError("Payment can only be initiated for orders in PENDING status.", 400, "PAYMENT_ORDER_NOT_PENDING"),
  PAYMENT_AMOUNT_MISMATCH: () =>
    new AppError("Payment amount does not match order amount. Please contact support.", 400, "PAYMENT_AMOUNT_MISMATCH"),
  PAYMENT_STOCK_CONFLICT: () =>
    new AppError(
      "Payment received but the item sold out during checkout. A refund will be processed.",
      409,
      "PAYMENT_STOCK_CONFLICT",
    ),
  TOO_MANY_OPEN_COD_ORDERS: (max: number) =>
    new AppError(
      `You have too many open Cash-on-Delivery orders (max ${max}). Please take delivery of or cancel an existing one before placing another.`,
      429,
      "TOO_MANY_OPEN_COD_ORDERS",
    ),
};
