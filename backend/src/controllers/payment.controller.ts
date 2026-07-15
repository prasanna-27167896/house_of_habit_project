import type { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { sendSuccess } from "@utils/response";
import { logger } from "@utils/logger";
import * as paymentService from "@services/payment.service";
import {
  initiatePaymentSchema,
  initiatePaymentSingleSchema,
  verifyPaymentSchema,
  codCheckoutSchema,
} from "@validators/payment.schema";

// ─── Initiate Razorpay payment — full cart ────────────────────────────────────

export const initiatePayment = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as Request & { user: { userId: string } }).user.userId;
  const input = initiatePaymentSchema.parse(req.body);
  const result = await paymentService.initiatePayment(userId, input);
  sendSuccess(res, result, 201);
});

// ─── Initiate Razorpay payment — single cart item ─────────────────────────────

export const initiatePaymentSingle = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as Request & { user: { userId: string } }).user.userId;
  const cartItemId = req.params["cartItemId"] as string;
  const input = initiatePaymentSingleSchema.parse(req.body);
  const result = await paymentService.initiatePaymentSingle(userId, cartItemId, input);
  sendSuccess(res, result, 201);
});

// ─── Verify Razorpay payment ──────────────────────────────────────────────────

export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as Request & { user: { userId: string } }).user.userId;
  const input = verifyPaymentSchema.parse(req.body);
  const result = await paymentService.verifyPayment(userId, input);

  if (result.status === "PENDING_WEBHOOK") {
    // Razorpay fetch failed or payment not yet captured — webhook will confirm
    // 202 Accepted: payment received, order confirmation in progress
    res.status(202).json({
      success: true,
      status: "PENDING_WEBHOOK",
      orderId: result.orderId,
      message: result.message,
    });
    return;
  }

  // Fully confirmed — all 3 layers passed
  sendSuccess(res, { status: "CONFIRMED", order: result.order });
});

// ─── COD checkout — full cart ─────────────────────────────────────────────────

export const placeCODOrder = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as Request & { user: { userId: string } }).user.userId;
  const input = codCheckoutSchema.parse(req.body);
  const order = await paymentService.placeCODOrder(userId, input);
  sendSuccess(res, order, 201);
});

// ─── COD checkout — single cart item ─────────────────────────────────────────

export const placeCODOrderSingle = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as Request & { user: { userId: string } }).user.userId;
  const cartItemId = req.params["cartItemId"] as string;
  const input = codCheckoutSchema.parse(req.body);
  const order = await paymentService.placeCODOrderSingle(userId, cartItemId, input);
  sendSuccess(res, order, 201);
});

// ─── Get payment status ───────────────────────────────────────────────────────

export const getPaymentStatus = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as Request & { user: { userId: string } }).user.userId;
  const orderId = req.params["orderId"] as string;
  const status = await paymentService.getPaymentStatus(userId, orderId);
  sendSuccess(res, status);
});

// ─── Admin: payment audit trail for an order ─────────────────────────────────

export const adminGetOrderPayments = asyncHandler(async (req: Request, res: Response) => {
  const orderId = req.params["orderId"] as string;
  const payments = await paymentService.adminGetOrderPayments(orderId);
  sendSuccess(res, payments);
});

// ─── Razorpay webhook (raw body — registered in app.ts BEFORE express.json()) ─
//
// Must NOT use asyncHandler — we need to always return 200 to Razorpay
// even on internal errors (otherwise Razorpay retries indefinitely).

export const webhookHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers["x-razorpay-signature"] as string | undefined;

    if (!signature) {
      logger.warn("Razorpay webhook: missing signature header");
      res.status(200).json({ received: true }); // Still 200 — don't trigger retries
      return;
    }

    // req.body is a Buffer because this route uses express.raw()
    await paymentService.handleWebhook(req.body as Buffer, signature);
  } catch (err) {
    logger.error({ err }, "Razorpay webhook: unhandled error");
    // Always 200 to Razorpay — our internal error shouldn't cause retries
  }

  res.status(200).json({ received: true });
};
