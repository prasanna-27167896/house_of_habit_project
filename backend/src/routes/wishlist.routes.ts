import { Router } from "express";
import { authenticate } from "@middleware/auth.middleware";
import * as wishlistController from "@controllers/wishlist.controller";

const router = Router();

// All wishlist routes require authentication
router.use(authenticate);

/**
 * @openapi
 * /wishlist/:
 *   get:
 *     tags: [Wishlist]
 *     summary: Get my wishlist
 *     description: Returns only products that still exist and are visible (deleted/disabled ones are omitted).
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get("/", wishlistController.getWishlist);

/**
 * @openapi
 * /wishlist/check/{productId}:
 *   get:
 *     tags: [Wishlist]
 *     summary: Check whether a product is in my wishlist
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: productId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 */
router.get("/check/:productId", wishlistController.checkWishlist);

/**
 * @openapi
 * /wishlist/{productId}:
 *   post:
 *     tags: [Wishlist]
 *     summary: Add a product to my wishlist
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: productId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       409: { description: Already in wishlist }
 *   delete:
 *     tags: [Wishlist]
 *     summary: Remove a product from my wishlist
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: productId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.post("/:productId", wishlistController.addToWishlist);
router.delete("/:productId", wishlistController.removeFromWishlist);

export { router as wishlistRouter };
