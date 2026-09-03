import { Router } from "express";
import { authenticate } from "@middleware/auth.middleware";
import { requireRole } from "@middleware/role.middleware";
import * as orderController from "@controllers/order.controller";
import * as returnController from "@controllers/return.controller";
import * as exchangeController from "@controllers/exchange.controller";
import * as trackingController from "@controllers/tracking.controller";
import * as invoiceController from "@controllers/invoice.controller";
import * as deliveryFeedbackController from "@controllers/deliveryFeedback.controller";

export const orderRouter = Router();

// ─── Non-wildcard customer routes ────────────────────────────────────────────
// Note: orders are created via the payment module (/payment/initiate, /payment/cod).

/**
 * @openapi
 * /orders/:
 *   get:
 *     tags: [Orders]
 *     summary: List my orders (paginated, filterable)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, ORDER_PLACED, CONFIRMED, PROCESSING, SHIPPED, IN_TRANSIT, DELIVERED, CANCELLED, RETURN_REQUESTED, RETURNED, RETURN_REJECTED]
 *       - { in: query, name: startDate, schema: { type: string, format: date }, description: "Inclusive, YYYY-MM-DD" }
 *       - { in: query, name: endDate, schema: { type: string, format: date }, description: "Inclusive (end of day), YYYY-MM-DD" }
 *       - { in: query, name: search, schema: { type: string }, description: "Matches product title of items in the order" }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 */
orderRouter.get("/", authenticate, orderController.getUserOrders);

// ─── Admin routes (before /:orderId wildcard) ─────────────────────────────────

/**
 * @openapi
 * /orders/admin/stats:
 *   get:
 *     tags: [Orders]
 *     summary: Order statistics (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
orderRouter.get("/admin/stats", authenticate, requireRole("ROLE_ADMIN"), orderController.adminGetOrderStats);

/**
 * @openapi
 * /orders/admin/monthly-counts:
 *   get:
 *     tags: [Orders]
 *     summary: Monthly order counts for a year (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: year, schema: { type: integer, example: 2026 } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
orderRouter.get("/admin/monthly-counts", authenticate, requireRole("ROLE_ADMIN"), orderController.adminGetMonthlyOrderCounts);

/**
 * @openapi
 * /orders/admin/all:
 *   get:
 *     tags: [Orders]
 *     summary: All orders, no pagination (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
orderRouter.get("/admin/all", authenticate, requireRole("ROLE_ADMIN"), orderController.adminGetAllOrdersNoPagination);

/**
 * @openapi
 * /orders/admin/status/{status}:
 *   get:
 *     tags: [Orders]
 *     summary: Orders by status (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PENDING, ORDER_PLACED, CONFIRMED, PROCESSING, SHIPPED, IN_TRANSIT, DELIVERED, CANCELLED, RETURN_REQUESTED, RETURNED, RETURN_REJECTED]
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
orderRouter.get("/admin/status/:status", authenticate, requireRole("ROLE_ADMIN"), orderController.adminGetOrdersByStatus);

/**
 * @openapi
 * /orders/admin/user/{userId}:
 *   get:
 *     tags: [Orders]
 *     summary: Orders for a specific user (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: userId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
orderRouter.get("/admin/user/:userId", authenticate, requireRole("ROLE_ADMIN"), orderController.adminGetOrdersByUser);

/**
 * @openapi
 * /orders/admin:
 *   get:
 *     tags: [Orders]
 *     summary: All orders (admin, paginated)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
orderRouter.get("/admin", authenticate, requireRole("ROLE_ADMIN"), orderController.adminGetAllOrders);

/**
 * @openapi
 * /orders/admin/returns:
 *   get:
 *     tags: [Orders]
 *     summary: List all return requests (admin, paginated)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *       - { in: query, name: status, schema: { type: string, enum: [PENDING, APPROVED, REJECTED, COMPLETED] } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
orderRouter.get("/admin/returns", authenticate, requireRole("ROLE_ADMIN"), returnController.adminGetAllReturns);

/**
 * @openapi
 * /orders/admin/returns/{returnId}/status:
 *   put:
 *     tags: [Orders]
 *     summary: Approve, reject, or complete a return request (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: returnId, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateReturnStatusInput' }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       400: { description: Invalid status transition }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
orderRouter.put(
  "/admin/returns/:returnId/status",
  authenticate,
  requireRole("ROLE_ADMIN"),
  returnController.adminUpdateReturnStatus,
);

/**
 * @openapi
 * /orders/admin/exchanges:
 *   get:
 *     tags: [Orders]
 *     summary: List all exchange requests (admin, paginated)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *       - { in: query, name: status, schema: { type: string, enum: [PENDING, APPROVED, REJECTED, COMPLETED] } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
orderRouter.get("/admin/exchanges", authenticate, requireRole("ROLE_ADMIN"), exchangeController.adminGetAllExchanges);

/**
 * @openapi
 * /orders/admin/delivery-feedback:
 *   get:
 *     tags: [Orders]
 *     summary: List all delivery feedback (admin, paginated)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
orderRouter.get(
  "/admin/delivery-feedback",
  authenticate,
  requireRole("ROLE_ADMIN"),
  deliveryFeedbackController.adminGetAllDeliveryFeedback,
);

/**
 * @openapi
 * /orders/admin/exchanges/{exchangeId}/status:
 *   put:
 *     tags: [Orders]
 *     summary: Approve, reject, or complete an exchange request (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: exchangeId, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateExchangeStatusInput' }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       400: { description: Invalid status transition }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
orderRouter.put(
  "/admin/exchanges/:exchangeId/status",
  authenticate,
  requireRole("ROLE_ADMIN"),
  exchangeController.adminUpdateExchangeStatus,
);

/**
 * @openapi
 * /orders/admin/{orderId}:
 *   get:
 *     tags: [Orders]
 *     summary: Get an order by id (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: orderId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   delete:
 *     tags: [Orders]
 *     summary: Delete an order (admin — paid orders are protected)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: orderId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       409: { description: "Paid order can't be deleted — cancel it instead" }
 */
