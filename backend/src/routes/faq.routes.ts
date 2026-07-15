import { Router } from "express";
import { authenticate } from "@middleware/auth.middleware";
import { requireRole } from "@middleware/role.middleware";
import * as faqController from "@controllers/faq.controller";

// ─── FAQs ─────────────────────────────────────────────────────────────────────

export const faqRouter = Router();

/**
 * @openapi
 * /faqs/:
 *   get:
 *     tags: [FAQs]
 *     summary: List active FAQs (public)
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *   post:
 *     tags: [FAQs]
 *     summary: Create an FAQ (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateFaqInput' }
 *     responses:
 *       201: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
faqRouter.get("/", faqController.getActiveFaqs);
faqRouter.post("/", authenticate, requireRole("ROLE_ADMIN"), faqController.adminCreateFaq);

/**
 * @openapi
 * /faqs/admin/all:
 *   get:
 *     tags: [FAQs]
 *     summary: List all FAQs incl. inactive (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
faqRouter.get("/admin/all", authenticate, requireRole("ROLE_ADMIN"), faqController.adminGetAllFaqs);

/**
 * @openapi
 * /faqs/{faqId}:
 *   put:
 *     tags: [FAQs]
 *     summary: Update an FAQ (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: faqId, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateFaqInput' }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *   delete:
 *     tags: [FAQs]
 *     summary: Delete an FAQ (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: faqId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 */
faqRouter.put("/:faqId", authenticate, requireRole("ROLE_ADMIN"), faqController.adminUpdateFaq);
faqRouter.delete("/:faqId", authenticate, requireRole("ROLE_ADMIN"), faqController.adminDeleteFaq);

/**
 * @openapi
 * /faqs/{faqId}/toggle:
 *   patch:
 *     tags: [FAQs]
 *     summary: Toggle an FAQ active/inactive (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: faqId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 */
faqRouter.patch("/:faqId/toggle", authenticate, requireRole("ROLE_ADMIN"), faqController.adminToggleFaq);

// ─── Store Info ───────────────────────────────────────────────────────────────

export const storeInfoRouter = Router();

/**
 * @openapi
 * /store-info/:
 *   get:
 *     tags: [Store Info]
 *     summary: Get store info (public)
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       404: { description: Store info not configured }
 *   put:
 *     tags: [Store Info]
 *     summary: Create/update store info (admin, singleton)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpsertStoreInfoInput' }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
storeInfoRouter.get("/", faqController.getStoreInfo);
storeInfoRouter.put("/", authenticate, requireRole("ROLE_ADMIN"), faqController.adminUpsertStoreInfo);
