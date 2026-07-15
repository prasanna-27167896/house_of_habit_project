import { razorpay } from "@lib/razorpay";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { validatePaymentVerification, validateWebhookSignature } =
  require("razorpay/dist/utils/razorpay-utils") as {
    validatePaymentVerification: (
      params: Record<string, string>,
      signature: string,
      secret: string,
    ) => boolean;
    validateWebhookSignature: (
      body: string,
      signature: string,
      secret: string,
    ) => boolean;
  };
import { env } from "@config/env";
import * as orderRepo from "@repos/order.repo";
import * as paymentRepo from "@repos/payment.repo";
import { reservationExpiry } from "@repos/reservation.repo";
import * as cartRepo from "@repos/cart.repo";
import * as userRepo from "@repos/user.repo";
import { validateCoupon } from "@services/coupon.service";
import {
  validateItemAvailability,
  calcTotals,
  calcCouponDiscount,
  buildOrderItems,
  resolveShippingCharge,
  resolveDeliveryAddress,
} from "@services/order.helpers";
import { Errors } from "@errors/index";
import { logger } from "@utils/logger";
import type {
  OrderWithRelations,
  OrderItemCreateData,
} from "@interfaces/order.types";
import type { CartItemWithDetails } from "@interfaces/cart.types";
import type {
  InitiatePaymentInput,
  VerifyPaymentInput,
  CodCheckoutInput,
} from "@validators/payment.schema";

// ─── Shared cart → order data builder ────────────────────────────────────────

type PreparedOrder = {
  userId: string;
  shippingAddressId: string;
  items: OrderItemCreateData[];
  totalPrice: number;
  totalDiscountedPrice: number;
  discount: number;
  couponCode: string | null;
  couponDiscount: number | null;
  shippingCharge: number;
  totalAmount: number;
  totalItems: number;
  // Kept for Razorpay notes enrichment — not stored on order
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
};

const prepareOrderFromCart = async (
  userId: string,
  addressId: string | undefined,
  couponCode?: string,
  cartItems?: CartItemWithDetails[],
): Promise<PreparedOrder> => {
  // Use the chosen address, or fall back to the user's default when none is given.
  const address = await resolveDeliveryAddress(userId, addressId);

  const items =
    cartItems ??
    (await (async () => {
      const cart = await cartRepo.findCartWithItems(userId);
      if (!cart || cart.items.length === 0) throw Errors.CART_EMPTY();
      return cart.items;
    })());

  validateItemAvailability(items);

  const { totalPrice, totalDiscountedPrice, discount } = calcTotals(items);

  let appliedCouponDiscount: number | null = null;
  let appliedCouponCode: string | null = null;

  if (couponCode) {
    const coupon = await validateCoupon(couponCode);
    if (
      coupon.minOrderValue != null &&
      totalDiscountedPrice < coupon.minOrderValue
    ) {
      throw Errors.COUPON_MIN_ORDER_NOT_MET(coupon.minOrderValue);
    }
    appliedCouponDiscount = calcCouponDiscount(
      coupon,
      items,
      totalDiscountedPrice,
    );
    appliedCouponCode = coupon.couponCode;
  }

  const afterCoupon = totalDiscountedPrice - (appliedCouponDiscount ?? 0);
  const shippingCharge = await resolveShippingCharge(afterCoupon);
  const totalAmount = afterCoupon + shippingCharge;

  return {
    userId,
    shippingAddressId: address.addressId,
    items: buildOrderItems(items),
    totalPrice,
    totalDiscountedPrice,
    discount,
    couponCode: appliedCouponCode,
    couponDiscount: appliedCouponDiscount,
    shippingCharge,
    totalAmount,
    totalItems: items.length,
    shippingCity: address.city,
    shippingState: address.state,
    shippingPincode: address.pincode,
  };
};

// ─── Razorpay payment initiation (full cart) ──────────────────────────────────

export type InitiatePaymentResult = {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
};

