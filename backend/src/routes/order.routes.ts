import { Router } from "express";
import { authenticate } from "@middleware/auth.middleware";
import { requireRole } from "@middleware/role.middleware";
import * as orderController from "@controllers/order.controller";

export const orderRouter = Router();

// ─── Non-wildcard customer routes ────────────────────────────────────────────
// Note: orders are created via the payment module (/payment/initiate, /payment/cod).

/**
 * @openapi
 * /orders/:
 *   get:
 *     tags: [Orders]
 *     summary: List my orders (paginated)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
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
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       400: { description: Order not cancellable in its current state }
 */
orderRouter.put("/:orderId/cancel", authenticate, orderController.cancelOrder);
