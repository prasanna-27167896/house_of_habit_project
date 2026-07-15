import { Router } from "express";
import { authenticate } from "@middleware/auth.middleware";
import * as cartController from "@controllers/cart.controller";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /cart/:
 *   get:
 *     tags: [Cart]
 *     summary: Get my cart
 *     description: >
 *       Each item carries an `isAvailable` flag (active variant + visible product + in stock).
 *       `subtotal` counts only available items, and `hasUnavailableItems` is true if any item can't be bought.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *   post:
 *     tags: [Cart]
 *     summary: Add an item to the cart
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/AddToCartInput' }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *   delete:
 *     tags: [Cart]
 *     summary: Clear the cart
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 */
router.get("/", cartController.getCart);
router.post("/", cartController.addToCart);

/**
 * @openapi
 * /cart/items/{cartItemId}:
 *   put:
 *     tags: [Cart]
 *     summary: Update a cart item's quantity
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: cartItemId, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateCartItemInput' }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       400: { description: "Variant inactive, product unavailable, or insufficient stock" }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   delete:
 *     tags: [Cart]
 *     summary: Remove a cart item
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: cartItemId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.put("/items/:cartItemId", cartController.updateCartItem);
router.delete("/items/:cartItemId", cartController.removeFromCart);
router.delete("/", cartController.clearCart);

export { router as cartRouter };
