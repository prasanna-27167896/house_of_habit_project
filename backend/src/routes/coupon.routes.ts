import { Router } from "express";
import { authenticate } from "@middleware/auth.middleware";
import { requireRole } from "@middleware/role.middleware";
import * as couponController from "@controllers/coupon.controller";

export const couponRouter = Router();

// ─── Admin ────────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /coupons/:
 *   post:
 *     tags: [Coupons]
 *     summary: Create a coupon (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateCouponInput' }
 *     responses:
 *       201: { $ref: '#/components/responses/Success' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *   get:
 *     tags: [Coupons]
 *     summary: List coupons (admin, paginated)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10, maximum: 100 } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
couponRouter.post("/", authenticate, requireRole("ROLE_ADMIN"), couponController.createCoupon);
couponRouter.get("/", authenticate, requireRole("ROLE_ADMIN"), couponController.getAllCoupons);

/**
 * @openapi
 * /coupons/{couponCode}:
 *   put:
 *     tags: [Coupons]
 *     summary: Update a coupon (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: couponCode, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateCouponInput' }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *   delete:
 *     tags: [Coupons]
 *     summary: Delete a coupon (admin) — only if it has never been redeemed
 *     description: Blocked with 409 once the coupon has redemptions (history is preserved). Deactivate it instead.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: couponCode, required: true, schema: { type: string } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       409: { description: Coupon has been redeemed — deactivate instead of deleting }
 *   get:
 *     tags: [Coupons]
 *     summary: Validate/get a coupon by code (public)
 *     parameters:
 *       - { in: path, name: couponCode, required: true, schema: { type: string } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
couponRouter.put("/:couponCode", authenticate, requireRole("ROLE_ADMIN"), couponController.updateCoupon);
couponRouter.delete("/:couponCode", authenticate, requireRole("ROLE_ADMIN"), couponController.deleteCoupon);

// ─── Public ───────────────────────────────────────────────────────────────────
couponRouter.get("/:couponCode", couponController.getCouponByCode);