export const initiatePayment = async (
  userId: string,
  input: InitiatePaymentInput,
): Promise<InitiatePaymentResult> => {
  const cart = await cartRepo.findCartWithItems(userId);
  if (!cart || cart.items.length === 0) throw Errors.CART_EMPTY();

  const orderData = await prepareOrderFromCart(
    userId,
    input.addressId,
    input.couponCode,
    cart.items,
  );

  // 1. Fetch user details for Razorpay notes
  const user = await userRepo.findUserById(userId);

  // 2. Create the pending order AND reserve stock for the payment window.
  //    Throws OUT_OF_STOCK (rolls back) if any item can't be held.
  const hohOrder = await orderRepo.createPendingOrderWithReservation(orderData, reservationExpiry());

  // 3. Create Razorpay order with full metadata for dashboard searchability
  let razorpayOrderId: string;
  try {
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(orderData.totalAmount * 100), // paise
      currency: "INR",
      receipt: hohOrder.orderId,
      notes: {
        hoh_order_id: hohOrder.orderId,
        customer_name: user?.fullName ?? "N/A",
        customer_email: user?.email ?? "N/A",
        customer_phone: user?.mobile ?? "N/A",
        item_count: String(orderData.totalItems),
        amount_inr: String(orderData.totalAmount),
        coupon_applied: orderData.couponCode ?? "none",
        shipping_charge_inr: String(orderData.shippingCharge),
        delivery_city: orderData.shippingCity,
        delivery_state: orderData.shippingState,
        delivery_pincode: orderData.shippingPincode,
      },
    });
    razorpayOrderId = rzpOrder.id as string;
  } catch (err) {
    // Razorpay order creation failed — cancel the pending HoH order
    await orderRepo.failPendingPayment(
      hohOrder.orderId,
      "RAZORPAY_CREATE_ERROR",
    );
    logger.error({ err }, "Razorpay order creation failed");
    throw Errors.RAZORPAY_ORDER_CREATE_FAILED();
  }

  // 3. Link razorpayOrderId to HoH order, set paymentStatus → PROCESSING
  await orderRepo.setRazorpayOrderId(hohOrder.orderId, razorpayOrderId);

  return {
    orderId: hohOrder.orderId,
    razorpayOrderId,
    amount: Math.round(orderData.totalAmount * 100),
    currency: "INR",
    keyId: env.RAZORPAY_API_KEY,
  };
};

// ─── Razorpay payment initiation (single cart item) ──────────────────────────

export const initiatePaymentSingle = async (
  userId: string,
  cartItemId: string,
  input: InitiatePaymentInput,
): Promise<InitiatePaymentResult> => {
  const item = await orderRepo.findCartItemForOrder(cartItemId, userId);
  if (!item) throw Errors.CART_ITEM_NOT_FOUND();

  const orderData = await prepareOrderFromCart(
    userId,
    input.addressId,
    input.couponCode,
    [item],
  );

  const user = await userRepo.findUserById(userId);
  // Create the pending order AND reserve stock (throws OUT_OF_STOCK → rolls back).
  const hohOrder = await orderRepo.createPendingOrderWithReservation(orderData, reservationExpiry());

  let razorpayOrderId: string;
  try {
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(orderData.totalAmount * 100),
      currency: "INR",
      receipt: hohOrder.orderId,
      notes: {
        hoh_order_id: hohOrder.orderId,
        customer_name: user?.fullName ?? "N/A",
        customer_email: user?.email ?? "N/A",
        customer_phone: user?.mobile ?? "N/A",
        item_count: String(orderData.totalItems),
        amount_inr: String(orderData.totalAmount),
        coupon_applied: orderData.couponCode ?? "none",
        shipping_charge_inr: String(orderData.shippingCharge),
        delivery_city: orderData.shippingCity,
        delivery_state: orderData.shippingState,
        delivery_pincode: orderData.shippingPincode,
      },
    });
    razorpayOrderId = rzpOrder.id as string;
  } catch (err) {
    // Razorpay order creation failed — cancel the pending order and release the hold.
    await orderRepo.failPendingPayment(
      hohOrder.orderId,
      "RAZORPAY_CREATE_ERROR",
    );
    logger.error({ err }, "Razorpay order creation failed (single item)");
    throw Errors.RAZORPAY_ORDER_CREATE_FAILED();
  }

  await orderRepo.setRazorpayOrderId(hohOrder.orderId, razorpayOrderId);

  return {
    orderId: hohOrder.orderId,
    razorpayOrderId,
    amount: Math.round(orderData.totalAmount * 100),
    currency: "INR",
    keyId: env.RAZORPAY_API_KEY,
  };
};

