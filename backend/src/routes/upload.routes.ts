import { Router } from "express";
import { authenticate } from "@middleware/auth.middleware";
import { requireRole } from "@middleware/role.middleware";
import { presignUpload, presignReviewUpload } from "@controllers/upload.controller";

const router = Router();

/**
 * @openapi
 * /upload/presign:
 *   post:
 *     tags: [Upload]
 *     summary: Get a presigned R2 PUT URL (admin)
 *     description: Returns a short-lived signed URL for a direct browser → Cloudflare R2 upload.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PresignInput' }
 *     responses:
 *       200: { description: "Returns { signedUrl, key, publicUrl }" }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
router.post("/presign", authenticate, requireRole("ROLE_ADMIN"), presignUpload);

/**
 * @openapi
 * /upload/presign-review:
 *   post:
 *     tags: [Upload]
 *     summary: Get a presigned R2 PUT URL for a review photo (any authenticated user)
 *     description: Same as /presign but scoped to the "reviews" folder only — standard users can't write into catalog folders (categories/brands/products).
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PresignReviewInput' }
 *     responses:
 *       200: { description: "Returns { signedUrl, key, publicUrl }" }
 *       400: { $ref: '#/components/responses/ValidationError' }
 */
router.post("/presign-review", authenticate, presignReviewUpload);

export { router as uploadRouter };
