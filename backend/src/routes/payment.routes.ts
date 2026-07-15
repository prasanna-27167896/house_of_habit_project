import { Router } from "express";
import { authenticate } from "@middleware/auth.middleware";
import { requireRole } from "@middleware/role.middleware";
import * as paymentController from "@controllers/payment.controller";

export const paymentRouter = Router();

// All payment routes require authentication
paymentRouter.use(authenticate);

// ─── Razorpay online payment ──────────────────────────────────────────────────

/**
 * @openapi
 * /payment/initiate:
 *   post:
 *     tags: [Payments]
 *     summary: Initiate a Razorpay order for the whole cart
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CheckoutInput' }
 *     responses:
 *       201: { description: "Reserves stock for 15 min. Returns { orderId, razorpayOrderId, amount, currency, keyId }" }
 *       400: { description: "Validation error, or OUT_OF_STOCK if an item can't be reserved" }
 */
paymentRouter.post("/initiate", paymentController.initiatePayment);

/**
 * @openapi
 * /payment/initiate/single/{cartItemId}:
 *   post:
 *     tags: [Payments]
 *     summary: Initiate a Razorpay order for a single cart item
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: cartItemId, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CheckoutInput' }
 *     responses:
 *       201: { description: "Reserves stock for 15 min, returns Razorpay order details" }
 *       400: { description: "Validation error, or OUT_OF_STOCK if the item can't be reserved" }
 */
paymentRouter.post("/initiate/single/:cartItemId", paymentController.initiatePaymentSingle);

/**
 * @openapi
 * /payment/verify:
 *   post:
 *     tags: [Payments]
 *     summary: Verify a Razorpay payment (signature + server fetch)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/VerifyPaymentInput' }
 *     responses:
 *       200: { description: CONFIRMED — reservation consumed, order placed }
 *       202: { description: PENDING_WEBHOOK — payment received, confirmation in progress }
 *       400: { description: Signature/amount mismatch }
 *       409: { description: "PAYMENT_STOCK_CONFLICT — paid but the hold expired and stock sold out (refund)" }
 */
paymentRouter.post("/verify", paymentController.verifyPayment);

// ─── Cash on Delivery ─────────────────────────────────────────────────────────

/**
 * @openapi
 * /payment/cod:
 *   post:
 *     tags: [Payments]
 *     summary: Place a COD order from the whole cart
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CheckoutInput' }
 *     responses:
 *       201: { description: "Order placed (stock deducted immediately)" }
 *       400: { description: "Validation error, or OUT_OF_STOCK if an item is unavailable" }
 */
paymentRouter.post("/cod", paymentController.placeCODOrder);

/**
 * @openapi
 * /payment/cod/single/{cartItemId}:
 *   post:
 *     tags: [Payments]
 *     summary: Place a COD order for a single cart item
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: cartItemId, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CheckoutInput' }
 *     responses:
 *       201: { description: "Order placed (stock deducted immediately)" }
 *       400: { description: "Validation error, or OUT_OF_STOCK if an item is unavailable" }
 */
paymentRouter.post("/cod/single/:cartItemId", paymentController.placeCODOrderSingle);

// ─── Status polling ───────────────────────────────────────────────────────────

/**
 * @openapi
 * /payment/status/{orderId}:
 *   get:
 *     tags: [Payments]
 *     summary: Poll payment/order status
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: orderId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
paymentRouter.get("/status/:orderId", paymentController.getPaymentStatus);

// ─── Admin: payment audit trail ───────────────────────────────────────────────

/**
 * @openapi
 * /payment/admin/order/{orderId}:
 *   get:
 *     tags: [Payments]
 *     summary: Payment audit trail for an order (admin)
 *     description: Every recorded payment event — FRONTEND_VERIFY, WEBHOOK, COD, FRAUD_*, FETCH_FAILED — newest first.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: orderId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
paymentRouter.get("/admin/order/:orderId", requireRole("ROLE_ADMIN"), paymentController.adminGetOrderPayments);

/**
 * @openapi
 * /payment/webhook:
 *   post:
 *     tags: [Payments]
 *     summary: Razorpay webhook (called by Razorpay, not the frontend)
 *     description: >
 *       Registered in app.ts with a raw body parser before express.json().
 *       Verifies the X-Razorpay-Signature header and always returns 200.
 *     responses:
 *       200: { description: Received }
 */