// ─── Verify Razorpay payment — 3-layer verification ──────────────────────────
//
// Layer 1 : HMAC-SHA256 signature  — cryptographic proof Razorpay generated this
// Layer 2 : Server-to-server fetch — confirms payment captured + amount + order match
// Layer 3 : Webhook audit record   — Razorpay independently confirms via webhook
//
// Fetch failures are infrastructure issues (not customer fault).
// On failure we log a PENDING audit record and return 202 so the webhook
// can confirm the order when it fires — customer is never shown a false error.

export type VerifyPaymentResult =
  | { status: "CONFIRMED"; order: OrderWithRelations }
  | { status: "PENDING_WEBHOOK"; orderId: string; message: string };

type RazorpayPaymentEntity = {
  status: string;
  amount: number;
  order_id: string;
  method: string;
};

export const verifyPayment = async (
  userId: string,
  input: VerifyPaymentInput,
): Promise<VerifyPaymentResult> => {
  // ── Guard: order ownership & state ───────────────────────────────────────
  const order = await orderRepo.findOrderByIdForUser(input.orderId, userId);
  if (!order) throw Errors.ORDER_NOT_FOUND_FOR_PAYMENT();
  if (order.paymentStatus === "COMPLETED") {
    // Webhook confirmed the order before frontend verify arrived — still a success
    return { status: "CONFIRMED", order };
  }
  if (order.orderStatus === "CANCELLED")
    throw Errors.PAYMENT_ORDER_ALREADY_CANCELLED();

  // ── Layer 1: HMAC-SHA256 signature via Razorpay SDK utility ─────────────
  // validatePaymentVerification internally computes HMAC(SECRET_KEY, "order_id|payment_id")
  const isValidSignature = validatePaymentVerification(
    { order_id: input.razorpayOrderId, payment_id: input.razorpayPaymentId },
    input.razorpaySignature,
    env.RAZORPAY_SECRET_KEY,
  );

  if (!isValidSignature) {
    logger.warn(
      { orderId: input.orderId },
      "Payment verify: HMAC signature mismatch",
    );
    throw Errors.PAYMENT_SIGNATURE_INVALID();
  }

  // ── Layer 2: Server-to-server fetch from Razorpay ────────────────────────
  let fetchedPayment: RazorpayPaymentEntity | null = null;

  try {
    fetchedPayment = (await razorpay.payments.fetch(
      input.razorpayPaymentId,
    )) as RazorpayPaymentEntity;
  } catch (err) {
    // Razorpay API is down or network timed out — not the customer's fault.
    // HMAC already proved legitimacy. Log audit record and defer to webhook.
    logger.error(
      { err, orderId: order.orderId, paymentId: input.razorpayPaymentId },
      "Razorpay fetch failed during verify — deferring to webhook",
    );
    await paymentRepo.createPaymentAuditRecord({
      orderId: order.orderId,
      razorpayOrderId: input.razorpayOrderId,
      razorpayPaymentId: input.razorpayPaymentId,
      amount: order.totalAmount,
      currency: "INR",
      method: null,
      status: "PENDING",
      source: "FETCH_FAILED",
    });
    return {
      status: "PENDING_WEBHOOK",
      orderId: order.orderId,
      message:
        "Your payment was received. We are confirming your order — you will be notified shortly.",
    };
  }

  // 2a. Payment must be captured (not just authorized — money not received yet for authorized)
  if (fetchedPayment.status !== "captured") {
    logger.warn(
      {
        orderId: order.orderId,
        paymentId: input.razorpayPaymentId,
        paymentStatus: fetchedPayment.status,
      },
      "Payment not yet captured — deferring to webhook",
    );
    await paymentRepo.createPaymentAuditRecord({
      orderId: order.orderId,
      razorpayOrderId: input.razorpayOrderId,
      razorpayPaymentId: input.razorpayPaymentId,
      amount: order.totalAmount,
      currency: "INR",
      method: fetchedPayment.method ?? null,
      status: "PENDING",
      source: "FETCH_FAILED",
    });
    return {
      status: "PENDING_WEBHOOK",
      orderId: order.orderId,
      message:
        "Your payment is being processed. Your order will be confirmed shortly.",
    };
  }

  // 2b. Amount must match exactly — prevents partial payment fraud
  const expectedPaise = Math.round(order.totalAmount * 100);
  if (fetchedPayment.amount !== expectedPaise) {
    logger.error(
      {
        orderId: order.orderId,
        expected: expectedPaise,
        received: fetchedPayment.amount,
      },
      "Payment amount mismatch — possible fraud attempt",
    );
    // Log to DB: admin can see orderId, paymentId, what was paid vs what was expected
    await paymentRepo.createPaymentAuditRecord({
      orderId: order.orderId,
      razorpayOrderId: input.razorpayOrderId,
      razorpayPaymentId: input.razorpayPaymentId,
      amount: fetchedPayment.amount / 100, // actual amount paid (not order amount)
      currency: "INR",
      method: fetchedPayment.method ?? null,
      status: "FAILED",
      source: "FRAUD_AMOUNT_MISMATCH",
    });
    throw Errors.PAYMENT_AMOUNT_MISMATCH();
  }

  // 2c. Payment must belong to this Razorpay order — prevents payment reuse across orders
  if (fetchedPayment.order_id !== input.razorpayOrderId) {
    logger.error(
      {
        orderId: order.orderId,
        expected: input.razorpayOrderId,
        received: fetchedPayment.order_id,
      },
      "Payment order_id mismatch — possible payment reuse attempt",
    );
    // Log to DB: admin can see which paymentId was reused and against which order
    await paymentRepo.createPaymentAuditRecord({
      orderId: order.orderId,
      razorpayOrderId: input.razorpayOrderId,
      razorpayPaymentId: input.razorpayPaymentId,
      amount: fetchedPayment.amount / 100,
      currency: "INR",
      method: fetchedPayment.method ?? null,
      status: "FAILED",
      source: "FRAUD_ORDER_MISMATCH",
    });
    throw Errors.PAYMENT_SIGNATURE_INVALID();
  }

  // ── Layer 3: All checks passed — confirm order ────────────────────────────
  // Webhook will independently fire and add its own audit record (source: WEBHOOK)
  const confirmedOrder = await orderRepo.confirmPaymentTransaction(
    input.orderId,
    {
      paymentId: input.razorpayPaymentId,
      paymentMethod: fetchedPayment.method ?? "ONLINE",
      razorpayOrderId: input.razorpayOrderId,
      source: "FRONTEND_VERIFY",
    },
  );

  return { status: "CONFIRMED", order: confirmedOrder };
};