orderRouter.get("/admin/:orderId", authenticate, requireRole("ROLE_ADMIN"), orderController.adminGetOrderById);

/**
 * @openapi
 * /orders/admin/{orderId}/status:
 *   put:
 *     tags: [Orders]
 *     summary: Update order status (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: orderId, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateOrderStatusInput' }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
orderRouter.put("/admin/:orderId/status", authenticate, requireRole("ROLE_ADMIN"), orderController.adminUpdateOrderStatus);

/**
 * @openapi
 * /orders/admin/{orderId}/payment-status:
 *   put:
 *     tags: [Orders]
 *     summary: Update payment status (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: orderId, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdatePaymentStatusInput' }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
orderRouter.put("/admin/:orderId/payment-status", authenticate, requireRole("ROLE_ADMIN"), orderController.adminUpdatePaymentStatus);

/**
 * @openapi
 * /orders/admin/{orderId}/track:
 *   post:
 *     tags: [Orders]
 *     summary: Append a tracking note (admin)
 *     description: Adds a free-form timeline entry (e.g. carrier/AWB update) without changing orderStatus. Status transitions themselves are logged automatically.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: orderId, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/AddTrackingNoteInput' }
 *     responses:
 *       201: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
orderRouter.post("/admin/:orderId/track", authenticate, requireRole("ROLE_ADMIN"), trackingController.adminAddTrackingNote);

/**
 * @openapi
 * /orders/admin/{orderId}/invoice:
 *   get:
 *     tags: [Orders]
 *     summary: Download an order's invoice as PDF (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: orderId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: "PDF file", content: { application/pdf: { schema: { type: string, format: binary } } } }
 *       400: { description: Invoice not available (order still PENDING) }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
orderRouter.get("/admin/:orderId/invoice", authenticate, requireRole("ROLE_ADMIN"), invoiceController.adminDownloadInvoice);

/**
 * @openapi
 * /orders/admin/{orderId}/refund:
 *   put:
 *     tags: [Orders]
 *     summary: Mark a pending refund as completed (admin)
 *     description: Call after refunding the customer via Razorpay. Only valid when the order's refundStatus is REFUND_PENDING.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: orderId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       400: { description: "No pending refund on this order" }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
orderRouter.put("/admin/:orderId/refund", authenticate, requireRole("ROLE_ADMIN"), orderController.adminMarkRefunded);

orderRouter.delete("/admin/:orderId", authenticate, requireRole("ROLE_ADMIN"), orderController.adminDeleteOrder);

// ─── Wildcard customer routes (must come after /admin/*) ─────────────────────

/**
 * @openapi
 * /orders/{orderId}:
 *   get:
 *     tags: [Orders]
 *     summary: Get one of my orders
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: orderId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
orderRouter.get("/:orderId", authenticate, orderController.getOrderDetail);

/**
 * @openapi
 * /orders/{orderId}/cancel:
 *   put:
 *     tags: [Orders]
 *     summary: Cancel my order
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: orderId, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CancelOrderInput' }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       400: { description: Order not cancellable in its current state }
 */
