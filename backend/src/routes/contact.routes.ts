import { Router } from "express";
import { authenticate } from "@middleware/auth.middleware";
import { requireRole } from "@middleware/role.middleware";
import * as contactController from "@controllers/contact.controller";

// ─── Contact Us ───────────────────────────────────────────────────────────────

export const contactRouter = Router();

/**
 * @openapi
 * /contact/:
 *   post:
 *     tags: [Contact]
 *     summary: Submit a contact-us message (public)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SubmitContactInput' }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 */
contactRouter.post("/", contactController.submitContact);

/**
 * @openapi
 * /contact/admin/all:
 *   get:
 *     tags: [Contact]
 *     summary: List contact messages (admin, paginated)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20 } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
contactRouter.get("/admin/all", authenticate, contactController.adminGetAllContacts);

/**
 * @openapi
 * /contact/admin/unresolved:
 *   get:
 *     tags: [Contact]
 *     summary: List unresolved contact messages (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
contactRouter.get("/admin/unresolved", authenticate, requireRole("ROLE_ADMIN"), contactController.adminGetUnresolvedContacts);

/**
 * @openapi
 * /contact/admin/{contactId}/reply:
 *   post:
 *     tags: [Contact]
 *     summary: Reply to a contact message (emails the sender, marks resolved)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: contactId, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ReplyContactInput' }
 *     responses:
 *       200: { description: "Reply emailed and stored; message marked resolved" }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       502: { description: "Reply email failed — not saved, retry (CONTACT_REPLY_EMAIL_FAILED)" }
 */
contactRouter.post("/admin/:contactId/reply", authenticate, requireRole("ROLE_ADMIN"), contactController.adminReplyToContact);

/**
 * @openapi
 * /contact/admin/{contactId}/resolve:
 *   patch:
 *     tags: [Contact]
 *     summary: Mark a contact message resolved (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: contactId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *   delete:
 *     tags: [Contact]
 *     summary: Delete a contact message (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: contactId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 */
contactRouter.patch("/admin/:contactId/resolve", authenticate, requireRole("ROLE_ADMIN"), contactController.adminResolveContact);
contactRouter.delete("/admin/:contactId", authenticate, requireRole("ROLE_ADMIN"), contactController.adminDeleteContact);

// ─── Customer Feedback ────────────────────────────────────────────────────────

export const feedbackRouter = Router();

/**
 * @openapi
 * /feedback/:
 *   post:
 *     tags: [Feedback]
 *     summary: Submit customer feedback (public)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SubmitFeedbackInput' }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 */
feedbackRouter.post("/", contactController.submitFeedback);

/**
 * @openapi
 * /feedback/admin/all:
 *   get:
 *     tags: [Feedback]
 *     summary: List feedback (admin, paginated)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20 } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
feedbackRouter.get("/admin/all", authenticate, requireRole("ROLE_ADMIN"), contactController.adminGetAllFeedback);

/**
 * @openapi
 * /feedback/admin/overview:
 *   get:
 *     tags: [Feedback]
 *     summary: Feedback overview stats (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
feedbackRouter.get("/admin/overview", authenticate, requireRole("ROLE_ADMIN"), contactController.adminGetFeedbackOverview);

/**
 * @openapi
 * /feedback/admin/negative:
 *   get:
 *     tags: [Feedback]
 *     summary: Last 10 negative feedbacks (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
feedbackRouter.get("/admin/negative", authenticate, requireRole("ROLE_ADMIN"), contactController.adminGetNegativeFeedbacks);

/**
 * @openapi
 * /feedback/admin/{feedbackId}:
 *   delete:
 *     tags: [Feedback]
 *     summary: Delete feedback (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: feedbackId, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200: { $ref: '#/components/responses/Success' }
 */
feedbackRouter.delete("/admin/:feedbackId", authenticate, requireRole("ROLE_ADMIN"), contactController.adminDeleteFeedback);