// ─── Webhook handler (called by Razorpay servers asynchronously) ──────────────
//
// Uses a DIFFERENT secret (RAZORPAY_WEBHOOK_SECRET) set in the Razorpay dashboard.
// Acts as authoritative backup: covers browser-crash / missed verify scenarios.

export const handleWebhook = async (
  rawBody: Buffer,
  signature: string,
): Promise<void> => {
  // 1. Validate webhook signature via Razorpay SDK utility
  // validateWebhookSignature computes HMAC(WEBHOOK_SECRET, rawBody) — must be raw Buffer/string
  const isValidWebhook = validateWebhookSignature(
    rawBody.toString(),
    signature,
    env.RAZORPAY_WEBHOOK_SECRET,
  );

  if (!isValidWebhook) {
    logger.warn("Razorpay webhook: invalid signature — ignoring");
    return;
  }

  let payload: {
    event: string;
    payload: {
      payment: {
        entity: {
          id: string;
          order_id: string;
          method: string;
          status: string;
          amount: number;
          currency: string;
        };
      };
    };
  };

  try {
    payload = JSON.parse(rawBody.toString()) as typeof payload;
  } catch {
    logger.warn("Razorpay webhook: malformed JSON body");
    return;
  }

  const { event } = payload;

  // Only payment.captured / payment.failed carry a payment entity. Any other event type
  // enabled in the Razorpay dashboard (order.paid, refund.processed, settlement.*, …) has
  // a different payload shape, so bail out BEFORE touching payment.entity — otherwise the
  // access below throws a TypeError the moment such an event is turned on.
  if (event !== "payment.captured" && event !== "payment.failed") {
    logger.info({ event }, "Razorpay webhook: ignoring non-payment event");
    return;
  }

  const payment = payload.payload?.payment?.entity;
  if (!payment) {
    logger.warn({ event }, "Razorpay webhook: payment event missing entity — ignoring");
    return;
  }

  const razorpayOrderId = payment.order_id;
  const razorpayPaymentId = payment.id;

  // 2. Look up the HoH order by Razorpay order ID
  const order = await orderRepo.findOrderByRazorpayOrderId(razorpayOrderId);
  if (!order) {
    logger.warn({ razorpayOrderId }, "Razorpay webhook: no HoH order found");
    return;
  }

  if (event === "payment.captured") {
    if (order.paymentStatus === "COMPLETED") {
      // Already confirmed by frontend verify — add independent webhook audit record
      await paymentRepo.createPaymentAuditRecord({
        orderId: order.orderId,
        razorpayOrderId,
        razorpayPaymentId,
        amount: payment.amount / 100,
        currency: payment.currency ?? "INR",
        method: payment.method ?? "ONLINE",
        status: "COMPLETED",
        source: "WEBHOOK",
      });
      logger.info(
        { orderId: order.orderId },
        "Webhook: audit record created (already confirmed by frontend)",
      );
      return;
    }

    if (order.orderStatus === "CANCELLED") {
      // Order was already cancelled (checkout swept after the reservation TTL, or an
      // admin cancelled it) but Razorpay captured the money anyway. Don't resurrect the
      // order — record the payment and flag it for a manual refund.
      await orderRepo.recordCapturedPaymentForRefund(order.orderId, {
        razorpayOrderId,
        razorpayPaymentId,
        amount: payment.amount / 100,
        currency: payment.currency ?? "INR",
        method: payment.method ?? "ONLINE",
      });
      logger.warn(
        { orderId: order.orderId, razorpayPaymentId },
        "Webhook: payment captured on a CANCELLED order — flagged for refund",
      );
      return;
    }

    const expectedPaise = Math.round(order.totalAmount * 100);
    if (payment.amount !== expectedPaise) {
      logger.error(
        {
          orderId: order.orderId,
          expected: expectedPaise,
          received: payment.amount,
        },
        "Webhook: payment.captured amount mismatch — fraud audit logged",
      );
      await paymentRepo.createPaymentAuditRecord({
        orderId: order.orderId,
        razorpayOrderId,
        razorpayPaymentId,
        amount: payment.amount / 100,
        currency: payment.currency ?? "INR",
        method: payment.method ?? null,
        status: "FAILED",
        source: "FRAUD_AMOUNT_MISMATCH",
      });
      return;
    }

    await orderRepo.confirmPaymentTransaction(order.orderId, {
      paymentId: razorpayPaymentId,
      paymentMethod: payment.method ?? "ONLINE",
      razorpayOrderId,
      source: "WEBHOOK",
      actualAmount: payment.amount / 100,
      actualCurrency: payment.currency ?? "INR",
    });
    logger.info({ orderId: order.orderId }, "Webhook: payment confirmed");
    return;
  }

  if (event === "payment.failed") {
    // A single Razorpay order fires payment.failed on EVERY failed attempt, and customers
    // routinely retry inside the same checkout (wrong OTP, insufficient funds, timeout).
    // So we do NOT cancel the order here — that would kill an order the customer is still
    // trying to pay for, and a later successful retry would land on a dead order.
    // Abandonment is owned by the reservation TTL + sweep (15 min), which leaves the retry
    // room to succeed and cleans up only genuinely-abandoned checkouts. Here we just record
    // the failed attempt for the audit trail.
    await paymentRepo.createPaymentAuditRecord({
      orderId: order.orderId,
      razorpayOrderId,
      razorpayPaymentId,
      amount: payment.amount / 100,
      currency: payment.currency ?? "INR",
      method: payment.method ?? null,
      status: "FAILED",
      source: "WEBHOOK",
    });
    logger.info(
      { orderId: order.orderId, paymentStatus: order.paymentStatus },
      "Webhook: payment.failed recorded — order left open for retry / TTL sweep",
    );
    return;
  }
};

