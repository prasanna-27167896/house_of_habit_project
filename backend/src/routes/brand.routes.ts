import { Router } from "express";
import { authenticate } from "@middleware/auth.middleware";
import { requireRole } from "@middleware/role.middleware";
import * as brandController from "@controllers/brand.controller";

const router = Router();

// Public

/**
 * @openapi
 * /brands/:
 *   get:
 *     tags: [Brands]
 *     summary: List all brands
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 */
router.get("/", brandController.getAllBrands);

/**
 * @openapi
 * /brands/category/{categoryId}:
 *   get:
 *     tags: [Brands]
 *     summary: List brands in a category
 *     parameters:
 *       - { in: path, name: categoryId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 */
router.get("/category/:categoryId", brandController.getBrandsByCategory);

/**
 * @openapi
 * /brands/{brandId}:
 *   get:
 *     tags: [Brands]
 *     summary: Get a brand by id
 *     parameters:
 *       - { in: path, name: brandId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get("/:brandId", brandController.getBrandById);

// Admin only

/**
 * @openapi
 * /brands/add:
 *   post:
 *     tags: [Brands]
 *     summary: Create a brand (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateBrandInput' }
 *     responses:
 *       201: { $ref: '#/components/responses/Success' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.post("/add", authenticate, requireRole("ROLE_ADMIN"), brandController.createBrand);

/**
 * @openapi
 * /brands/update/{brandId}:
 *   put:
 *     tags: [Brands]
 *     summary: Update a brand (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: brandId, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateBrandInput' }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.put("/update/:brandId", authenticate, requireRole("ROLE_ADMIN"), brandController.updateBrand);

/**
 * @openapi
 * /brands/delete/{brandId}:
 *   delete:
 *     tags: [Brands]
 *     summary: Delete a brand (admin — detaches it from products)
 *     description: >
 *       Products keep existing; their brand is set to null. The response includes
 *       `affectedProducts` (count) and a warning message so the admin knows how
 *       many products were affected.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: brandId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { description: "Deleted. Returns { message, affectedProducts }" }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.delete("/delete/:brandId", authenticate, requireRole("ROLE_ADMIN"), brandController.deleteBrand);

export { router as brandRouter };
