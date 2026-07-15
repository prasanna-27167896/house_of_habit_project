import { Router } from "express";
import { authenticate } from "@middleware/auth.middleware";
import { requireRole } from "@middleware/role.middleware";
import * as reviewController from "@controllers/review.controller";

export const reviewRouter = Router();

// ─── Public ───────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /reviews/product/{productId}:
 *   get:
 *     tags: [Reviews]
 *     summary: List reviews for a product (paginated)
 *     parameters:
 *       - { in: path, name: productId, required: true, schema: { type: string, format: uuid } }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 10 } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *   post:
 *     tags: [Reviews]
 *     summary: Create a review for a product
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: productId, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateReviewInput' }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { description: "Not purchased — only buyers can review (REVIEW_NOT_PURCHASED)" }
 *       409: { description: Already reviewed this product }
 */
reviewRouter.get("/product/:productId", reviewController.getProductReviews);

// ─── Admin (before /:reviewId wildcard) ──────────────────────────────────────

/**
 * @openapi
 * /reviews/admin/all:
 *   get:
 *     tags: [Reviews]
 *     summary: List all reviews (admin, paginated)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
reviewRouter.get("/admin/all", authenticate, requireRole("ROLE_ADMIN"), reviewController.adminGetAllReviews);

/**
 * @openapi
 * /reviews/admin/pending-reply:
 *   get:
 *     tags: [Reviews]
 *     summary: Reviews awaiting an admin reply
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
reviewRouter.get("/admin/pending-reply", authenticate, requireRole("ROLE_ADMIN"), reviewController.adminGetPendingReplyReviews);

/**
 * @openapi
 * /reviews/admin/{reviewId}:
 *   delete:
 *     tags: [Reviews]
 *     summary: Delete any review (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: reviewId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
reviewRouter.delete("/admin/:reviewId", authenticate, requireRole("ROLE_ADMIN"), reviewController.adminDeleteReview);

/**
 * @openapi
 * /reviews/admin/{reviewId}/reply:
 *   post:
 *     tags: [Reviews]
 *     summary: Reply to a review (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: reviewId, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ReplyInput' }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       409: { description: Reply already exists }
 *   put:
 *     tags: [Reviews]
 *     summary: Edit an admin reply
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: reviewId, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ReplyInput' }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *   delete:
 *     tags: [Reviews]
 *     summary: Delete an admin reply
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: reviewId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 */
reviewRouter.post("/admin/:reviewId/reply", authenticate, requireRole("ROLE_ADMIN"), reviewController.adminCreateReply);
reviewRouter.put("/admin/:reviewId/reply", authenticate, requireRole("ROLE_ADMIN"), reviewController.adminUpdateReply);
reviewRouter.delete("/admin/:reviewId/reply", authenticate, requireRole("ROLE_ADMIN"), reviewController.adminDeleteReply);

// ─── Customer (authenticated) ─────────────────────────────────────────────────

reviewRouter.post("/product/:productId", authenticate, reviewController.createReview);

/**
 * @openapi
 * /reviews/{reviewId}:
 *   put:
 *     tags: [Reviews]
 *     summary: Edit my review
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: reviewId, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateReviewInput' }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *   delete:
 *     tags: [Reviews]
 *     summary: Delete my review
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: reviewId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 */
reviewRouter.put("/:reviewId", authenticate, reviewController.updateReview);
reviewRouter.delete("/:reviewId", authenticate, reviewController.deleteOwnReview);
