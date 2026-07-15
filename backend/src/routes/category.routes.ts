import { Router } from "express";
import { authenticate } from "@middleware/auth.middleware";
import { requireRole } from "@middleware/role.middleware";
import * as categoryController from "@controllers/category.controller";

const router = Router();

// Public

/**
 * @openapi
 * /categories/:
 *   get:
 *     tags: [Categories]
 *     summary: List active categories
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 */
router.get("/", categoryController.getAllCategories);

/**
 * @openapi
 * /categories/{categoryId}:
 *   get:
 *     tags: [Categories]
 *     summary: Get a category by id
 *     parameters:
 *       - { in: path, name: categoryId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get("/:categoryId", categoryController.getCategory);

// Admin only

/**
 * @openapi
 * /categories/add:
 *   post:
 *     tags: [Categories]
 *     summary: Create a category (admin — reuses a previously deleted title if any)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateCategoryInput' }
 *     responses:
 *       201: { $ref: '#/components/responses/Success' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.post("/add", authenticate, requireRole("ROLE_ADMIN"), categoryController.createCategory);

/**
 * @openapi
 * /categories/{categoryId}:
 *   put:
 *     tags: [Categories]
 *     summary: Update a category (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: categoryId, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateCategoryInput' }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *   patch:
 *     tags: [Categories]
 *     summary: Toggle category enabled/disabled (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: categoryId, required: true, schema: { type: string, format: uuid } }
 *       - { in: query, name: status, schema: { type: boolean }, description: "true = disable, false = enable" }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.put("/:categoryId", authenticate, requireRole("ROLE_ADMIN"), categoryController.updateCategory);

/**
 * @openapi
 * /categories/{categoryTitle}:
 *   delete:
 *     tags: [Categories]
 *     summary: Soft-delete a category by title (admin — also hides its products)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: categoryTitle, required: true, schema: { type: string } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.delete("/:categoryTitle", authenticate, requireRole("ROLE_ADMIN"), categoryController.deleteCategory);
router.patch("/:categoryId", authenticate, requireRole("ROLE_ADMIN"), categoryController.toggleCategoryDisable);

export { router as categoryRouter };