// ─── Cash on Delivery checkout (full cart) ────────────────────────────────────

// COD deducts stock with no payment friction, so an unbounded number of open COD orders
// is an inventory-denial lever (place many, never accept delivery). Cap the in-flight ones.
const MAX_OPEN_COD_ORDERS = 3;

const assertCodOrderQuota = async (userId: string): Promise<void> => {
  const open = await orderRepo.countOpenCodOrders(userId);
  if (open >= MAX_OPEN_COD_ORDERS) throw Errors.TOO_MANY_OPEN_COD_ORDERS(MAX_OPEN_COD_ORDERS);
};

export const placeCODOrder = async (
  userId: string,
  input: CodCheckoutInput,
): Promise<OrderWithRelations> => {
  await assertCodOrderQuota(userId);

  const cart = await cartRepo.findCartWithItems(userId);
  if (!cart || cart.items.length === 0) throw Errors.CART_EMPTY();

  const orderData = await prepareOrderFromCart(
    userId,
    input.addressId,
    input.couponCode,
    cart.items,
  );

  const hohOrder = await orderRepo.createPendingOrder(orderData);

  // Immediately confirm as COD — deducts stock + clears cart in one transaction. If the
  // confirm rolls back (e.g. OUT_OF_STOCK on the guarded decrement), remove the just-created
  // pending order so it can't strand as PENDING forever (COD orders have no reservation for
  // the sweep to reclaim).
  try {
    return await orderRepo.confirmPaymentTransaction(hohOrder.orderId, {
      paymentId: "COD",
      paymentMethod: "COD",
      razorpayOrderId: "COD",
      source: "COD",
    });
  } catch (err) {
    await orderRepo.deleteOrder(hohOrder.orderId).catch(() => undefined);
    throw err;
  }
};

