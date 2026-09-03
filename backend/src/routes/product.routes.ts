import { Router } from "express";
import { authenticate } from "@middleware/auth.middleware";
import { requireRole } from "@middleware/role.middleware";
import * as productController from "@controllers/product.controller";

const router = Router();

// ─── Public ───────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /products/:
 *   get:
 *     tags: [Products]
 *     summary: List products (paginated)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [newest, price_low_high, price_high_low, popular], default: newest }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 */
router.get("/", productController.getAllProducts);

/**
 * @openapi
 * /products/all:
 *   get:
 *     tags: [Products]
 *     summary: List active products (paginated)
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20, maximum: 100 } }
 *       - { in: query, name: sortBy, schema: { type: string, enum: [newest, price_low_high, price_high_low, popular], default: newest } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 */
router.get("/all", productController.getAllProducts);

/**
 * @openapi
 * /products/grouped-by-category:
 *   get:
 *     tags: [Products]
 *     summary: Products grouped by category
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 */
router.get("/grouped-by-category", productController.getProductsGroupedByCategory);

/**
 * @openapi
 * /products/search:
 *   get:
 *     tags: [Products]
 *     summary: Search / filter products
 *     parameters:
 *       - { in: query, name: keyword, schema: { type: string } }
 *       - { in: query, name: categoryId, schema: { type: string, format: uuid } }
 *       - { in: query, name: brandId, schema: { type: string, format: uuid } }
 *       - { in: query, name: gender, schema: { type: string, enum: [MEN, WOMEN, UNISEX, KIDS] } }
 *       - { in: query, name: season, schema: { type: string, enum: [SUMMER, WINTER, MONSOON, ALL_SEASON] } }
 *       - { in: query, name: minPrice, schema: { type: integer } }
 *       - { in: query, name: maxPrice, schema: { type: integer } }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20 } }
 *       - { in: query, name: sortBy, schema: { type: string, enum: [newest, price_low_high, price_high_low, popular] } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 */
router.get("/search", productController.searchProducts);

/**
 * @openapi
 * /products/best-selling:
 *   get:
 *     tags: [Products]
 *     summary: Best-selling products, ranked by total units sold
 *     description: Ranked by actual sales (order items on non-cancelled, payment-committed orders) — distinct from the "popular" sortBy option elsewhere, which proxies via review count.
 *     parameters:
 *       - { in: query, name: limit, schema: { type: integer, default: 10, maximum: 50 } }
 *     responses:
 *       200: { description: "Array of products, each with an added unitsSold field" }
 */
router.get("/best-selling", productController.getBestSellingProducts);

/**
 * @openapi
 * /products/category/{categoryId}:
 *   get:
 *     tags: [Products]
 *     summary: List products in a category (paginated)
 *     parameters:
 *       - { in: path, name: categoryId, required: true, schema: { type: string, format: uuid } }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20 } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 */
router.get("/category/:categoryId", productController.getProductsByCategory);

/**
 * @openapi
 * /products/{productId}:
 *   get:
 *     tags: [Products]
 *     summary: Get a product by id
 *     parameters:
 *       - { in: path, name: productId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get("/:productId", productController.getProductById);

// ─── Admin ────────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /products/add:
 *   post:
 *     tags: [Products]
 *     summary: Create a product (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateProductInput' }
 *     responses:
 *       201: { $ref: '#/components/responses/Success' }
 *       400: { description: "Validation error, incl. discountedPrice > price" }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       409: { description: "A variant SKU already exists" }
 */
router.post("/add", authenticate, requireRole("ROLE_ADMIN"), productController.createProduct);

/**
 * @openapi
 * /products/{productId}:
 *   put:
 *     tags: [Products]
 *     summary: Update a product (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: productId, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateProductInput' }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       400: { description: "Discounted price exceeds price (INVALID_PRICING)" }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   delete:
 *     tags: [Products]
 *     summary: Soft-delete a product (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: productId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.put("/:productId", authenticate, requireRole("ROLE_ADMIN"), productController.updateProduct);
router.delete("/:productId", authenticate, requireRole("ROLE_ADMIN"), productController.deleteProduct);

/**
 * @openapi
 * /products/toggle/{productId}:
 *   patch:
 *     tags: [Products]
 *     summary: Enable/disable a product (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: productId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.patch("/toggle/:productId", authenticate, requireRole("ROLE_ADMIN"), productController.toggleProductDisable);

// ─── Variants (Admin) ─────────────────────────────────────────────────────────

/**
 * @openapi
 * /products/{productId}/variants:
 *   post:
 *     tags: [Products]
 *     summary: Add a variant (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: productId, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/VariantInput' }
 *     responses:
 *       201: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.post("/:productId/variants", authenticate, requireRole("ROLE_ADMIN"), productController.addVariant);

/**
 * @openapi
 * /products/{productId}/variants/{variantId}:
 *   put:
 *     tags: [Products]
 *     summary: Update a variant (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: productId, required: true, schema: { type: string, format: uuid } }
 *       - { in: path, name: variantId, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/VariantInput' }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *   delete:
 *     tags: [Products]
 *     summary: Delete a variant (admin — blocked if used by an order; deactivate instead)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: productId, required: true, schema: { type: string, format: uuid } }
 *       - { in: path, name: variantId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       409: { description: "Variant is used by an order (VARIANT_IN_USE)" }
 */
router.put("/:productId/variants/:variantId", authenticate, requireRole("ROLE_ADMIN"), productController.updateVariant);
router.delete("/:productId/variants/:variantId", authenticate, requireRole("ROLE_ADMIN"), productController.deleteVariant);

export { router as productRouter };