orderRouter.put("/:orderId/cancel", authenticate, orderController.cancelOrder);

/**
 * @openapi
 * /orders/{orderId}/return:
 *   get:
 *     tags: [Orders]
 *     summary: List my return requests for this order
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: orderId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   post:
 *     tags: [Orders]
 *     summary: Request a return for an item in this order
 *     description: Only allowed on DELIVERED orders, within the return window.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: orderId, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateReturnInput' }
 *     responses:
 *       201: { $ref: '#/components/responses/Success' }
 *       400: { description: Order not delivered, or return window expired }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409: { description: Item already has a return request }
 */
orderRouter.get("/:orderId/return", authenticate, returnController.getReturnsForOrder);
orderRouter.post("/:orderId/return", authenticate, returnController.createReturnRequest);

/**
 * @openapi
 * /orders/{orderId}/exchange:
 *   get:
 *     tags: [Orders]
 *     summary: List my exchange requests for this order
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: orderId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   post:
 *     tags: [Orders]
 *     summary: Request a size/style exchange for an item in this order
 *     description: Only allowed on DELIVERED orders, within the return window.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: orderId, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateExchangeInput' }
 *     responses:
 *       201: { $ref: '#/components/responses/Success' }
 *       400: { description: Order not delivered, or return window expired }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409: { description: Item already has an exchange request }
 */
orderRouter.get("/:orderId/exchange", authenticate, exchangeController.getExchangesForOrder);
orderRouter.post("/:orderId/exchange", authenticate, exchangeController.createExchangeRequest);

/**
 * @openapi
 * /orders/{orderId}/track:
 *   get:
 *     tags: [Orders]
 *     summary: Get the tracking timeline for my order
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: orderId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
orderRouter.get("/:orderId/track", authenticate, trackingController.getOrderTracking);

/**
 * @openapi
 * /orders/{orderId}/invoice:
 *   get:
 *     tags: [Orders]
 *     summary: Download my order's invoice as PDF
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: orderId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: "PDF file", content: { application/pdf: { schema: { type: string, format: binary } } } }
 *       400: { description: Invoice not available (order still PENDING) }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
orderRouter.get("/:orderId/invoice", authenticate, invoiceController.downloadInvoice);

/**
 * @openapi
 * /orders/{orderId}/delivery-feedback:
 *   get:
 *     tags: [Orders]
 *     summary: Get my delivery feedback for this order
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: orderId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   post:
 *     tags: [Orders]
 *     summary: Submit delivery feedback for this order
 *     description: Only allowed once, on a DELIVERED order — rates the delivery experience itself (separate from a product review).
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: orderId, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateDeliveryFeedbackInput' }
 *     responses:
 *       201: { $ref: '#/components/responses/Success' }
 *       400: { description: Order not delivered yet }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409: { description: Feedback already submitted for this order }
 */
orderRouter.get("/:orderId/delivery-feedback", authenticate, deliveryFeedbackController.getDeliveryFeedbackForOrder);
orderRouter.post("/:orderId/delivery-feedback", authenticate, deliveryFeedbackController.createDeliveryFeedback);