// ─── Cash on Delivery checkout (single item) ──────────────────────────────────

export const placeCODOrderSingle = async (
  userId: string,
  cartItemId: string,
  input: CodCheckoutInput,
): Promise<OrderWithRelations> => {
  await assertCodOrderQuota(userId);

  const item = await orderRepo.findCartItemForOrder(cartItemId, userId);
  if (!item) throw Errors.CART_ITEM_NOT_FOUND();

  const orderData = await prepareOrderFromCart(
    userId,
    input.addressId,
    input.couponCode,
    [item],
  );

  const hohOrder = await orderRepo.createPendingOrder(orderData);

  // See placeCODOrder: clean up the pending order if the COD confirm rolls back.
  try {
    return await orderRepo.confirmPaymentTransaction(hohOrder.orderId, {
      paymentId: "COD",
      paymentMethod: "COD",
      razorpayOrderId: "COD",
      source: "COD",
    });
  } catch (err) {
    await orderRepo.deleteOrder(hohOrder.orderId).catch(() => undefined);
    throw err;
  }
};

// ─── Get payment status ───────────────────────────────────────────────────────

export const getPaymentStatus = async (
  userId: string,
  orderId: string,
): Promise<{
  orderId: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string | null;
}> => {
  const order = await orderRepo.findOrderByIdForUser(orderId, userId);
  if (!order) throw Errors.ORDER_NOT_FOUND_FOR_PAYMENT();

  return {
    orderId: order.orderId,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
  };
};

// ─── Admin: payment audit trail for an order ─────────────────────────────────
// Exposes every recorded event (FRONTEND_VERIFY / WEBHOOK / COD / FRAUD_* / …)
// so admins can investigate a disputed or flagged payment.

export const adminGetOrderPayments = async (orderId: string) => {
  const order = await orderRepo.findOrderById(orderId);
  if (!order) throw Errors.ORDER_NOT_FOUND_FOR_PAYMENT();
  return paymentRepo.findPaymentsByOrderId(orderId);
};
